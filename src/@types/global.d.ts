/* eslint-disable no-unused-vars */
export {};
declare global {
	// 可作为日期传参的类型
	declare type dateLike = string | number | number[] | Date | null | undefined;

	// 可作为 Boolean 传参的类型
	declare type boolLike = boolean | string | number | null | undefined;

	// 日志信息枚举
	declare const enum MSG_TYPE {
		INFO = 'INFO',
		SUCC = 'SUCC',
		WARN = 'WARN',
		ERR = 'ERR'
	}

	declare interface IObj<T> {
		[index: string]: T;
	}

	declare interface IKv<T> {
		[index: keyof T]: T[keyof T];
	}
}
