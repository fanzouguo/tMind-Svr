"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tmind_core_1 = require("tmind-core");
const Terr_1 = __importDefault(require("../../class/Terr"));
const EventEmitter = require('events');
const PathMgr = require('./PathMgr');
const preConf = require('./preConf');
const bootWelcome = require('./bootWelcome');
const rq = require('request-promise');
class SvrBase extends EventEmitter {
    constructor(appDir) {
        super();
        this.#pathMgr = new PathMgr(appDir);
        this.#ident = this.#pathMgr.svrForlder;
        this.#config = preConf(this.#pathMgr);
        this.#isPause = false;
        this.#isHttps = !!(this.#config.cert.key);
        this.on('error', (err) => {
            this.echo('监听到异常，详情如下：', '错误', 'ERR');
            this.echo(err);
        });
    }
    #ident;
    #pathMgr;
    #config;
    #isPause;
    #isHttps;
    get pathMgr() {
        return this.#pathMgr || {};
    }
    get config() {
        return this.#config.unit[this.#ident] || {};
    }
    get configAll() {
        return this.#config || {};
    }
    get status() {
        return this.#isPause;
    }
    echo(msg, title, msgType) {
        const isErr = msg instanceof Error;
        if (!title) {
            if (isErr) {
                console.error(msg);
            }
            else {
                console.log(msg);
            }
        }
        else {
            tmind_core_1.tEcho(msg, title, msgType);
        }
    }
    start() {
        try {
            bootWelcome(this.#isHttps, this.config.port, this.config.namezh);
        }
        catch (err) {
            this.echo(err.message, '启动失败');
            this.echo(err);
            process.exit(1);
        }
    }
    stop(msg) {
        tmind_core_1.tEcho(msg || '已停止服务端', '手动', 'WARN');
        process.exit(0);
    }
    pause() {
        this.#isPause = true;
        this.echo('服务已暂停', '警告！', 'WARN');
    }
    resume() {
        this.#isPause = false;
        this.echo('服务已恢复', '信息', 'INFO');
    }
    exit(msg, code) {
        tmind_core_1.tEcho(msg || `[${this.config.namezh}]服务端无法启动`, '启动异常', 'ERR');
        process.exit(code ?? 1);
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
            this.emit('error', new Terr_1.default(err, 10005, true));
        }
    }
}
module.exports = SvrBase;
//# sourceMappingURL=index.js.map