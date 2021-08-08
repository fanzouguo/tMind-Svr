import { smpoo } from '../lib/index';
const __mapOb__ = require('./__mapOb__');

const std = {
	company: '上海深普软件有限公司',
	appCopy: 'Copyright © 2015 - 2021 深普 SMPOO.com 版权所有',
	website: 'www.smpoo.com'
};

module.exports = () => {
	/** 测试 smpoo 方法
	 */
	describe('smpoo sub module', () => {
		__mapOb__(std, smpoo()), 'Standard for smpoo object';
	});
};
