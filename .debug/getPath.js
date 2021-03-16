const path = require('path');

const __formatPath__ = (pathStr, splitTag = '/') => pathStr.replace(/\\\\/g, splitTag).replace(/\\/g, splitTag);

/** 获取基于于项目根目录的路径
 *
 * @param sPath 路径片段
 * @returns 路径地址
 */
const getPath = (...sPath) => {
	if (sPath.length) {
		return __formatPath__(path.resolve(__dirname, ...sPath));
	} else {
		return __formatPath__(path.resolve(__dirname));
	}
};

/** 完全依据指定参数获取路径，不含任何默认前缀地址
 *
 * @param sPath 路径片段
 * @returns 路径地址
 */
const getPathSpec = (...sPath) => {
	try {
		if (sPath.length) {
			return __formatPath__(path.join(...sPath));
		} else {
			throw new Error('路径不能为空');
		}
	} catch (err) {
		throw err;
	}
};

/** 获取当前命令行光标所在位置的路径
 *
 * @returns 路径地址
 */
const getCurrPath = () => {
	return __formatPath__(path.resolve('./'));
};

const formatPath = (pathStr, splitTag = '/') => __formatPath__(pathStr, splitTag);

module.exports = {
	getPath,
	getPathSpec,
	getCurrPath,
	formatPath
};
