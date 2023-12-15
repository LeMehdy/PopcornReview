const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect((error) => {
    if (error) {
        console.error('Erreur de connexion à la base de données :', error);
    } else {
        console.log('MySQL connecté avec succès !');
    }
});


router.get('/', (req, res) => {
    res.render('register'); 
});


router.post('/', async (req, res) => {
    console.log(req.body);
    const { username, email, password, full_name, date_of_birth, bio, profile_image_url } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); 

        const user = {
            username,
            email,
            password: hashedPassword, 
            full_name,
            date_of_birth,
            bio,
            profile_image_url
        };

        db.query('INSERT INTO users SET ?', user, (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Erreur lors de l\'inscription' });
                throw err;
            }
            res.redirect('../'); 
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});

module.exports = router;
