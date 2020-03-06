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
	MPSF_WOMEN,
	NCAA_INDOOR_FINAL_MENS,
	NCAA_INDOOR_FINAL_WOMENS,
	NCAA_OUTDOOR_FINAL_MENS,
	NCAA_OUTDOOR_FINAL_WOMENS,
	IVY_LEAGUE_INDOOR_MENS,
	IVY_LEAGUE_INDOOR_WOMENS,
	IVY_LEAGUE_OUTDOOR_MENS,
	IVY_LEAGUE_OUTDOOR_WOMENS,
	BIG_12_INDOOR_MENS,
	BIG_12_INDOOR_WOMENS,
	BIG_12_OUTDOOR_MENS,
	BIG_12_OUTDOOR_WOMENS,
	BIG_TEN_INDOOR_MENS,
	BIG_TEN_INDOOR_WOMENS,
	BIG_TEN_OUTDOOR_MENS,
	BIG_TEN_OUTDOOR_WOMENS,
	SEC_INDOOR_MENS,
	SEC_INDOOR_WOMENS,
	SEC_OUTDOOR_MENS,
	SEC_OUTDOOR_WOMENS,
	PATRIOT_LEAGUE_INDOOR_MENS,
	PATRIOT_LEAGUE_INDOOR_WOMENS,
	PATRIOT_LEAGUE_OUTDOOR_MENS,
	PATRIOT_LEAGUE_OUTDOOR_WOMENS,
	A_10_INDOOR_MENS,
	A_10_INDOOR_WOMENS,
	A_10_OUTDOOR_MENS,
	A_10_OUTDOOR_WOMENS,
	MOUNTAIN_WEST_INDOOR_MENS,
	MOUNTAIN_WEST_INDOOR_WOMENS,
	MOUNTAIN_WEST_OUTDOOR_MENS,
	MOUNTAIN_WEST_OUTDOOR_WOMENS,
	SUNBELT_INDOOR_MENS,
	SUNBELT_INDOOR_WOMENS,
	SUNBELT_OUTDOOR_MENS,
	SUNBELT_OUTDOOR_WOMENS
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

const collectAthleteData = async (data, meetName, season) => {
	return new Promise(async (resolve, reject) => {
		let compiledMeetResults = { meetName, resultData: [] };
		//scrapeAthleteData('https://www.tfrrs.org/results/36170/m/NCAA_East_Preliminary_Round/', 'm');
		for (let i = 0; i < data.length; i++) {
			// console.log(prelims);
			let meet = data[i];
			let meetResults = await scrapeAthleteData(meet, season);
			compiledMeetResults.resultData = compiledMeetResults.resultData.concat(
				meetResults
			);
			//printAll(compiledMeetResults[year]);
		}
		resolve(compiledMeetResults);
	});
};

// name$school$@year@!event!

const scrapeAthleteData = async (meet, season) => {
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
							year,
							season
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

const insertToDatabase = async (meetData, conference) => {
	return new Promise((resolve, reject) => {
		let athleteData = meetData.resultData;
		for (let i = 0; i < athleteData.length; i++) {
			db
				.get()
				.query(
					`INSERT INTO Results (year, meetName, gender, athleteName, class,  mark, place, event, round, eventGroup, school, season) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						parseInt(athleteData[i].meetYear),
						meetData.meetName,
						athleteData[i].gender,
						athleteData[i].name,
						athleteData[i].year,
						athleteData[i].mark,
						isNaN(parseInt(athleteData[i].place))
							? 0
							: parseInt(athleteData[i].place),
						athleteData[i].event,
						athleteData[i].round,
						athleteData[i].eventGroup,
						athleteData[i].school,
						athleteData[i].season
					],
					(err, result) => {
						if (err) {
							//console.log(athleteData);
							console.log(err);
							reject(err);
						}
					}
				);
			if (conference) {
				db
					.get()
					.query(`INSERT INTO Conferences (school, conference) VALUES (?, ?)`, [
						athleteData[i].school,
						conference
					]);
			}
		}
		resolve();
	});
};

//collectAthleteData(mens_meets_by_year);
const insertData = async () => {
	return new Promise(async (resolve, reject) => {
		await insertToDatabase(
			await collectAthleteData(NCAA_PRELIM_MEN, 'ncaa prelim', 'outdoor')
		);
		console.log("we in it");
		await insertToDatabase(
			await collectAthleteData(NCAA_PRELIM_WOMEN, 'ncaa prelim', 'outdoor')
		);
		await insertToDatabase(
			await collectAthleteData(ACC_OUTDOOR_MEN, 'acc', 'outdoor'),
			'acc'
		);
		await insertToDatabase(
			await collectAthleteData(ACC_OUTDOOR_WOMEN, 'acc', 'outdoor'),
			'acc'
		);
		await insertToDatabase(
			await collectAthleteData(ACC_INDOOR_MEN, 'acc', 'indoor'),
			'acc'
		);
		await insertToDatabase(
			await collectAthleteData(ACC_INDOOR_WOMEN, 'acc', 'indoor'),
			'acc'
		);
		await insertToDatabase(
			await collectAthleteData(PAC12_OUTDOOR_MEN, 'pac-12', 'outdoor'),
			'pac-12'
		);
		await insertToDatabase(
			await collectAthleteData(PAC12_OUTDOOR_WOMEN, 'pac-12', 'outdoor'),
			'pac-12'
		);
		await insertToDatabase(
			await collectAthleteData(MPSF_MEN, 'mpsf', 'indoor'),
			'mpsf'
		);
		await insertToDatabase(
			await collectAthleteData(MPSF_WOMEN, 'mpsf', 'indoor'),
			'mpsf'
		);
		await insertToDatabase(
			await collectAthleteData(NCAA_INDOOR_FINAL_MENS, 'ncaa', 'indoor')
		);
		await insertToDatabase(
			await collectAthleteData(NCAA_INDOOR_FINAL_WOMENS, 'ncaa', 'indoor')
		);
		await insertToDatabase(
			await collectAthleteData(NCAA_OUTDOOR_FINAL_MENS, 'ncaa', 'outdoor')
		);
		await insertToDatabase(
			await collectAthleteData(NCAA_OUTDOOR_FINAL_WOMENS, 'ncaa', 'outdoor')
		);
		await insertToDatabase(
			await collectAthleteData(IVY_LEAGUE_INDOOR_MENS, 'ivy league', 'indoor'),
			'ivy league'
		);
		await insertToDatabase(
			await collectAthleteData(
				IVY_LEAGUE_INDOOR_WOMENS,
				'ivy league',
				'indoor'
			),
			'ivy league'
		);
		await insertToDatabase(
			await collectAthleteData(
				IVY_LEAGUE_OUTDOOR_MENS,
				'ivy league',
				'outdoor'
			),
			'ivy league'
		);
		await insertToDatabase(
			await collectAthleteData(
				IVY_LEAGUE_OUTDOOR_WOMENS,
				'ivy league',
				'outdoor'
			),
			'ivy league'
		);
		await insertToDatabase(
			await collectAthleteData(BIG_12_INDOOR_MENS, 'big 12', 'indoor'),
			'big 12'
		);
		await insertToDatabase(
			await collectAthleteData(BIG_12_INDOOR_WOMENS, 'big 12,', 'indoor'),
			'big 12'
		);
		await insertToDatabase(
			await collectAthleteData(BIG_12_OUTDOOR_MENS, 'big 12', 'outdoor'),
			'big 12'
		);
		await insertToDatabase(
			await collectAthleteData(BIG_12_OUTDOOR_WOMENS, 'big 12', 'outdoor'),
			'big 12'
		);
		await insertToDatabase(
			await collectAthleteData(BIG_TEN_INDOOR_MENS, 'big ten', 'indoor'),
			'big ten'
		);
		await insertToDatabase(
			await collectAthleteData(BIG_TEN_INDOOR_WOMENS, 'big ten,', 'indoor'),
			'big ten'
		);
		await insertToDatabase(
			await collectAthleteData(BIG_TEN_OUTDOOR_MENS, 'big ten', 'outdoor'),
			'big ten'
		);
		await insertToDatabase(
			await collectAthleteData(BIG_TEN_OUTDOOR_WOMENS, 'big ten', 'outdoor'),
			'big ten'
		);
		await insertToDatabase(
			await collectAthleteData(SEC_INDOOR_MENS, 'sec', 'indoor'),
			'sec'
		);
		await insertToDatabase(
			await collectAthleteData(SEC_INDOOR_WOMENS, 'sec', 'indoor'),
			'sec'
		);
		await insertToDatabase(
			await collectAthleteData(SEC_OUTDOOR_MENS, 'sec', 'outdoor'),
			'sec'
		);
		await insertToDatabase(
			await collectAthleteData(SEC_OUTDOOR_WOMENS, 'sec', 'outdoor'),
			'sec'
		);
		await insertToDatabase(
			await collectAthleteData(
				PATRIOT_LEAGUE_INDOOR_MENS,
				'patriot league',
				'indoor'
			),
			'patriot league'
		);
		await insertToDatabase(
			await collectAthleteData(
				PATRIOT_LEAGUE_INDOOR_WOMENS,
				'patriot league',
				'indoor'
			),
			'patriot league'
		);
		await insertToDatabase(
			await collectAthleteData(
				PATRIOT_LEAGUE_OUTDOOR_MENS,
				'patriot league',
				'outdoor'
			),
			'patriot league'
		);
		await insertToDatabase(
			await collectAthleteData(
				PATRIOT_LEAGUE_OUTDOOR_WOMENS,
				'patriot league',
				'outdoor'
			),
			'patriot league'
		);
		await insertToDatabase(
			await collectAthleteData(A_10_INDOOR_MENS, 'a-10', 'indoor'),
			'a-10'
		);
		await insertToDatabase(
			await collectAthleteData(A_10_INDOOR_WOMENS, 'a-10', 'indoor'),
			'a-10'
		);
		await insertToDatabase(
			await collectAthleteData(A_10_OUTDOOR_MENS, 'a-10', 'outdoor'),
			'a-10'
		);
		await insertToDatabase(
			await collectAthleteData(A_10_OUTDOOR_WOMENS, 'a-10', 'outdoor'),
			'a-10'
		);
		await insertToDatabase(
			await collectAthleteData(
				MOUNTAIN_WEST_INDOOR_MENS,
				'mountain west',
				'indoor'
			),
			'mountain west'
		);
		await insertToDatabase(
			await collectAthleteData(
				MOUNTAIN_WEST_INDOOR_WOMENS,
				'mountain west',
				'indoor'
			),
			'mountain west'
		);
		await insertToDatabase(
			await collectAthleteData(
				MOUNTAIN_WEST_OUTDOOR_MENS,
				'mountain west',
				'outdoor'
			),
			'mountain west'
		);
		await insertToDatabase(
			await collectAthleteData(
				MOUNTAIN_WEST_OUTDOOR_WOMENS,
				'mountain west',
				'outdoor'
			),
			'mountain west'
		);
		await insertToDatabase(
			await collectAthleteData(SUNBELT_INDOOR_MENS, 'sunbelt', 'indoor'),
			'sunbelt'
		);
		await insertToDatabase(
			await collectAthleteData(SUNBELT_INDOOR_WOMENS, 'sunbelt', 'indoor'),
			'sunbelt'
		);
		await insertToDatabase(
			await collectAthleteData(SUNBELT_OUTDOOR_MENS, 'sunbelt', 'outdoor'),
			'sunbelt'
		);
		await insertToDatabase(
			await collectAthleteData(SUNBELT_OUTDOOR_WOMENS, 'sunbelt', 'outdoor'),
			'sunbelt'
		);
		resolve();
	});
};

db.connect(MODE_TEST, async () => {
	await insertData();
});
