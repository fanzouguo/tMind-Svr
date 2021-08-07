"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { tEcho } = require('tmind-core');
const os = require('os');
const fs = require('fs-extra');
const PathMgr = require('./PathMgr');
const iconv = require('iconv-lite');
const childProcess = require('child_process');
const cmdExecer = (cmd, exitOnUnsupport = true) => {
    return new Promise((resolve, reject) => {
        const encoding = 'cp936';
        const binaryEncoding = 'binary';
        childProcess.exec(cmd, {
            encoding: binaryEncoding
        }, (err, stdout, stderr) => {
            if (err) {
                tEcho('命令行执行失败，详情如下：', '异常', 'ERR');
                tEcho(err, '', 'ERR');
                if (exitOnUnsupport) {
                    process.exit(1);
                }
                else {
                    reject(err);
                }
            }
            else {
                const buff1 = iconv.decode(Buffer.from(stdout, binaryEncoding), encoding);
                const buff2 = iconv.decode(Buffer.from(stderr, binaryEncoding), encoding);
                if (buff2) {
                    reject(buff2);
                }
                else {
                    resolve(buff1);
                }
            }
        });
    });
};
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
const getCnfSvr = (ipStr) => {
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
    static execCmd(exitOnUnsupport = true, ...cmdArr) {
        for (const v of cmdArr) {
            cmdExecer(v, exitOnUnsupport);
        }
    }
    static getSvrIp() {
        const interfaces = os.networkInterfaces();
        const _obj = {
            Main: '',
            IPv4: {},
            IPv6: {}
        };
        const ifaceArr = Object.entries(interfaces);
        for (const v of ifaceArr) {
            const [a, b] = v;
            const tag = a.toLowerCase();
            for (const vItem of b) {
                if (vItem.family === 'IPv4') {
                    if (tag === 'wlan') {
                        _obj.Main = vItem.address;
                    }
                    else if (tag === 'eth0') {
                        _obj.Main = vItem.address;
                    }
                    else if (tag === 'eno1') {
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
                }
                else if (vItem.family === 'IPv6') {
                    _obj.IPv6[aStr].push(vItem);
                }
            }
        }
        return _obj;
    }
    static creatSSL(appDir, ident, svrIp) {
        try {
            const currPath = new PathMgr(appDir);
            const _destPath = currPath.getPath('cert');
            const _destPathTemp = os.tmpdir().replace(/\\\\|\\/g, '/');
            const fName = ident;
            const fNameCnfClient = `${_destPathTemp}/${fName}-ca.cnf`;
            const fNameKeyClient = `${_destPathTemp}/${fName}-key.pem`;
            const fNameCsrClient = `${_destPathTemp}/${fName}-csr.pem`;
            const fNameCertClient = `${_destPathTemp}/${fName}-cert.pem`;
            const fNameCrtClient = currPath.getPath('cert', `${fName}-cert.crt`);
            const fNameCnfSvr = `${_destPathTemp}/${fName}-ca-svr.cnf`;
            const fNameKeySvr = currPath.getPath('cert', `${fName}-svr-key.pem`);
            const fNameCsrSvr = `${_destPathTemp}/${fName}-svr-csr.pem`;
            const fNameCertSvr = currPath.getPath('cert', `${fName}-svr-cert.pem`);
            fs.writeFileSync(fNameCnfClient, getCnfClient());
            fs.writeFileSync(fNameCnfSvr, getCnfSvr(svrIp ?? this.getSvrIp().Main));
            const cmdArr = [
                `cd ${_destPath}`,
                `openssl genrsa -out ${fNameKeyClient} -des 2048`,
                `openssl req -new -config ${fNameCnfClient} -key ${fNameKeyClient} -out ${fNameCsrClient}`,
                `openssl x509 -req -extfile ${fNameCnfClient} -extensions v3_req -days 7300 -in ${fNameCsrClient} -signkey ${fNameKeyClient} -out ${fNameCertClient}`,
                `openssl x509 -outform der -in ${fNameCertClient} -out ${fNameCrtClient}`,
                `openssl genrsa -out ${fNameKeySvr} 2048`,
                `openssl req -new -config ${fNameCnfSvr} -key ${fNameKeySvr} -out ${fNameCsrSvr}`,
                `openssl x509 -req -CA ${fNameCertClient} -CAkey ${fNameKeyClient} -CAcreateserial -extfile ${fNameCnfSvr} -extensions v3_req -days 3650 -in ${fNameCsrSvr} -out ${fNameCertSvr}`,
                `cd ${currPath.appPath}`
            ];
            this.execCmd(true, ...cmdArr);
        }
        catch (err) {
            tEcho('SSL文件构造失败，详情如下：', '失败', 'err');
            tEcho(err, '', 'err');
        }
    }
}
module.exports = SvrUtil;
//# sourceMappingURL=SvrUtil.js.map