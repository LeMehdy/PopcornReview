const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Votre route pour afficher le formulaire de connexion
router.get('/', (req, res) => {
    res.render('login'); // Affiche le formulaire de connexion
});

// Traitement du formulaire de connexion
router.post('/', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                throw err;
            }

            if (results.length === 0) {
                return res.status(400).json({ error: 'Email incorrect' });
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(password, user.password);
            console.log(passwordMatch)
            if (!passwordMatch) {
                return res.status(400).json({ error: 'Mot de passe incorrect' });
            }

            // Authentification réussie, redirigez l'utilisateur vers une autre page
            const userId = results[0].id;
            req.session.userId = userId;
            req.session.isLoggedIn = true;

        
                        
            db.query('SELECT * FROM users WHERE id = ? AND isadmin = 1', [userId], (err, results) => {
                if (err) {
                    console.error('Erreur lors de la vérification du statut administrateur :', err);
                    res.status(500).send('Erreur de vérification du statut administrateur.');
                } else if (results.length > 0) {
                        
                        req.session.isAdmin = true;
                        
                        console.log('Contenu de req.session après modification :', req.session);
                        res.redirect('/');
                        
                }
                else {
                    console.log('Contenu de req.session après modification :', req.session);
                    res.redirect('/');
                }
            }
            
            );
            


        });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
});


module.exports = router;
