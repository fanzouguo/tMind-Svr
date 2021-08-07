const { tEcho } = require('tmind-core');
module.exports = (msg, title, code = 1) => {
    tEcho(msg || '', title || '', 'ERR');
    process.exit(code);
};
//# sourceMappingURL=terminat.js.map