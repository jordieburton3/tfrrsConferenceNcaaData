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
import { MODE_TEST } from './db/db';
require('dotenv').config({ path: __dirname + '/.env' });

const PORT = process.env.PORT || 5000;

const collectRegionalAthleteData = async (data, meetName, done) => {
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
	done(compiledMeetResults);
};

const collectAthleteData = async (data, meetName, done) => {
	let compiledMeetResults = { meetName, resultData: [] };
	//scrapeAthleteData('https://www.tfrrs.org/results/36170/m/NCAA_East_Preliminary_Round/', 'm');
	for (let i = 0; i < data.length; i++) {
		// console.log(prelims);
		let meet = data[i];
		let meetResults = await scrapeAthleteData(meet);
		compiledMeetResults.resultData = compiledMeetResults.resultData.concat(
			meetResults
		);
		//printAll(compiledMeetResults[year]);
	}
	done(compiledMeetResults);
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
					const yearText = $('.inline-block')
						.text()
						.split('\n')
						.filter(element => {
							return element.includes('201');
						})[0]
						.split(' ');
					const year = yearText[yearText.length - 1];
					const formattedData = formatText(removeAll(tableData));
					compiledData = compiledData.concat(
						populateAthletes(
							formattedData,
							eventInfo,
							columnDetails.length,
							year
						)
					);
				});
				resolve(compiledData);
			} else {
				console.log(err);
			}
		});
	});
};

db.connect(MODE_TEST, () => {});

const insertToDatabase = async (meetData, dc) => {
	return new Promise((resolve, reject) => {
		let athleteData = meetData.resultData;
		for (let i = 0; i < athleteData.length; i++) {
			db
				.get()
				.query(
					`INSERT INTO Results (year, meetNAme, gender, athleteName, mark, place, event, round, eventGroup, school) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						parseInt(athleteData[i].meetYear),
						meetData.meetName,
						athleteData[i].gender,
						athleteData[i].name,
						athleteData[i].mark,
						isNaN(parseInt(athleteData[i].place))
							? 0
							: parseInt(athleteData[i].place),
						athleteData[i].event,
						athleteData[i].round,
						athleteData[i].eventGroup,
						athleteData[i].school
					],
					(err, result) => {
						if (err) {
							//console.log(athleteData);
							console.log(err);
							reject(err);
						}
						resolve();
					}
				);
		}
	});
};

//collectAthleteData(mens_meets_by_year);
collectAthleteData(NCAA_PRELIM_MEN, 'ncaa prelim', async meetData => {
	await insertToDatabase(meetData);
});
collectAthleteData(NCAA_PRELIM_WOMEN, 'ncaa prelim', async meetData => {
	await insertToDatabase(meetData);
});
collectAthleteData(ACC_OUTDOOR_MEN, 'acc outdoor', async meetData => {
	await insertToDatabase(meetData);
});
collectAthleteData(ACC_OUTDOOR_WOMEN, 'acc indoor', async meetData => {
	await insertToDatabase(meetData);
});
collectAthleteData(ACC_INDOOR_MEN, 'acc indoor', async meetData => {
	await insertToDatabase(meetData);
});
collectAthleteData(ACC_INDOOR_WOMEN, 'acc indoor', async meetData => {
	await insertToDatabase(meetData);
});
collectAthleteData(PAC12_OUTDOOR_MEN, 'pac-12 outdoor', async meetData => {
	await insertToDatabase(meetData);
});
collectAthleteData(PAC12_OUTDOOR_WOMEN, 'pac-12 outdoor', async meetData => {
	await insertToDatabase(meetData);
});
collectAthleteData(MPSF_MEN, 'mpsf', async meetData => {
	await insertToDatabase(meetData);
});
collectAthleteData(MPSF_WOMEN, 'mpsf', async meetData => {
	await insertToDatabase(meetData);
});
