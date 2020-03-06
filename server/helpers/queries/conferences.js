import db from '../../db/db';
import mysql from 'mysql';

export const getAllConferences = (done) => {
    db.get().query('SELECT DISTINCT conference, school FROM Conferences', [], (err, results) => {
        if (err) {
            done({ error: err });
        } else {
            const conferences = [...(new Set(results.map((res => res.conference))))]
            done({ conferences, schoolInfo: results });
        }
    });
}