import express from 'express';
import {
	fetchMeetData,
	fetchAll,
	fetchConferenceRepresentation,
	getEventSeasonInfo
} from '../helpers/queries/meets';
import { getAllConferences } from '../helpers/queries/conferences';
import { getAllSchools } from '../helpers/queries/schools';
const router = express.Router();

router.post('/api/conference', (req, res) => {
	// conferences, gender, eventgroups, event
	//console.log(res)
	fetchMeetData(req.body, result => {
		res.send(result);
	});
});

router.post('/api/conference_representation', (req, res) => {
	fetchConferenceRepresentation(req.body, result => {
		res.send(result);
	});
});

router.get('/api/get_all', (req, res) => {
	fetchAll(results => {
		res.send(results);
	});
});

router.get('/api/get_conferences', (req, res) => {
	getAllConferences(results => {
		res.send(results);
	});
});

router.get('/api/get_schools', (req, res) => {
	getAllSchools(results => {
		res.send(results);
	});
});

router.get('/api/get_event_info', (req, res) => {
	getEventSeasonInfo(results => {
		res.send(results);
	})
});

export default router;
