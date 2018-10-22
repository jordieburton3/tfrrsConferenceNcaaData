import {
	MIDDLE_DISTANCE_EVENTS,
	DISTANCE_EVENTS,
	FIELD_EVENTS,
	SPRINTING_EVENTS
} from '../constants/EVENTS';

const removeAll = (list, element) => {
	return list.filter(e => {
		// TODO: regular expression for A and B teams etc.
		return (
			e !== element &&
			e !== '\t' &&
			!e.includes('(A)') &&
			!e.includes('(B)') &&
			!e.includes('(C)') &&
			!e.includes('(D)')
		);
	});
};

const replaceAll = (original, toReplace) => {
	let newString = original;
	while (newString.indexOf(toReplace) !== -1) {
		newString = newString.replace(toReplace, '');
	}
	return newString;
};

const printAll = list => {
	for (let i = 0; i < list.length; i++) {
		console.log(list[i]);
	}
};

export const formatText = list => {
	const newList = [];
	for (let i = 0; i < list.length; i++) {
		if (list[i].includes(String.fromCharCode(160))) {
			newList.push('N/A');
		} else {
			newList.push(replaceAll(list[i], ' '));
		}
	}
	return newList;
};

const checkRelay = event => {
	return event.toLowerCase().includes('relay');
};

const parseRelay = (list, eventDetails) => {
	const athleteData = [];
	let increment = !parseInt(list[8]) ? 8 : 7;
	for (let i = 0; i < list.length; i += increment) {
		let relayDetails = { ...eventDetails };
		relayDetails.place = list[i];
		//console.log([list[i + 2], list[i + 3], list[i + 4], list[i + 5]]);
		//console.log(list[i]);
		relayDetails.name = [
			list[i + 2].replace(',', ''),
			list[i + 3].replace(',', ''),
			list[i + 4].replace(',', ''),
			list[i + 5].replace(',', '')
		];
		relayDetails.year = 'N/A';
		relayDetails.school = list[i + 1];
		relayDetails.mark = list[i + 6];
		relayDetails.eventGroup = 'relay';
		athleteData.push(relayDetails);
	}
	return athleteData;
};

const determineEventGroup = input => {
	let event = input[0] === ' ' ? input.replace(' ', '') : input;
	if (FIELD_EVENTS.includes(event)) {
		return 'field event';
	} else if (SPRINTING_EVENTS.includes(event)) {
		return 'sprint';
	} else if (MIDDLE_DISTANCE_EVENTS.includes(event)) {
		return 'middle distance';
	} else if (DISTANCE_EVENTS.includes(event)) {
		return 'distance';
	}
	return '';
};

const populateAthletes = (list, eventDetails, increment, meetYear, season) => {
	if (FIELD_EVENTS.includes(eventDetails.event)) {
		return [];
	} else if (checkRelay(eventDetails.event)) {
		return [];
	} else {
		const athleteData = [];
		for (let i = 0; i < list.length; i += increment) {
			let athleteDetails = { ...eventDetails };
			athleteDetails.place = list[i];
			athleteDetails.name = list[i + 1];
			athleteDetails.year = list[i + 2];
			athleteDetails.school = list[i + 3];
			athleteDetails.mark = list[i + 4];
			athleteDetails.meetYear = meetYear;
			athleteDetails.season = season;
			athleteDetails.eventGroup = determineEventGroup(eventDetails.event);
			athleteData.push(athleteDetails);
		}
		return athleteData;
	}
};

export { removeAll, printAll, replaceAll, populateAthletes };
