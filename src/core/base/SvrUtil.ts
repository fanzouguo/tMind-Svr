import type { IipInfo } from '../../types';
import { tEcho } from 'tmind-core';
import PathMgr from './PathMgr';
const os = require('os');
const fs = require('fs-extra');
const iconv = require('iconv-lite');
const childProcess = require('child_process');

/** 执行命令行语句
 * @param cmd 要执行的语句
 * @param exitOnUnsupport 若该函数不受当前操作系统支持，是否强制终止应用程序，默认为 TRUE
 */
const cmdExecer = (cmd: string, exitOnUnsupport = true) => {
  return new Promise((resolve, reject) => {
    const encoding = 'cp936';
    const binaryEncoding = 'binary';
    childProcess.exec(cmd, {
      encoding: binaryEncoding
    }, (err: Error, stdout: any, stderr: any) => {
      if (err) {
				tEcho('命令行执行失败，详情如下：', '异常', 'ERR');
				tEcho(err, '', 'ERR');
        if (exitOnUnsupport) {
          process.exit(1);
        } else {
          reject(err);
        }
      } else {
        const buff1 = iconv.decode(Buffer.from(stdout, binaryEncoding), encoding);
        const buff2 = iconv.decode(Buffer.from(stderr, binaryEncoding), encoding);
        if (buff2) {
          reject(buff2);
        } else {
          resolve(buff1);
        }
      }
    });
  });
};

/** 客户端 SSL 的.cnf 文件模版
 *
 * @returns
 */
const getCnfClient = () => {
	return `#ca.cnf
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req

[req_distinguished_name]
countryName = Country Name (2 letter code)
countryName_default = CN
stateOrProvinceName = State or Province Name (full name)
stateOrProvinceName_default = ShangHai
localityName = Locality Name (eg, city)
localityName_default = ShangHai
organizationalUnitName  = Organizational Unit Name (eg, section)
organizationalUnitName_default  = smpoo
commonName = smpoo root CA
commonName_max  = 64

[ v3_req ]
# Extensions to add to a certificate request
subjectKeyIdentifier = hash
#authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical,CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign`;
};

/** 客户端 SSL 的.cnf 文件模版
 *
 * @param ipStr 要授权的IP地址
 * @returns
 */
const getCnfSvr = (ipStr: string) => {
	return `[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req

[req_distinguished_name]
countryName = Country Name (2 letter code)
countryName_default = CN
stateOrProvinceName = State or Province Name (full name)
stateOrProvinceName_default = ShangHai
localityName = Locality Name (eg, city)
localityName_default = ShangHai
organizationalUnitName  = Organizational Unit Name (eg, section)
organizationalUnitName_default  = smpoo
commonName = smpoo node server
commonName_max  = 64

[ v3_req ]
# Extensions to add to a certificate request
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer:always
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
# 注意这个IP.1的设置，IP地址需要和服务器的监听地址一样
IP.1 = ${ipStr}
IP.2 = 127.0.0.1`;
};

class SvrUtil {
	/** 执行命令行语句
	 * @param exitOnUnsupport 若该函数不受当前操作系统支持，是否强制终止应用程序，默认为 TRUE
	 * @param cmdArr 要执行的语句集合
	 */
	static execCmd(exitOnUnsupport = true, ...cmdArr: string[]): void {
		for (const v of cmdArr) {
			cmdExecer(v, exitOnUnsupport);
		}
	}

	/** 获取本文件运行环境所代表的服务端本机IP信息集合
	 *
	 * @returns
	 */
	static getSvrIp(): IipInfo {
		const interfaces = os.networkInterfaces();
		const _obj: IipInfo = {
			Main: '',
			IPv4: {},
			IPv6: {}
		};
		const ifaceArr = Object.entries(interfaces);
		for (const v of ifaceArr) {
			const [a, b] = v;
			const tag = a.toLowerCase();
			// @ts-ignore
			for (const vItem of b) {
				if (vItem.family === 'IPv4') {
					if (tag === 'wlan') {
						_obj.Main = vItem.address;
					} else if (tag === 'eth0') {
						_obj.Main = vItem.address;
					} else if (tag === 'eno1') {
						_obj.Main = vItem.address;
					}
				}
				const aStr = `${a}`;
				if (!_obj.IPv4[aStr]) {
					_obj.IPv4[aStr] = [];
				}
				if (!_obj.IPv6[a]) {
					_obj.IPv6[aStr] = [];
				}
				if (vItem.family === 'IPv4') {
					_obj.IPv4[aStr].push(vItem);
				} else if (vItem.family === 'IPv6') {
					_obj.IPv6[aStr].push(vItem);
				}
			}
		}
		return _obj;
	}

	/** 创建 SSL 文件
	 *
	 * @param appDir 服务端实例主程序所在路径(__dirname)
	 * @param ident 服务端实例标识
	 * @param svrIp 要授权许可的IP地址
	 */
	static creatSSL(appDir: string, ident: string, svrIp?: string): void {
		try {
			const currPath = new PathMgr(appDir);
			// 存放 SSL 文件的目标路径
			const _destPath = currPath.getPath('cert');
			// 当前系统内置临时文件夹
			const _destPathTemp = os.tmpdir().replace(/\\\\|\\/g, '/');
			const fName = ident;
			// 客户端SSL文件
			const fNameCnfClient = `${_destPathTemp}/${fName}-ca.cnf`;
			const fNameKeyClient = `${_destPathTemp}/${fName}-key.pem`;
			const fNameCsrClient = `${_destPathTemp}/${fName}-csr.pem`;
			const fNameCertClient = `${_destPathTemp}/${fName}-cert.pem`;
			const fNameCrtClient = currPath.getPath('cert', `${fName}-cert.crt`);
			// 服务端SSL文件
			const fNameCnfSvr = `${_destPathTemp}/${fName}-ca-svr.cnf`;
			const fNameKeySvr = currPath.getPath('cert', `${fName}-svr-key.pem`);
			const fNameCsrSvr = `${_destPathTemp}/${fName}-svr-csr.pem`;
			const fNameCertSvr = currPath.getPath('cert', `${fName}-svr-cert.pem`);

			fs.writeFileSync(fNameCnfClient, getCnfClient());
			fs.writeFileSync(fNameCnfSvr, getCnfSvr(svrIp ?? this.getSvrIp().Main));
			const cmdArr: string[] = [
				`cd ${_destPath}`,
				// 生成CA的私钥
				`openssl genrsa -out ${fNameKeyClient} -des 2048`,
				// 通过私钥生成证书请求csr
				`openssl req -new -config ${fNameCnfClient} -key ${fNameKeyClient} -out ${fNameCsrClient}`,
				// 通过CSR文件和私钥生成CA证书
				`openssl x509 -req -extfile ${fNameCnfClient} -extensions v3_req -days 7300 -in ${fNameCsrClient} -signkey ${fNameKeyClient} -out ${fNameCertClient}`,
				// 转换证书的格式
				`openssl x509 -outform der -in ${fNameCertClient} -out ${fNameCrtClient}`,
				// 创建服务器私钥
				`openssl genrsa -out ${fNameKeySvr} 2048`,
				// 创建服务器证书请求csr
				`openssl req -new -config ${fNameCnfSvr} -key ${fNameKeySvr} -out ${fNameCsrSvr}`,
				// 使用根证书颁发服务器证书
				`openssl x509 -req -CA ${fNameCertClient} -CAkey ${fNameKeyClient} -CAcreateserial -extfile ${fNameCnfSvr} -extensions v3_req -days 3650 -in ${fNameCsrSvr} -out ${fNameCertSvr}`,
				`cd ${currPath.appPath}`
			];
			this.execCmd(true, ...cmdArr);
		} catch (err) {
			tEcho('SSL文件构造失败，详情如下：', '失败', 'ERR');
			tEcho(err, '', 'ERR');
		}
	}
}

export default SvrUtil;
