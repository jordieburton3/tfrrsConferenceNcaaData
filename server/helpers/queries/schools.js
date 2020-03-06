import db from '../../db/db';
import mysql from 'mysql';

export const getAllSchools = (done) => {
    db.get().query('SELECT DISTINCT school FROM Conferences', [], (err, results) => {
        if (err) {
            done({ error: err });
        } else {
            done({ results });
        }
    });
}