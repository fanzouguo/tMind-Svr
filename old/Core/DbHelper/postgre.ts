import type { DbDriver as TDbDriver, IdbOption } from '../../@types';
const EventEmitter = require('events');
const { Pool } = require('pg');
let pool: typeof Pool | null = null;

class PgDriver extends EventEmitter implements TDbDriver {
	static init(opt: IdbOption) {
		if (!pool) {
			pool = new Pool();
			pool.on('error', (err: Error, client) => {
				this.emit('error', err);
			});
		}
	}
}

module.exports = PgDriver;
