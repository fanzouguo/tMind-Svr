/** 任务定时器
 *
 */
import type { IconfSvr, PathMgr } from '../../types';
const schedule = require('node-schedule');
const NULL_SCHEDULE = '* * * * * *';

const runner = (ident: string, roleObj: typeof schedule.RecurrenceRule | typeof schedule.RecurrenceSpecDateRange | typeof schedule.RecurrenceSpecObjLit | Date | string | number, cb: any) => {
	schedule.scheduleJob(ident, roleObj, () => {
		if (typeof cb === 'function') {
			cb();
		}
});
};

class SvrTimeTask {
	#ident: string;
	#role: typeof schedule.RecurrenceRule | typeof schedule.RecurrenceSpecDateRange | typeof schedule.RecurrenceSpecObjLit | Date | string | number;
	#taskList: void[];
	/** 初始化构造
	 *
	 * @param currPath 服务实例的地址管理器
	 * @param conf 服务实例的配置管理器
	 */
	constructor(currPath: PathMgr, conf: IconfSvr) {
		this.#ident = currPath.svrForlder;
		this.#role = conf.unit[this.#ident]?.schedule || NULL_SCHEDULE;
		this.#taskList = [];
		const taskPath = currPath.getPath('task');
		if (currPath.isExist(`${taskPath}/index.?s`)) {
			this.#taskList.push(require(taskPath));
		}
	}

	/** 预储备定时任务队列
	 *
	 * @param immediately 储备完成后是否立即开始定时任务调度
	 * @param taskUnit 要储备的定时任务
	 */
	prepare(...taskUnit: any) {
		for (const v of taskUnit) {
			if (Array.isArray(v)) {
				this.#taskList.push(...v);
			} else if (typeof v === 'function') {
				this.#taskList.push(v);
			}
		}
	}

	/** 开始执行定时任务调度
	 *
	 */
	start() {
		if (this.#role !== NULL_SCHEDULE && this.#taskList.length) {
			for (const v of this.#taskList) {
				if (typeof v === 'function') {
					runner(this.#ident, this.#role, v);
				} else if (typeof v === 'object') {
					// @ts-ignore
					const _schedule_ = v?.schedule;
					// @ts-ignore
					if (_schedule_ && v.func && typeof v.func === 'function') {
						// @ts-ignore
						runner(this.#ident, _schedule_, v.func);
					}
				}
			}
		}
	}

	/** 停止定时任务调度器
	 *
	 */
	stop() {
		// schedule.cancel();
	}
}

export default SvrTimeTask;
