import mysql from 'mysql';

export const TEST_DB = 'localtrackdb';
export const PRODUCTION_DB = process.env.PRODUCTION_DB;

export const MODE_TEST = 'MODE_TEST';
export const MODE_PRODUCTION = 'MODE_PRODUCTION';

import dotenv from 'dotenv';

dotenv.config();

let state = {
	pool: null,
	mode: null
};

const connect = (mode, done) => {
	const config = {
		host: mode === MODE_PRODUCTION ? process.env.DATABASE_HOST : 'localhost',
		user: mode === MODE_PRODUCTION ? process.env.MYSQL_USERNAME : 'root',
		password: process.env.MYSQL_PASSWORD,
		database: mode === MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
	};

	console.log(config);

	state.pool = mysql.createPool(config);
	state.mode = mode;
	done();
};

const get = () => state.pool;

const disconnect = () => {
	get().end();
};

const queryAsync = async (query, params) => {
	return new Promise((resolve, reject) => {
		state.pool.query(query, params, (err, rows) => {
			if (err) reject(err);
			else resolve(rows);
		});
	});
};

export default {
	connect,
	get,
	queryAsync,
	disconnect
};
