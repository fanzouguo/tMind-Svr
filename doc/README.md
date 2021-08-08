# 服务端逻辑

## 配置文件

	配置文件采取全局工程配置模式，服务实例所在的文件夹名称，即为对应的配置文件名。

> 全局工程配置文件，文件路径： process.cwd()/../../.config，文件获取方式： Util/middleware/preReq
	``` json


	```

> 实例本地配置文件
	```

	```

> 配置文件会在服务端实例启动时自动识别实例名称，并加载

## 工程及实例文件夹结构

|-- 工程根路径
		-- .config 	全局工程配置文件夹
		-- .data	 	系统运行时数据位置，如日志文件
		-- .script	工程脚本，如 github 提交、服务启动、端口开放等
		-- bend			后端服务文件夹
				-- svrAdmin		管理员服务实例文件夹
				--	svrAuth
		-- fend 		前端项目文件夹
		-- README.md

## 任务定时器

采用 node-schedule 库，其时间控制符使用 cron 风格记法，

``` javascript
// 在主程序文件中，
const task = new Task(主程序配置, 任务函数或任务函数数组);
```
task 一旦被 new 以后，会自动开始定时执行，执行范围包括 new函数传参提供的任务函数，以及主程序所在路径的 @task 文件夹中的函数
> 定时器时间控制符
	```
		字符型：
		*		*		*		*		*		*
		T		T		T		T		T		T
		|		|		|		|		|		|
		|		|		|		|		|		L day of week (0 ~ 7) (0 or 7 is Sun)
		|		|		|		|		│____ month (1 ~ 12)
		|		|		|		│________ day of month (1 ~ 31)
		|		|		│____________ hour of day (0 ~ 23)
		|		│________________ minute of hour (0 ~ 59)
		│____________________ second of minute (0 ~ 59, OPTIONAL)

		对象型：
		{
			second (0 ~ 59),
			minute (0 ~ 59),
			hour (0 ~ 23),
			date (1 ~ 31),
			month (0 ~ 11),
			year,
			dayOfWeek (0 ~ 6) Starting with Sunday,
			tz
		}
	```
> task 外置文件

	路径：主程序路径(app.js or app/index.js) 下的 @task/index.js，文件结构
	``` javascirpt
	// 任务定义可以是独立函数
	module.exports = () => {
		......
	};

	// 或者函数数组
	module.exports = [() => {...}, () => {....}];

	// 或者带有独立时间定义的对象，其中，schedule 字段仅代表本函数的时间定义，func 代表要执行的任务函数
	module.exports = {
		schedule: ...,
		func: () => {....}
	}

	// 或者以上类型混合的数组
	module.exports = [
		// 任务一
		{
			schedule: ...,
			func: () => {....}
		},
		// 任务二
		{
			schedule: ...,
			func: () => {....}
		},
		... // 任务 ...N
		// 任务 N + 1
		() => {....}]
	```