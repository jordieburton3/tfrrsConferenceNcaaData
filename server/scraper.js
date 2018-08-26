import request from 'request';
import cheerio from 'cheerio';
import { men_src_urls, women_src_urls } from './constants/urls';
import {
	getSchoolNames,
	createYearMapping,
	removeAll,
	formatList,
	printAll
} from './helpers';

const mens_meets_by_year = createYearMapping(men_src_urls);
const women_meets_by_year = createYearMapping(women_src_urls);

const collectAthleteData = async (data, gender) => {
	let athleteSet = new Set();
	for (let year in data) {
		let prelims = data[year];
		for (let i = 0; i < prelims.length; i++) {
			let meet = prelims[i];
			let d = await scrapeAthleteData(meet);
		}
	}
};

// name$school$@year@!event!

const scrapeAthleteData = async meet => {
	return new Promise((resolve, reject) => {
		request(meet, (err, resp, body) => {
			if (!err && resp.statusCode == 200) {
				let $ = cheerio.load(body);
				$('table').each((i, element) => {
					const data = $(element);
					//console.log(data.attr('class', 'tablesaw').text().split('\n'));
					const details = removeAll(
						data
							.attr('class', 'tablesaw')
							.text()
							.split('\n'),
						''
					);
					//console.log(details);
					if (!details.includes('CONV')) {
						let formattedList = formatList(details);
						//printAll(details);
						console.log(formattedList);
					}
					resolve(data);
				});
			} else {
				console.log(err);
			}
		});
	});
};

collectAthleteData(mens_meets_by_year, 'm');
