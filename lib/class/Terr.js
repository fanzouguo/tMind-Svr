"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tmind_core_1 = require("tmind-core");
class Terr extends Error {
    constructor(a, b, c) {
        super(typeof a === 'string' ? a : a.message);
        const isBoolB = typeof b === 'boolean';
        if (b) {
            this.code = !isBoolB ? b : 10000;
        }
        else {
            this.code = 10000;
        }
        if (isBoolB || c) {
            tmind_core_1.tEcho(typeof a === 'string' ? a : a.message, '异常', 'ERR');
        }
    }
}
exports.default = Terr;
//# sourceMappingURL=Terr.js.map