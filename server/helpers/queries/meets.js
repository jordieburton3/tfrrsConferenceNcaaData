import db from '../../db/db';
import mysql from 'mysql';
import {
	listOrs,
	getConferenceSchool,
	getConferenceRepresentation,
	createMeet,
	createGender,
	createRound,
	placeConfig,
	getAthleteInformation
} from './queryStringProducers';

export const fetchMeetData = async (params, done) => {
	const { schools } = params;
	let results = [];
	const query = createBaseQuery(params);
	let currSchoolData;
	for (let i = 0; i < schools.length; i++) {
		currSchoolData = await getConferenceSchool(schools[i], query);
		results.push({ school: schools[i], results: currSchoolData });
	}
	done(results);
};

export const fetchAll = done => {
	db.get().query('SELECT * FROM RESULTS', [], (err, result) => {
		done(result);
	});
};

export const fetchConferenceRepresentation = async (params, done) => {
	console.log(params);
	const query = createBaseQuery(params);
	const { conferences } = params;
	let results = [];
	if (conferences && conferences.length > 0) {
		for (let i = 0; i < conferences.length; i++) {
			results.push({
				conference: conferences[i],
				results: await getConferenceRepresentation(conferences[i], query)
			});
		}
	}
	done(results);
};

export const fetchIndividualPerformances = async (params, done) => {
	const query = createBaseQuery(params);
	const { athletes, meets } = params;
	let results = [];
	if (meets && meets.length > 0) {
		for (let i = 0; i < meets.length; i++) {
			results.push({ results: await getAthleteInformation(athlete, meets[i]) });
		}
	}
};

const createBaseQuery = params => {
	const {
		gender,
		meet,
		events,
		eventGroups,
		seasons,
		schools,
		round,
		place
	} = params;
	let genderQuery = ``;
	let meetQuery = ``;
	let seasonsQuery = ``;
	let eventsQuery = ``;
	let eventGroupsQuery = ``;
	let schoolsQuery = ``;
	let roundQuery = ``;
	let placeQuery = ``;
	if (gender) {
		genderQuery = createGender(gender);
	}
	if (meet) {
		meetQuery = createMeet(meet);
	}
	if (events && events.length > 0) {
		eventsQuery = listOrs('event', events);
	} else if (eventGroups && eventGroups.length > 0) {
		eventGroupsQuery = listOrs('eventGroup', eventGroups);
	}
	if (seasons && seasons.length > 0) {
		seasonsQuery = listOrs('season', seasons);
	}
	if (round) {
		roundQuery = createRound(round);
	}
	if (place.type) {
		placeQuery = placeConfig(place);
	}
	return `SELECT * FROM Results ${meetQuery} ${genderQuery} ${eventsQuery} ${eventGroupsQuery} ${seasonsQuery} ${roundQuery} ${placeQuery}`;
};
