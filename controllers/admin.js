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

// Vérification de l'authentification de l'administrateur, à adapter selon votre système d'authentification
const checkAdminAuthentication = (req, res, next) => {
    const userId = req.session.userId; // Récupérez l'ID de l'utilisateur connecté depuis la session

    // Requête SQL pour vérifier si l'utilisateur est un administrateur
    db.query('SELECT * FROM users WHERE id = ? AND isadmin = 1', [userId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification du statut administrateur :', err);
            res.status(500).send('Erreur de vérification du statut administrateur.');
        } else {
            if (results.length > 0) {
                // L'utilisateur est un administrateur, autorise l'accès
                next();
            } else {
                // L'utilisateur n'est pas un administrateur, refuser l'accès
                res.status(403).send('Accès interdit : vous n\'êtes pas autorisé en tant qu\'administrateur.');
            }
        }
    });

};

// Page d'administration pour supprimer les comptes utilisateurs
router.get('/', checkAdminAuthentication, (req, res) => {
    // Récupérer la liste des utilisateurs depuis la base de données
    db.query('SELECT id, username, email FROM users ', (err, results) => {
        db.query('SELECT * FROM Suggestions', (err, result) => {   
        if (err) {
            console.error('Erreur lors de la récupération des utilisateurs :', err);
            res.status(500).send('Erreur lors de la récupération des utilisateurs.');
        } else {
            // Afficher la page d'administration avec la liste des utilisateurs
            res.render('admin', { users: results, suggests: result }); // Utilisez votre template pour afficher les utilisateurs
        }
    });
});
});

// Route pour supprimer un compte utilisateur spécifique
router.post('/delete-user/:userId', checkAdminAuthentication, (req, res) => {
    const userIdToDelete = req.params.userId;

    // Supprimer le compte utilisateur de la base de données
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
                    res.redirect('/admin'); // Redirection vers la page d'administration après la suppression
                }
            });
        }
    });
    db.query('DELETE FROM users WHERE id = ?', userIdToDelete, (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression du compte utilisateur :', err);
            res.status(500).send('Erreur lors de la suppression du compte utilisateur.');
        } else {
            res.redirect('/admin'); // Redirection vers la page d'administration après la suppression
        }
    });
});

router.post('/delete-suggestion/:suggestionID', checkAdminAuthentication, (req, res) => {
    const sugIdToDelete = req.params.suggestionID;

    // Supprimer le compte utilisateur de la base de données
    db.query('DELETE FROM suggestions WHERE suggestionID = ?', sugIdToDelete, (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression du compte utilisateur :', err);
            res.status(500).send('Erreur lors de la suppression du compte utilisateur.');
        } else {
            res.redirect('/admin'); // Redirection vers la page d'administration après la suppression
        }
    });
});

module.exports = router;
