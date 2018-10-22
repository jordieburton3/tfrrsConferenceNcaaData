import express from 'express';
import {
	fetchMeetData,
	fetchAll,
	fetchConferenceRepresentation
} from '../helpers/queries/meets';
const router = express.Router();

router.post('/conference', (req, res) => {
	// conferences, gender, eventgroups, event
	//console.log(res)
	fetchMeetData(req.body, result => {
		res.send(result);
	});
});

router.post('/conference_representation', (req, res) => {
	fetchConferenceRepresentation(req.body, result => {
		res.send(result);
	});
});

router.get('/get_all', (req, res) => {
	fetchAll(results => {
		res.send(results);
	});
});

export default router;
