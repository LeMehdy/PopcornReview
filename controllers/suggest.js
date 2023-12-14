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

// Route pour afficher le formulaire de suggestion
router.get('/', (req, res) => {
    res.render('suggest'); // Rendre la page EJS pour le formulaire de suggestion
});

// Route pour gérer la soumission du formulaire de suggestion
router.post('/', (req, res) => {
    const { userID, title, category, description } = req.body;

    // Insérer la suggestion dans la base de données
    const insertQuery = 'INSERT INTO Suggestions (userID, title, category, description) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [userID, title, category, description], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suggestion :', err);
            res.redirect('/suggest'); // Redirection en cas d'erreur
        } else {
            res.redirect('/'); // Redirection vers la page principale après la suggestion
        }
    });
});

module.exports = router;
