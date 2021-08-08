import { tEcho, tDate } from 'tmind-core';

module.exports = () => {
	tEcho('消息显示', '消息', 'SUCC');
	tEcho(tDate().format(), '日期', 'INFO');
	return `hello ${tDate().format('YYYY-MM-DD hh:mi:ss.ms')}`;
};
