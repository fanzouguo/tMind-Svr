"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const fs = require('fs-extra');
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
    constructor(appDir) {
        this.#basePath = fmtPath(process.cwd());
        this.#appPath = fmtPath(appDir);
    }
    #basePath;
    #appPath;
    get rootForlder() {
        return path.parse(this.rootPath).base;
    }
    get rootPath() {
        return fmtPath(path.resolve(this.#basePath, '../..'));
    }
    get svrForlder() {
        return path.parse(this.#basePath).base;
    }
    get svrPath() {
        return this.#basePath;
    }
    get appForlder() {
        return path.parse(this.#appPath).base;
    }
    get appPath() {
        return this.#appPath;
    }
    get pathConf() {
        return fmtPath(path.resolve(this.#basePath, PATH_CONF));
    }
    get pathLog() {
        return fmtPath(path.resolve(this.#basePath, PATH_LOG));
    }
    get pathScript() {
        return fmtPath(path.resolve(this.#basePath, PATH_SCRIPT));
    }
    get pathTask() {
        return fmtPath(path.resolve(this.#appPath, PATH_TASK));
    }
    get pathRouter() {
        return fmtPath(path.resolve(this.#appPath, PATH_ROUTER));
    }
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
    prePath(pathStr) {
        fs.ensure(pathStr);
    }
    isExist(pathStr) {
        return !!(glob.sync(pathStr).length);
    }
    parse(pathStr) {
        return path.parse(pathStr);
    }
}
module.exports = PathMgr;
//# sourceMappingURL=PathMgr.js.map