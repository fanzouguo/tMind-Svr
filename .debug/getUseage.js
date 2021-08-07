const fs = require('fs-extra');
const path = require('path');
const useage = require('./useage');

const resConsole = [];
const resDoc = [];
const resCatalog = [];
const morDetail = '\n	更多用法请参照API文档...';

const __fmtParam__ = c => {
	return c.map(v => {
		return (typeof v === 'string' && `'${v}'`) || (Array.isArray(v) && `[ ${v.join(', ')} ]`) || (typeof v === 'object' && JSON.stringify(v, null, 2)) || v;
	}).join(', ');
};

const __fmtRes__ = val => {
	const _typ = typeof val;
	return (Array.isArray(val) && `[ ${val} ]`.replace(/,/g, ',	')) ||
	(_typ === 'object' && JSON.stringify(val)) ||
	(_typ === 'string' && `'${val}'`) ||
	val;
};

const __fmtCode__ = code => {
	const _str = (Array.isArray(code) && code.join('\n    ')) || (typeof code === 'string' && code);
	return `    \`\`\`\n    ${_str}\n    \`\`\``;
};

const __getItemDoc__ = item => {
	if (!item || item[0] === '...') return '更多用法请参照API文档...';
	const _arr = [];
	const [a, b, ...c] = item;
	const _tp = typeof b;
	if (_tp === 'function') {
		_arr.push(`${a}(${__fmtParam__(c)});`);
		_arr.push(`// ${__fmtRes__(b.apply(b, c))}`);
	} else {
		_arr.push(`${a} = ${__fmtRes__(b)}`);
	}
	return __fmtCode__(_arr);
};

const __pushTitle__ = title => {
	resDoc.push(`1.	### <span id="${title}">${title}</span><span style="margin-left: 24px; font-size: 12px">[返回目录](#toc)</span>`);
	resCatalog.push(`##### [${title}](#${title})`);
};

const __pushSubTitle__ = subTitle => {
	if (subTitle) {
		resDoc.push(`	> ###### 说明：${subTitle}`);
	}
}

const getConsole = (...item) => {
	if (item[0] !== '...') {
		const [title, obj, ...param] = item;
		if (Array.isArray(title)) {
			for (const v of item) {
				if (v !== '...') {
					const [a, b, ...c] = v;
					resConsole.push(a);
					const _tp = typeof b;
					if (_tp === 'function') {
						resConsole.push(`${a}(${__fmtParam__(c)}); \n//${__fmtRes__(b.apply(b, c))}`);
					} else {
						resConsole.push(`${a} = ${__fmtRes__(b)}`);
					}
				}
			}
		} else {
			if (item !== '...') {
				resConsole.push(title);
				const _tp = typeof obj;
				if (_tp === 'function') {
					resConsole.push(`${title}(${__fmtParam__(param)}); \n//${__fmtRes__(obj.apply(obj, param))}`);
				} else {
					resConsole.push(`${title} = ${__fmtRes__(obj)}`)
				}
			}
		}
	}
};

const getDoc = (...item) => {
	const [a, b, ...c] = item;
	if (Array.isArray(a)) {
		const _currTitle = item[0][0];
		__pushTitle__(_currTitle);
		for (const v of item) {
			const [d, e, f] = v;
			__pushSubTitle__(useage.desc[d]);
			resDoc.push(__getItemDoc__(v));
		}
	} else {
		__pushTitle__(a);
		__pushSubTitle__(useage.desc[a]);
		resDoc.push(__getItemDoc__(item));
	}
};

// const getDoc2222 = (...item) => {
// 	if (item[0] !== '...') {
// 		const [title, obj, ...param] = item;
// 		const _arr = [];
// 		if (Array.isArray(title)) {
// 			const _title_ = item[0][0];
// 			resDoc.push(`1.	#### ${_title_}`);
// 			const _currDesc = useage.desc[_title_];
// 			if (_currDesc) {
// 				resDoc.push(`	> ###### 说明：${_currDesc}`);
// 			}
// 			for (const v of item) {
// 				if (v === '...') {
// 					_arr.push(morDetail);
// 				} else {
// 					const [a, b, ...c] = v;
// 					const _tp = typeof b;
// 					if (_tp === 'function') {
// 						_arr.push(`${a}(${__fmtParam__(c)});`);
// 						_arr.push(`// ${__fmtRes__(b.apply(b, c))}`);
// 						_arr.push('');
// 					} else {
// 						_arr.push(`${a} = ${__fmtRes__(b)}\n`);
// 					}
// 				}
// 			}
// 			resDoc.push(__fmtCode__(_arr));
// 		} else {
// 			if (item === '...') {
// 				resDoc.push(morDetail);
// 			} else {
// 				resDoc.push(`1.	#### ${title}`);
// 				const _currDesc = useage.desc[title];
// 				if (_currDesc) {
// 					resDoc.push(`	> ###### 说明：${_currDesc}`);
// 				}
// 				const _tp = typeof obj;
// 				if (_tp === 'function') {
// 					_arr.push(`${title}(${__fmtParam__(param)});`);
// 					_arr.push(`// ${__fmtRes__(obj.apply(obj, param))}`);
// 					_arr.push('');
// 				} else {
// 					_arr.push(`${title} = ${__fmtRes__(obj)}`);
// 				}
// 				resDoc.push(__fmtCode__(_arr));
// 			}
// 		}
// 	}
// };

const getTry = inConsole => {
	const currFunc = inConsole ? getConsole : getDoc;
	for (const v of useage.case) {
		currFunc(...v);
	}

	resDoc.unshift('\n');
	resDoc.unshift('---');
	resDoc.unshift('\n');
	resDoc.unshift(resCatalog.join('\n'));
	resDoc.unshift('#### <span id="toc">目录</span>');
	resDoc.unshift('<center>tMind-Core 用例说明</center>\n');
};

const runUseage = inConsle => {
	getTry(inConsle);
	return inConsle ? resConsole.join('\n\n') : resDoc.join('\n');
};

module.exports = async inConsole => {
	const str = runUseage(inConsole);
	if (inConsole) {
		console.log(str);
	} else {
		const docRoot = path.resolve(process.cwd(), 'docs');
		fs.ensureDirSync(docRoot)
		fs.writeFileSync(path.resolve(docRoot, 'useage.md'), str);
	}
};
