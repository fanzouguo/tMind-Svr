"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tmind_core_1 = require("tmind-core");
const SvrUtil = require('./SvrUtil');
module.exports = (isSSL, port, svrName) => {
    const { appCopy, consoleStr } = tmind_core_1.smpoo();
    tmind_core_1.tEcho(consoleStr(), '', 'INFO');
    tmind_core_1.tEcho(appCopy, '', 'INFO');
    tmind_core_1.tEcho('-----------------------------------------------------------', '', 'INFO');
    tmind_core_1.tEcho(`${tmind_core_1.tDate().format('YYYY-MM-DD hh:mi:sss')}\n\n`, '', 'info');
    tmind_core_1.tEcho(SvrUtil.getSvrIp().Main, '', 'INFO');
    const _svrNameStr = !svrName ? '' : `[${svrName}]`;
    tmind_core_1.tEcho(`${_svrNameStr}服务端已启动......\n\n    Enjoy it!\n\n`, `HTTP${isSSL ? '/s' : ''}：${port}`, 'SUCC');
};
//# sourceMappingURL=bootWelcome.js.map