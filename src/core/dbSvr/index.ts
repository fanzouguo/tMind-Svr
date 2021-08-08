const BaseSvr = require('../base/index');

class DbSvr extends BaseSvr {
	constructor(appDir: string) {
		super(appDir);
	}
}

module.exports = DbSvr;
