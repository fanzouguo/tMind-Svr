(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.tmindSvr = factory());
}(this, (function () { 'use strict';

	// import BaseSvrClass from './core/base';
	// import KoaSvrClass from'./core/koaSvr';
	// import LogSvrClass from './core/logSvr';
	const BaseSvr = require('./core/base/index');

	return BaseSvr;

})));
