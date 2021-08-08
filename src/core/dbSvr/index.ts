import type { DbSvr as DbSvrClass } from '../../types';
import BaseSvr from '../base/index';
// const BaseSvr = require('../base/index');

class DbSvr extends BaseSvr implements DbSvrClass {
	constructor(appDir: string) {
		super(appDir);
	}
}

export default DbSvr;
