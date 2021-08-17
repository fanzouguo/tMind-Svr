const conf = require('./conf');
/** build 目标生成后，需要拷贝到目标文件夹中的静态文件清单
 * 输出结果为数组，数组内各项子元素是二元数组。
 */
module.exports = [
	['src/types', `${conf.destDir}/types`]
];
