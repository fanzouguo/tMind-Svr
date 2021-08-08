module.exports = {
	normal: 10000,
	/** 正常登录
	 */
	signIn: 20000,
	/** 尝试登录超过3次
	 */
	signInTryMore: 20001,
	/** 被禁用的账号尝试登录
	 */
	signInDisable: 20002,
	/** 无效的用户名尝试登录
	 */
	signInUnkownUname: 20003,
	/** 错误的密码尝试登录
	 */
	signInWrongUpwd: 20004,
	/** 注销登录
	 */
	signOut: 20009
};
