const express = require('express');
const router = express.Router();
const mysql = require("mysql");
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

// Page d'inscription (register)
router.get('/', (req, res) => {
    res.render('register'); // Ou tout autre traitement pour cette route
});


router.post('/', (req, res) => {
  console.log(req.body)
    const { username, email, password, full_name, date_of_birth, bio, profile_image_url } = req.body;

    const user = {
        username,
        email,
        password,
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
        res.redirect('../'); // Redirection vers la page de connexion après l'inscription
    });
});

module.exports = router;
