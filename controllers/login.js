const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Connexion à la base de données MySQL
db.connect((error) => {
    if (error) {
        console.error('Erreur de connexion à la base de données :', error);
    } else {
        console.log('MySQL connecté avec succès !');
    }
});

// Page de connexion (login)
router.get('/login', (req, res) => {
    res.render('login'); // Affiche le formulaire de connexion
});

// Traitement du formulaire de connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérification si l'email existe dans la base de données
        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                throw error;
            }
            if (results.length === 0) {
                return res.status(401).json({ message: 'Adresse e-mail non trouvée' });
            }

            // Vérification du mot de passe
            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Mot de passe incorrect' });
            }

            res.status(200).json({ message: 'Connecté avec succès' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
});

module.exports = router;
