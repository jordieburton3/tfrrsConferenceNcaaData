import mysql from 'mysql';
import dotenv from 'dotenv';
import db, { MODE_TEST, MODE_PRODUCTION, TEST_DB, PRODUCTION_DB } from './db';

dotenv.config();

export const createDatabaseQueries = [
	`DROP DATABASE IF EXISTS localtrackdb`,
	`DROP DATABASE IF EXISTS remotetrackdb`,
	`CREATE DATABASE localtrackdb`,
	`CREATE DATABASE remotetrackdb`
];

export const Schemas = [
	`DROP TABLE IF EXISTS Results`,
	`CREATE TABLE Results (
        year int NOT NULL,
        meetName VARCHAR(255) NOT NULL,
        gender ENUM('M', 'F', 'W'),
        athleteName  VARCHAR(255) NOT NULL,
        mark VARCHAR(255) NOT NULL,
        place int NOT NULL,
        event VARCHAR(255) NOT NULL,
        round VARCHAR(255) NOT NULL,
        eventGroup VARCHAR(255) NOT NULL,
        school VARCHAR(255) NOT NULL
    )`
];

const Views = [];

const asyncQuery = (conn, query) => {
	return new Promise((resolve, reject) => {
		conn.query(query, (err, rows) => {
			if (err) reject(err);
			else resolve(rows);
		});
	});
};

const executeQueries = async (conn, queryArray) => {
	return new Promise(async (resolve, reject) => {
		for (let query of queryArray) {
			try {
				await asyncQuery(conn, query);
			} catch (err) {
				reject(err);
			}
		}
		resolve();
	});
};

// This is what callback hell looks like - should use async / await
export const seed = mode => {
	const prod = mode === MODE_PRODUCTION;
	// Create a separate connection for creating the database. Don't do this on
	// prod as we only get one database
	const initialConnection = prod
		? null
		: mysql.createConnection({
				host: 'localhost',
				user: 'root',
				password: process.env.MYSQL_PASSWORD
			});

	const seedConnection = mysql.createConnection({
		host: prod ? process.env.DATABASE_HOST : 'localhost',
		user: prod ? process.env.MYSQL_USERNAME : 'root',
		password: process.env.MYSQL_PASSWORD,
		database: prod ? PRODUCTION_DB : TEST_DB
	});
	return new Promise(async (resolve, reject) => {
		try {
			if (!prod) {
				await executeQueries(initialConnection, createDatabaseQueries);
				initialConnection.end();
			}
			await executeQueries(seedConnection, Schemas);
			await executeQueries(seedConnection, Views);
			seedConnection.end();
			process.exit(0);
		} catch (err) {
			console.log(err);
		}
	});
};
