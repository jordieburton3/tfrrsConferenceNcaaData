import request from 'request';
import cheerio from 'cheerio';
import {
	NCAA_PRELIM_MEN,
	NCAA_PRELIM_WOMEN,
	ACC_OUTDOOR_MEN,
	ACC_OUTDOOR_WOMEN,
	ACC_INDOOR_MEN,
	ACC_INDOOR_WOMEN,
	PAC12_OUTDOOR_MEN,
	PAC12_OUTDOOR_WOMEN,
	MPSF_MEN,
	MPSF_WOMEN
} from './constants/urls';
import {
	createYearMapping,
	createConferenceYearMapping,
	removeAll,
	printAll,
	replaceAll,
	formatText,
	populateAthletes
} from './helpers';
import { db } from './db';

const collectRegionalAthleteData = async (data, meetName) => {
	let mappedMeets = createYearMapping(data, 2);
	let compiledMeetResults = { meetName };
	//scrapeAthleteData('https://www.tfrrs.org/results/36170/m/NCAA_East_Preliminary_Round/', 'm');
	for (let year in mappedMeets) {
		let prelims = mappedMeets[year];
		compiledMeetResults[year] = { east: [], west: [] };
		for (let i = 0; i < prelims.length; i++) {
			let meet = prelims[i];
			let meetResults = await scrapeAthleteData(meet);
			// console.log(meetResults);
			i === 0
				? (compiledMeetResults[year].east = compiledMeetResults[
						year
					].east.concat(meetResults))
				: (compiledMeetResults[year].west = compiledMeetResults[
						year
					].west.concat(meetResults));
			// i === 0
			// 	? printAll(compiledMeetResults[year].east)
			// 	: printAll(compiledMeetResults[year].west);
		}
	}
	console.log(compiledMeetResults);
	return compiledMeetResults;
};

const collectAthleteData = async (data, meetName) => {
	let mappedMeets = createConferenceYearMapping(data, 1);
	let compiledMeetResults = { meetName };
	//scrapeAthleteData('https://www.tfrrs.org/results/36170/m/NCAA_East_Preliminary_Round/', 'm');
	for (let year in mappedMeets) {
		compiledMeetResults[year] = [];
		// console.log(prelims);
		let meet = mappedMeets[year];
		let meetResults = await scrapeAthleteData(meet);
		compiledMeetResults[year] = compiledMeetResults[year].concat(meetResults);
		//printAll(compiledMeetResults[year]);
	}
	return compiledMeetResults;
};

// name$school$@year@!event!

const scrapeAthleteData = async meet => {
	//console.log(meet);
	return new Promise((resolve, reject) => {
		request(meet, (err, resp, body) => {
			let compiledData = [];
			if (!err && resp.statusCode == 200) {
				let $ = cheerio.load(body);
				$('.col-lg-12').each((i, element) => {
					const eventHeader = $('.pl-5', element)
						.text()
						.split('\n')
						.filter(element => {
							return (
								element !== '\t' &&
								(element.match(/\s/g) || []).length !== element.length
							);
						});
					const eventInfo = {
						gender: eventHeader[0][0],
						event: eventHeader[1],
						round: replaceAll(eventHeader[2], ' ')
					};
					const columnDetails = $('th', element)
						.text()
						.split('\n')
						.filter(element => {
							return (
								element !== '\t' &&
								(element.match(/\s/g) || []).length !== element.length
							);
						});
					const tableData = $('td', element)
						.text()
						.split('\n')
						.filter(element => {
							return (
								element.includes(String.fromCharCode(160)) ||
								(element.match(/\s/g) || []).length !== element.length
							);
						});
					const formattedData = formatText(removeAll(tableData));
					compiledData = compiledData.concat(
						populateAthletes(formattedData, eventInfo, columnDetails.length)
					);
				});
				resolve(compiledData);
			} else {
				console.log(err);
			}
		});
	});
};

//collectAthleteData(mens_meets_by_year);
collectRegionalAthleteData(NCAA_PRELIM_MEN, 'ncaa prelim');
// collectRegionalAthleteData(NCAA_PRELIM_WOMEN, 'ncaa prelim');
// collectAthleteData(ACC_OUTDOOR_MEN, 'acc outdoor');
// collectAthleteData(ACC_OUTDOOR_WOMEN, 'acc indoor');
// collectAthleteData(ACC_INDOOR_MEN, 'acc indoor');
// collectAthleteData(ACC_INDOOR_WOMEN, 'acc indoor');
// collectAthleteData(PAC12_OUTDOOR_MEN, 'acc indoor');
// collectAthleteData(PAC12_OUTDOOR_WOMEN, 'pac-12 outdoor');
// collectAthleteData(MPSF_MEN, 'mpsf');
// collectAthleteData(MPSF_WOMEN, 'mpsf');

const insertToDatabase = meetData => {
	for (let year in meetData) {
		for (let i = 0; i < meetData[year].length; i++) {
			db
				.get()
				.query(`INSERT INTO RESULTS VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
					year,
					meetData.meetName,
					meetData[year][i].gender,
					meetData[year][i].name,
					meetData[year][i].mark,
					meetData[year][i].place,
					meetData[year][i].event,
					meetData[year][i].round,
					meetData[year][i].eventGroup,
					meetData[year][i].school
				]);
		}
	}
};
