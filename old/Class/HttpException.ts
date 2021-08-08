class HttpException extends Error {
	errCode: number;
	codeType: number;
	constructor (msg: string | Error, errCode?: number, codeType?: number) {
		super();
		this.message = (typeof msg === 'string' && msg) || (msg instanceof Error && msg.message) || '未知错误';
		this.errCode = errCode ?? 1000;
		this.codeType =codeType ?? 500;
	}
}

module.exports = HttpException;
