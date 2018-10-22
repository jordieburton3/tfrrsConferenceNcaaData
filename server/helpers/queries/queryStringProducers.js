import db from '../../db/db';
import mysql from 'mysql';
import {
	BETWEEN,
	EQUAL,
	LESS_THAN,
	GREATER_THAN,
	DNF
} from '../../constants/COMPARATOR';

export const listOrs = (columnName, list) => {
	let temp;
	let queryString = '';
	for (let i = 0; i < list.length; i++) {
		if (i === 0) {
			temp = mysql.format(`AND (${columnName} like ?`, [
				`${list[i].split(' ').join('%')}`
			]);
		} else {
			temp = mysql.format(`OR ${columnName} like ?`, [
				`${list[i].split(' ').join('%')}`
			]);
		}
		queryString += temp;
	}
	queryString += `)`;
	return queryString;
};

export const placeConfig = place => {
	const { type, primaryComparator, secondaryComparator } = place;
	switch (type) {
		case BETWEEN:
			return configBetween(primaryComparator, secondaryComparator);
		case EQUAL:
			return configEqual(primaryComparator);
		case LESS_THAN:
			return configLessThan(primaryComparator, secondaryComparator);
		case GREATER_THAN:
			return configGreaterThan(primaryComparator, secondaryComparator);
		case DNF:
			return configDnf();
		default:
			return 'error';
	}
};

export const createGender = gender => {
	return mysql.format(`AND gender like ?`, [`%${gender}%`]);
};

export const createMeet = meet => {
	return mysql.format(`WHERE meetName like ?`, [
		`${meet.split(' ').join('%')}`
	]);
};

export const createRound = round => {
	return mysql.format(`AND round like ?`, [`%${round}%`]);
};

export const getConferenceSchool = async (school, queryString) => {
	return new Promise((resolve, reject) => {
		let schoolQuery =
			queryString +
			mysql.format(` AND school like ? ORDER BY year`, [
				`%${school.split(' ').join('%')}%`
			]);
		console.log(schoolQuery);
		db.get().query(schoolQuery, [], (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve({ result, err });
			}
		});
	});
};

export const getConferenceRepresentation = async (conference, queryString) => {
	return new Promise((resolve, reject) => {
		let query = queryString + existenceCheck(conference);
		console.log(query);
		db.get().query(query, [], (err, result) => {
			if (err) {
				reject({ results, err });
			} else {
				resolve({ result, err });
			}
		});
	});
};

export const getAthleteInformation = async (
	athleteName,
	meets,
	queryString
) => {
	return new Promise((resolve, reject) => {
		let query =
			queryString +
			mysql.format(` AND athleteName like ? AND meetName = ? ORDER BY year`, [
				athleteName.split(',').join('%')
			]);
		console.log(query);
		db.get().query(query, [], (err, result) => {
			if (err) {
				reject({ results, err });
			} else {
				resolve({ result, err });
			}
		});
	});
};

const existenceCheck = conference => {
	return mysql.format(
		` AND EXISTS (SELECT * FROM Conferences WHERE Results.school = Conferences.school AND Conferences.conference = ?) ORDER BY year`,
		[conference]
	);
};

const configEqual = place => {
	return mysql.format(`AND place = ?`, [place]);
};

const configBetween = (primary, secondary) => {
	return mysql.format(`AND (place >= ? AND place <= ?)`, [
		Math.max(primary, secondary),
		Math.min(primary, secondary)
	]);
};

const configLessThan = place => {
	return mysql.format(`AND (place < ? AND place != 0)`, [place]);
};

const configGreaterThan = place => {
	return mysql.format(`AND (place > ? AND place != 0)`, [place]);
};

const configDnf = () => {
	return `AND place = 0`;
};
