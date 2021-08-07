/* eslint-disable no-unused-vars */
export declare const enum ERR_TYPE {
	/** 未定义的异常
	 */
	unkownErr = 10000,
	/** 服务端启动异常
	 */
	bootErr = 10001,
	/** 服务端 Licese 异常
	 */
	licenseErr = 10002,
	/** 服务端 SSL 文件异常
	 */
	certErr = 10003,
	/** 服务端配置异常
	 */
	configErr = 10004,
	/** 服务端HTTP请求异常
	 */
	svrHttpRequestErr = 10005
}
