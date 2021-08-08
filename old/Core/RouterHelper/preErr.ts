const shortMsg = {
	ERR_SSL_VERSION_OR_CIPHER_MISMATCH: 'SSL证书无效'
};

module.exports = (err?: Error | string, code?: number) => {
	console.log(shortMsg); // eslint-disable-line
	if (typeof err === 'string') console.log('待处理异常'); // eslint-disable-line
	if (err instanceof Error) console.log('待处理异常'); // eslint-disable-line
	if (err) {
		return '';
	} else if (code) {
		return '';
	} else {
		return '未知错误';
	}
};
