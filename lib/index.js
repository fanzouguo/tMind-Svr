/*!
* tMind-Svr v2.2.22
* (c) 2021-2022  Smpoo soft Co. Shanghai China
* Released under the MIT License.
* Author: David
* CreateDate: 2021-03-05
* LastBuild: 2021-08-12 01:55:31
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('tmind-core'), require('ws')) :
	typeof define === 'function' && define.amd ? define(['exports', 'tmind-core', 'ws'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.tmindSvr = {}, global.tmindCore, global.WebSocket));
}(this, (function (exports, tmindCore, WebSocket) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);

	/** 终止服务启动
	 * @param msg 控制台回显信息
	 * @code 终止代码：0、license校验失败，1、配置文件集成失败，2、服务端程序启动运行异常
	 */
	var terminat = (msg, title, code = 1) => {
	    tmindCore.tEcho(msg || '', title || '', 'ERR');
	    process.exit(code);
	};

	const fs$2 = require('fs-extra');
	const LICENSE_PATH = '.license';
	const MSG_TERMINATE = '配置缺失';
	const MSG_BOOT_ERR = '启动失败';
	const KEYS = {
	    G: 0,
	    K: 1,
	    A: 2,
	    Z: 3,
	    H: 4,
	    J: 5,
	    E: 6,
	    Y: 7,
	    Q: 8,
	    X: 9
	};
	const checkLicense = (currPath, ident) => {
	    try {
	        const _strLicense = fs$2.readFileSync(currPath.getPath('license', 'key')).toString();
	        if (!_strLicense)
	            terminat(MSG_TERMINATE, MSG_BOOT_ERR, 0);
	        return (_strLicense.split(/\r\n|\n/)[0].split(':')[1].split('0IO').map((v) => parseInt(v.split('').map(vKey => KEYS[vKey]).join('')))).decodeToStr() === ident;
	    }
	    catch (err) {
	        terminat(MSG_TERMINATE, MSG_BOOT_ERR, 0);
	        return false;
	    }
	};
	const getUintConf = () => {
	    return {
	        id: -1,
	        ident: '',
	        namezh: '',
	        memo: '',
	        addr: '',
	        port: 0,
	        prefix: false,
	        corsed: false,
	        appendCorsHeader: [],
	        disableMethods: [],
	        corsWhiteList: [],
	        schedule: '* * * * * *',
	        linkToDb: false
	    };
	};
	const getWebSocketUrl = (addr, port) => {
	    return `ws://${addr}:${port}`;
	};
	/** 初始化服务配置清单
	 */
	var preConf = (currPath) => {
	    try {
	        const rootPath = currPath.getPath('conf');
	        const _arr = fs$2.readdirSync(rootPath);
	        if (!_arr.includes(LICENSE_PATH)) {
	            return terminat('授权文件缺失', MSG_BOOT_ERR, 0);
	        }
	        else {
	            const pjIdent = currPath.rootForlder;
	            checkLicense(currPath, pjIdent);
	            const _obj = {
	                id: '',
	                ident: '',
	                namezh: '',
	                addr: '',
	                cert: {
	                    key: '',
	                    pem: ''
	                },
	                secretKey: '',
	                ver: '1.0.0',
	                isDev: (process.env.NODE_ENV || '').toLowerCase() === 'dev',
	                loggerUrl: '',
	                dbUrl: '',
	                unit: {}
	            };
	            let i = 1;
	            let tempObj = {};
	            for (const v of _arr) {
	                if (v.endsWith('.js')) {
	                    const objFile = require(`${rootPath}/${v}`);
	                    if (v === '.index.js') {
	                        _obj.id = objFile.id;
	                        _obj.ident = pjIdent;
	                        _obj.namezh = objFile.namezh || terminat('工程名称配置项不允许为空', MSG_BOOT_ERR, 1);
	                        _obj.addr = objFile.addr.map((v) => v || 'localhost')[_obj.isDev ? 0 : 1];
	                        _obj.secretKey = objFile.secretKey || terminat('加盐码不能为空', MSG_BOOT_ERR, 1);
	                    }
	                    else {
	                        const _objUnit = getUintConf();
	                        const { id, ident, namezh, memo, addr, port, prefix, corsed, appendCorsHeader, disableMethods, corsWhiteList, schedule, linkToDb, ...otherConf } = objFile;
	                        _objUnit.id = (!id || tempObj[`${id}`]) ? i : parseInt(objFile.id);
	                        _objUnit.ident = v.replace(/Conf.js/g, '').replace(/^\./, '');
	                        _objUnit.namezh = namezh;
	                        _objUnit.memo = memo;
	                        _objUnit.addr = addr.map((v) => v || 'localhost')[_obj.isDev ? 0 : 1];
	                        // _objUnit.port = ((typeof port === 'number') && [port, port]) || ((Array.isArray(port)) && port);
	                        _objUnit.port = port;
	                        _objUnit.prefix = prefix ?? false;
	                        _objUnit.corsed = corsed ?? false;
	                        _objUnit.appendCorsHeader = appendCorsHeader || [];
	                        _objUnit.disableMethods = disableMethods || [];
	                        _objUnit.corsWhiteList = corsWhiteList || [];
	                        _objUnit.schedule = schedule || '* * * * * *';
	                        // 强制禁止 dbConf 配置为访问自身
	                        _objUnit.linkToDb = (_objUnit.ident === 'db') ? false : !!(linkToDb);
	                        for (const kConf in otherConf) {
	                            _objUnit[kConf] = otherConf[kConf];
	                        }
	                        _obj.unit[_objUnit.ident] = _objUnit;
	                        tempObj[`${_objUnit.id}`] = ident;
	                        i++;
	                    }
	                }
	                else if (v === '.cert') {
	                    const _arrCert = fs$2.readdirSync(currPath.getPath('cert'));
	                    for (const vCert of _arrCert) {
	                        const fPath = currPath.getPath('cert', vCert);
	                        if (vCert.startsWith('local')) {
	                            _obj.cert.ca = [fs$2.readFileSync(fPath)];
	                        }
	                        else if (vCert.includes('key')) {
	                            _obj.cert.key = fs$2.readFileSync(fPath);
	                        }
	                        else if (vCert.includes('cert')) {
	                            _obj.cert.cert = fs$2.readFileSync(fPath);
	                        }
	                    }
	                }
	            }
	            if (!_obj?.unit?.log)
	                tempObj = null;
	            if (!_obj.unit?.log?.addr) {
	                terminat('日志服务配置缺少 addr 参数', MSG_BOOT_ERR, 1);
	            }
	            else if (!_obj.unit?.log?.port) {
	                terminat('日志服务配置必须存在 port 参数，且不能为 0 或空', MSG_BOOT_ERR, 1);
	            }
	            else {
	                _obj.loggerUrl = `ws://${_obj.unit.log.addr}:${_obj.unit.log.port}`;
	            }
	            if (!_obj.unit?.db?.addr) {
	                terminat('主业务数据库服务配置缺少 addr 参数', MSG_BOOT_ERR, 1);
	            }
	            else if (!_obj.unit?.db?.port) {
	                terminat('日志服务配置必须存在 port 参数，且不能为 0 或空', MSG_BOOT_ERR, 1);
	            }
	            else {
	                _obj.dbUrl = getWebSocketUrl(_obj.unit.db.addr, _obj.unit.db.port);
	            }
	            return _obj;
	        }
	    }
	    catch (err) {
	        return terminat('服务配置文件丢失或读取异常', MSG_BOOT_ERR, 1);
	    }
	};

	const path = require('path');
	const fs$1 = require('fs-extra');
	const glob = require('glob-all');
	const PATH_CONF = '../../.config';
	const PATH_LOG = '../../.data/logs';
	const PATH_SCRIPT = '../../.script';
	const PATH_CERT = '../../.config/.cert';
	const PATH_LICENSE = '../../.config/.license';
	const PATH_ROUTER = '@handler';
	const PATH_TASK = '@task';
	const fmtPath = (pathStr) => pathStr.replace(/\\\\|\\/g, '/');
	class PathMgr {
	    /** 启动文件（JS或TS）所在的当前路径
	     *
	     * @param appDir
	     */
	    constructor(appDir) {
	        this.#basePath = fmtPath(process.cwd());
	        this.#appPath = fmtPath(appDir);
	    }
	    #basePath;
	    #appPath;
	    /** 获取工程实例所在基地址的文件夹名称
	     *
	     */
	    get rootForlder() {
	        return path.parse(this.rootPath).base;
	    }
	    /** 获取工程实例所在基地址
	     *
	     */
	    get rootPath() {
	        return fmtPath(path.resolve(this.#basePath, '../..'));
	    }
	    /** 获取服务实例所在根地址的文件夹名称
	     *
	     */
	    get svrForlder() {
	        return path.parse(this.#basePath).base;
	    }
	    /** 获取服务实例根地址
	     *
	     */
	    get svrPath() {
	        return this.#basePath;
	    }
	    /** 获取启动文件所在的文件夹名称
	     *
	     */
	    get appForlder() {
	        return path.parse(this.#appPath).base;
	    }
	    /** 获取启动文件所在的路径
	     *
	     */
	    get appPath() {
	        return this.#appPath;
	    }
	    /** 获取配置文件根地址
	     *
	     */
	    get pathConf() {
	        return fmtPath(path.resolve(this.#basePath, PATH_CONF));
	    }
	    /** 获取日志文件根地址
	     *
	     */
	    get pathLog() {
	        return fmtPath(path.resolve(this.#basePath, PATH_LOG));
	    }
	    /** 获取脚本文件根地址
	     *
	     */
	    get pathScript() {
	        return fmtPath(path.resolve(this.#basePath, PATH_SCRIPT));
	    }
	    /** 获取外置定时任务脚本根地址
	     *
	     */
	    get pathTask() {
	        return fmtPath(path.resolve(this.#appPath, PATH_TASK));
	    }
	    /** 获取外置定时任务脚本根地址
	     *
	     */
	    get pathRouter() {
	        return fmtPath(path.resolve(this.#appPath, PATH_ROUTER));
	    }
	    /** 获取本服务实例中所需的地址构造
	     *
	     * @param pathType 地址类型
	     * @param suffix 基于服务实例根地址的其他路径后缀
	     */
	    getPath(pathType, ...suffix) {
	        const preStr = (pathType === 'conf' && PATH_CONF) ||
	            (pathType === 'logs' && PATH_LOG) ||
	            (pathType === 'script' && PATH_SCRIPT) ||
	            (pathType === 'cert' && PATH_CERT) ||
	            (pathType === 'license' && PATH_LICENSE) ||
	            (pathType === 'router' && PATH_ROUTER) ||
	            (pathType === 'task' && PATH_TASK) ||
	            '';
	        return fmtPath(path.resolve((pathType === 'router' || pathType === 'task') ?
	            this.#appPath :
	            this.#basePath, preStr, suffix.join('/')));
	    }
	    /** 确认路径是否存在，如果不存在，则创建
	     * @param pathStr 要判断的路径字符串
	     */
	    prePath(pathStr) {
	        fs$1.ensure(pathStr);
	    }
	    /** 判断指定路径的文件是否存在
	     *
	     * @param pathStr 要判断的文件全路径
	     * @returns
	     */
	    isExist(pathStr) {
	        return !!(glob.sync(pathStr).length);
	    }
	    /** 调用 nodejs:path的 parse方法
	     *
	     * @param pathStr 要解析的路径
	     * @returns
	     */
	    parse(pathStr) {
	        return path.parse(pathStr);
	    }
	}

	const schedule = require('node-schedule');
	const NULL_SCHEDULE = '* * * * * *';
	const runner = (ident, roleObj, cb) => {
	    schedule.scheduleJob(ident, roleObj, () => {
	        if (typeof cb === 'function') {
	            cb();
	        }
	    });
	};
	class SvrTimeTask {
	    /** 初始化构造
	     *
	     * @param currPath 服务实例的地址管理器
	     * @param conf 服务实例的配置管理器
	     */
	    constructor(currPath, conf) {
	        this.#ident = currPath.svrForlder;
	        this.#role = conf.unit[this.#ident]?.schedule || NULL_SCHEDULE;
	        this.#taskList = [];
	        const taskPath = currPath.getPath('task');
	        if (currPath.isExist(`${taskPath}/index.?s`)) {
	            this.#taskList.push(require(taskPath));
	        }
	    }
	    #ident;
	    #role;
	    #taskList;
	    /** 预储备定时任务队列
	     *
	     * @param immediately 储备完成后是否立即开始定时任务调度
	     * @param taskUnit 要储备的定时任务
	     */
	    prepare(...taskUnit) {
	        for (const v of taskUnit) {
	            if (Array.isArray(v)) {
	                this.#taskList.push(...v);
	            }
	            else if (typeof v === 'function') {
	                this.#taskList.push(v);
	            }
	        }
	    }
	    /** 开始执行定时任务调度
	     *
	     */
	    start() {
	        if (this.#role !== NULL_SCHEDULE && this.#taskList.length) {
	            for (const v of this.#taskList) {
	                if (typeof v === 'function') {
	                    runner(this.#ident, this.#role, v);
	                }
	                else if (typeof v === 'object') {
	                    // @ts-ignore
	                    const _schedule_ = v?.schedule;
	                    // @ts-ignore
	                    if (_schedule_ && v.func && typeof v.func === 'function') {
	                        // @ts-ignore
	                        runner(this.#ident, _schedule_, v.func);
	                    }
	                }
	            }
	        }
	    }
	    /** 停止定时任务调度器
	     *
	     */
	    stop() {
	        // schedule.cancel();
	    }
	}

	const os = require('os');
	const fs = require('fs-extra');
	const iconv = require('iconv-lite');
	const childProcess = require('child_process');
	/** 执行命令行语句
	 * @param cmd 要执行的语句
	 * @param exitOnUnsupport 若该函数不受当前操作系统支持，是否强制终止应用程序，默认为 TRUE
	 */
	const cmdExecer = (cmd, exitOnUnsupport = true) => {
	    return new Promise((resolve, reject) => {
	        const encoding = 'cp936';
	        const binaryEncoding = 'binary';
	        childProcess.exec(cmd, {
	            encoding: binaryEncoding
	        }, (err, stdout, stderr) => {
	            if (err) {
	                tmindCore.tEcho('命令行执行失败，详情如下：', '异常', 'ERR');
	                tmindCore.tEcho(err, '', 'ERR');
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
	    /** 执行命令行语句
	     * @param exitOnUnsupport 若该函数不受当前操作系统支持，是否强制终止应用程序，默认为 TRUE
	     * @param cmdArr 要执行的语句集合
	     */
	    static execCmd(exitOnUnsupport = true, ...cmdArr) {
	        for (const v of cmdArr) {
	            cmdExecer(v, exitOnUnsupport);
	        }
	    }
	    /** 获取本文件运行环境所代表的服务端本机IP信息集合
	     *
	     * @returns
	     */
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
	            // @ts-ignore
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
	    /** 创建 SSL 文件
	     *
	     * @param appDir 服务端实例主程序所在路径(__dirname)
	     * @param ident 服务端实例标识
	     * @param svrIp 要授权许可的IP地址
	     */
	    static creatSSL(appDir, ident, svrIp) {
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
	            const cmdArr = [
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
	        }
	        catch (err) {
	            tmindCore.tEcho('SSL文件构造失败，详情如下：', '失败', 'ERR');
	            tmindCore.tEcho(err, '', 'ERR');
	        }
	    }
	}

	const EventEmitter = require('events');
	const rq = require('request-promise');
	class SvrBase extends EventEmitter {
	    constructor(appDir) {
	        super();
	        this.showLog = false;
	        this.pathMgr = new PathMgr(appDir);
	        this.ident = this.pathMgr.svrForlder.replace(/Svr/, '');
	        this.configAll = preConf(this.pathMgr);
	        this.config = this.configAll.unit[this.ident];
	        this.#TimeTask = new SvrTimeTask(this.pathMgr, this.configAll);
	        this.#isPause = false;
	        this.onSSL = !!(this.configAll.cert.key);
	        this.#timTaskStoped = false;
	        process.on('SIGINT', (e) => {
	            const msg = `${this.config.namezh}服务已被强制终止`;
	            if (this.config.ident !== 'log') {
	                this.setWarn(msg, 12001 /* Svr_Stoped */, -1, 'stop');
	            }
	            tmindCore.tEcho(msg, '警告！', 'WARN');
	            process.exit(0);
	        });
	        // 非请求响应的异常处理
	        this.on('error', (err) => {
	            this.setErr(err, 13006 /* Svr_Catch_Err */, -1, '监听到异常');
	        });
	        process.on('uncaughtException', (err) => {
	            this.setErr(err, 13007 /* Svr_UnCatch_Err */, -1, '未捕获的异常');
	        });
	        process.on('unhandledRejection', (err) => {
	            this.setErr(err, 13008 /* Svr_UnHandled_Reject */, -1, '未捕获的Reject');
	        });
	        this.#logger = new WebSocket__default['default'](this.configAll.loggerUrl);
	        this.#logger.on('open', () => {
	            this.setLogInfo('日志服务已连接', 11101 /* Svr_Boot */, -1, 'boot');
	        });
	        this.#logger.on('close', () => {
	            this.exit('日志服务已终止，本服务也将随之终止.');
	        });
	        this.#logger.on('error', (err) => {
	            if (err.code === 'ECONNREFUSED') {
	                this.exit('由于日志服务连接失败，服务终止了启动');
	            }
	            this.exit('日志写入失败，本服务也将随之终止.');
	        });
	    }
	    #TimeTask;
	    // 是否处于暂停状态
	    #isPause;
	    #timTaskStoped;
	    #logger;
	    get paused() {
	        return this.#isPause;
	    }
	    /** 为服务端实例预置定时任务
	     *
	     * @param taskUnit 定时任务集合
	     */
	    setTimeTask(...taskUnit) {
	        this.#TimeTask.prepare(...taskUnit);
	    }
	    /** 创建INFO类日志
	     * @param msg 要写入日志的信息文本
	     * @param currLogType 当前日志信息的自定义类型
	     * @param reqId 触发该日志的请求ID
	     * @param tag 日志标签
	     * @param title 控制台显示时采用的标题
	     */
	    setInfo(msg, currLogType, reqId, tag, title, msgType = 'INFO') {
	        if (msgType === 'INFO' || msgType === 'SUCC') {
	            if (this.#logger) {
	                const _infoObj = {
	                    logId: reqId || -1,
	                    from: this.config.namezh,
	                    tag: tag || '',
	                    name: '',
	                    message: msg,
	                    type: msgType,
	                    level: currLogType || 11000 /* Normal_Info */
	                };
	                this.#logger.send(JSON.stringify(_infoObj), (err) => {
	                    if (err) {
	                        this.exit('日志写入失败，服务已终止，请确保日志服务运行正常');
	                    }
	                });
	                if (this.showLog) {
	                    tmindCore.tEcho(msg, title || '信息', msgType);
	                }
	            }
	        }
	        else {
	            tmindCore.tEcho('setInfo的msgType类型取值只能为：INFO | SUCC', '代码级错误', 'ERR');
	        }
	    }
	    /** 创建WARN类日志
	     * @param msg 要写入日志的信息文本
	     * @param currLogType 当前日志信息的自定义类型
	     * @param reqId 触发该日志的请求ID
	     * @param tag 日志标签
	     */
	    setWarn(msg, currLogType, reqId, tag) {
	        if (this.#logger) {
	            const _warnObj = {
	                logId: reqId || -1,
	                from: this.config.namezh,
	                tag: tag || '',
	                name: '',
	                message: msg,
	                type: 'WARN',
	                level: currLogType || 12000 /* Normal_Warn */
	            };
	            this.#logger.send(JSON.stringify(_warnObj), (err) => {
	                if (err) {
	                    this.exit('日志写入失败，服务已终止，请确保日志服务运行正常');
	                }
	            });
	            if (this.showLog) {
	                tmindCore.tEcho(msg, '警告', 'WARN');
	            }
	        }
	    }
	    /** 创建ERR类日志
	     * @param msg 要写入日志的信息文本
	     * @param currLogType 当前日志信息的自定义类型
	     * @param reqId 触发该日志的请求ID
	     * @param tag 日志标签
	     */
	    setErr(err, currLogType, reqId, tag) {
	        if (this.#logger) {
	            const isErr = err instanceof Error;
	            const _errObj = {
	                logId: reqId || -1,
	                from: this.config.namezh,
	                tag: tag || '',
	                // @ts-ignore
	                code: isErr ? err.code : '',
	                name: isErr ? err.name : '',
	                message: isErr ? err.message : err,
	                stack: isErr ? err.stack : '',
	                type: 'ERR',
	                level: currLogType || 13000 /* Unkown_ERR */
	            };
	            this.#logger.send(JSON.stringify(_errObj), (err) => {
	                if (err) {
	                    this.exit('日志写入失败，服务已终止，请确保日志服务运行正常');
	                }
	            });
	            this.emit('error', _errObj);
	            if (this.showLog) {
	                tmindCore.tEcho(_errObj, `${tag || ''}异常`, 'ERR');
	            }
	        }
	    }
	    async http(urlOrOpt, optOrMethod) {
	        const _typeAIsUrl = typeof urlOrOpt === 'string';
	        const _typeBIsMethod = optOrMethod && (typeof optOrMethod !== 'object');
	        const _obj = {
	            uri: (_typeAIsUrl && urlOrOpt) || urlOrOpt.uri,
	            json: true
	        };
	        const qs = (!_typeAIsUrl && urlOrOpt?.qs) || (!_typeBIsMethod && optOrMethod?.qs);
	        const headers = (!_typeAIsUrl && urlOrOpt?.headers) || (!_typeBIsMethod && optOrMethod?.headers);
	        const method = (_typeBIsMethod && optOrMethod) || (!_typeAIsUrl && (urlOrOpt?.method)) || 'GET';
	        if (qs)
	            _obj.qs = qs;
	        if (headers)
	            _obj.headers = headers;
	        if (method && method !== 'GET')
	            _obj.method = method;
	        try {
	            return await rq(_obj);
	        }
	        catch (err) {
	            this.preErr(err, 13005 /* Svr_Http_Request_Err */);
	        }
	    }
	    /** 启动服务
	     *
	     */
	    start() {
	        try {
	            this.#TimeTask.start();
	            this.#timTaskStoped = false;
	            const { appCopy, consoleStr } = tmindCore.smpoo();
	            // @ts-ignore
	            tmindCore.tEcho(consoleStr(), '', 'INFO');
	            tmindCore.tEcho(appCopy, '', 'INFO');
	            tmindCore.tEcho('-----------------------------------------------------------', '', 'INFO');
	            tmindCore.tEcho(`${tmindCore.tDate().format('YYYY-MM-DD hh:mi:sss')}\n\n`, '', 'INFO');
	            tmindCore.tEcho(`物理IP：${SvrUtil.getSvrIp().Main}`, '', 'INFO');
	            tmindCore.tEcho(`配置指向：${this.config.addr}`, '', 'INFO');
	            const _svrNameStr = !this.config.namezh ? '' : `[${this.config.namezh}]`;
	            tmindCore.tEcho(`${_svrNameStr}服务端已启动......\n\n    Enjoy it!\n\n`, `HTTP${this.onSSL ? '/s' : ''}：${this.config.port}`, 'SUCC');
	            this.setInfo(`[${this.config.namezh}] Server is start at ${this.config.addr}:${this.config.port} in ${tmindCore.tDate().format('YYYY-MM-DD hh:mi:ss.ms')}`, 11101 /* Svr_Boot */, -1, 'boot', '', 'SUCC');
	        }
	        catch (err) {
	            tmindCore.tEcho(err, '启动失败', 'ERR');
	            process.exit(1);
	        }
	    }
	    /** 停止服务
	     *
	     * @param msg 控制台消息
	     */
	    stop(msg) {
	        this.#timTaskStoped = true;
	        this.#TimeTask.stop();
	        tmindCore.tEcho(msg || '已停止服务端', '手动', 'WARN');
	        process.exit(0);
	    }
	    /** 暂停服务
	     * @param timeTaskAlso 同时停止本实例的定时任务
	     */
	    pause(timeTaskAlso) {
	        if (timeTaskAlso) {
	            this.#TimeTask.stop();
	            this.#timTaskStoped = true;
	        }
	        this.#isPause = true;
	        tmindCore.tEcho('服务已暂停', '警告！', 'WARN');
	    }
	    /** 恢复服务
	     */
	    resume() {
	        if (this.#timTaskStoped) {
	            this.#TimeTask.start();
	        }
	        this.#isPause = false;
	        tmindCore.tEcho('服务已恢复', '信息', 'INFO');
	    }
	    /** 强制终止服务端启动
	     *
	     * @param msg 控制台提示信息
	     * @param code 终止码
	     */
	    exit(msg, code) {
	        this.#TimeTask.stop();
	        tmindCore.tEcho(msg || `[${this.config.namezh}]服务端无法启动`, '启动异常', 'ERR');
	        process.exit(code ?? 1);
	    }
	}

	const Koa = require('koa');
	class KoaSvr$1 extends SvrBase {
	    constructor(appDir) {
	        super(appDir);
	        this.#app = new Koa();
	        this.#app.use(async (ctx, next) => {
	            ctx.body = '测试';
	            await next();
	        });
	    }
	    #app;
	    get app() {
	        return this.#app;
	    }
	    start() {
	        this.#app.listen(this.config.port);
	        super.start();
	    }
	}

	// const BaseSvr = require('../base/index');
	class DbSvr$1 extends SvrBase {
	    constructor(appDir) {
	        super(appDir);
	    }
	}

	const KoaSvr = KoaSvr$1;
	const DbSvr = DbSvr$1;

	exports.DbSvr = DbSvr;
	exports.KoaSvr = KoaSvr;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
