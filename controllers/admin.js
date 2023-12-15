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

const checkAdminAuthentication = (req, res, next) => {
    const userId = req.session.userId; 
    db.query('SELECT * FROM users WHERE id = ? AND isadmin = 1', [userId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification du statut administrateur :', err);
            res.status(500).send('Erreur de vérification du statut administrateur.');
        } else {
            if (results.length > 0) {
                next();
            } else {
                res.status(403).send('Accès interdit : vous n\'êtes pas autorisé en tant qu\'administrateur.');
            }
        }
    });

};

router.get('/', checkAdminAuthentication, (req, res) => {
    db.query('SELECT id, username, email FROM users ', (err, results) => {
        db.query('SELECT * FROM Suggestions', (err, result) => {   
        if (err) {
            console.error('Erreur lors de la récupération des utilisateurs :', err);
            res.status(500).send('Erreur lors de la récupération des utilisateurs.');
        } else {
            res.render('admin', { users: results, suggests: result }); 
        }
    });
});
});

router.post('/delete-user/:userId', checkAdminAuthentication, (req, res) => {
    const userIdToDelete = req.params.userId;

    db.query('DELETE FROM view WHERE userID = ?', userIdToDelete, (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression des vues de l\'utilisateur :', err);
            res.status(500).send('Erreur lors de la suppression des vues de l\'utilisateur.');
        } else {
            // Maintenant, vous pouvez supprimer l'utilisateur
            db.query('DELETE FROM users WHERE id = ?', userIdToDelete, (err, result) => {
                if (err) {
                    console.error('Erreur lors de la suppression du compte utilisateur :', err);
                    res.status(500).send('Erreur lors de la suppression du compte utilisateur.');
                } else {
                    res.redirect('/admin'); 
                }
            });
        }
    });
    db.query('DELETE FROM users WHERE id = ?', userIdToDelete, (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression du compte utilisateur :', err);
            res.status(500).send('Erreur lors de la suppression du compte utilisateur.');
        } else {
            res.redirect('/admin'); 
        }
    });
});

router.post('/delete-suggestion/:suggestionID', checkAdminAuthentication, (req, res) => {
    const sugIdToDelete = req.params.suggestionID;

    db.query('DELETE FROM suggestions WHERE suggestionID = ?', sugIdToDelete, (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression du compte utilisateur :', err);
            res.status(500).send('Erreur lors de la suppression du compte utilisateur.');
        } else {
            res.redirect('/admin'); 
        }
    });
});

module.exports = router;
