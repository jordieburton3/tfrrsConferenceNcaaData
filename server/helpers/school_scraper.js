import request from 'request';
import cheerio from 'cheerio';

export default async () => {
	return new Promise((resolve, reject) => {
		let names = [];
		let count = 0;
		request(
			'https://en.wikipedia.org/wiki/List_of_NCAA_Division_I_institutions',
			function(err, resp, body) {
				if (!err && resp.statusCode == 200) {
					var $ = cheerio.load(body);
					var count = 0;
					$('tr', '.sortable').each(function() {
						const row = $(this)
							.text()
							.split('\n');
						const data = [
							getTeamName(row[1])
								.split(' ')
								.join('_'),
							getAbbrev(row[4])
						];
						names.push(data);
						let splitData = data[0].split('_');
						if (splitData[splitData.length - 1] == 'State') {
							splitData[splitData.length - 1] = 'St';
							names.push([splitData.join('_'), getAbbrev(row[4])]);
						}
						count++;
					});
					resolve(names);
				} else {
					console.log(resp.statusCode);
					reject(err);
				}
			}
		);
	});
};
