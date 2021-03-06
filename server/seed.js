import { seed } from './db/schema';
import db, { MODE_PRODUCTION, MODE_TEST } from './db';

require('dotenv').config({ path: __dirname + '/.env' });

const mode =
	process.env.NODE_ENV === 'production' ? MODE_PRODUCTION : MODE_TEST;

seed(mode, err => {
	if (err) console.log(err);
	db.disconnect();
});
