const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});


router.get('/', (req, res) => {
    res.render('suggest'); 
});


router.post('/', (req, res) => {
    const { userID, title, category, description } = req.body;

    
    const insertQuery = 'INSERT INTO Suggestions (userID, title, category, description) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [userID, title, category, description], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suggestion :', err);
            res.redirect('/suggest'); 
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;
