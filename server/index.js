import express from 'express';
import { db } from './db';
import bodyParser from 'body-parser';
import { MODE_TEST, MODE_PRODUCTION } from './db/db';
import userQueries from './routes/userQueries';
require('dotenv').config({ path: __dirname + '/.env' });

const PORT = process.env.PORT || 5250;

const mode =
	process.env.NODE_ENV === 'production' ? MODE_PRODUCTION : MODE_TEST;

const app = express();

db.connect(mode, function(err) {
	if (err) {
		console.log('Unable to connect to MySQL.');
		process.exit(1);
	} else {
		// Define the port we are listening on
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(bodyParser.json());
		app.use(userQueries);
		app.listen(PORT, () => {
			console.log(`Listening on port ${PORT}...`);
		});
	}
});
