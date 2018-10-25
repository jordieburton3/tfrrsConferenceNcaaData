import db from '../../db/db';
import mysql from 'mysql';

export const getAllConferences = (done) => {
    db.get().query('SELECT DISTINCT conference FROM Conferences', [], (err, results) => {
        if (err) {
            done({ error: err });
        } else {
            done({ results });
        }
    });
}