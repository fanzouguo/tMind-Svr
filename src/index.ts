// export const KoaSvr = require('./core/koaSvr');
// export const DbSvr = require('./core/dbSvr');
// const func = require('./testA/foo');
import func from './testA/foo';
const _func2 = () => {
	return 'test function';
};

// export default function () {
// 	console.log(_func_()); // eslint-disable-line
// }

export const func1 = func;
export const func2 = _func2;
