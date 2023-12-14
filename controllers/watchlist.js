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
// Route pour ajouter un film à la watchlist
router.post('/add-to-watchlist/:movieId', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; // Obtenez l'ID de l'utilisateur connecté depuis la session
        const movieId = req.params.movieId; // Obtenez l'ID du film à ajouter depuis les paramètres d'URL

        // Insérez une entrée dans la table Views pour ajouter ce film à la watchlist de l'utilisateur
        const insertQuery = 'INSERT INTO View (MovieID, UserID, AddToWatchlist) VALUES (?, ?, ?)';
        db.query(insertQuery, [movieId, userId, 1], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'ajout du film à la watchlist :', err);
                res.redirect('/'); // Redirigez vers la page d'accueil en cas d'erreur
            } else {
                res.redirect('/'); // Redirigez l'utilisateur vers la page d'accueil après l'ajout du film
            }
        });
    } else {
        res.redirect('/register'); // Redirigez vers la page de connexion si l'utilisateur n'est pas connecté
    }
});

// Route pour afficher la watchlist de l'utilisateur
// Route pour afficher la watchlist de l'utilisateur
router.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; // Obtenez l'ID de l'utilisateur connecté depuis la session

        // Sélectionnez tous les films ajoutés à la watchlist de l'utilisateur depuis la table Views
        const selectQuery = 'SELECT * FROM View WHERE UserID = ? AND AddToWatchlist = 1';
        db.query(selectQuery, [userId], async (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération de la watchlist :', err);
                res.redirect('/'); // Redirigez vers la page d'accueil en cas d'erreur
            } else {
                const watchlistMovies = results;

                // Utilisation de la librairie axios pour effectuer des requêtes HTTP
                const axios = require('axios');
                const moviesWithDetails = [];

                // Boucle à travers les films de la watchlist
                for (const movie of watchlistMovies) {
                    try {
                        const movieDetailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.movieID}?api_key=df1e67f93440369e82c54d553192cb3b`);
                        const movieDetails = movieDetailsResponse.data;

                        // Ajout des détails du film à un tableau
                        moviesWithDetails.push(movieDetails);
                    } catch (error) {
                        console.error('Erreur lors de la récupération des détails du film :', error);
                    }
                }

                // Rendu de la vue watchlist avec les films de la watchlist et leurs détails complets
                res.render('watchlist', { watchlistMovies: moviesWithDetails });
            }
        });
    } else {
        res.redirect('/'); // Redirigez vers la page de connexion si l'utilisateur n'est pas connecté
    }
});
// Route pour retirer un film de la watchlist
router.post('/remove-from-watchlist/:movieId', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; // Obtenez l'ID de l'utilisateur connecté depuis la session
        const movieId = req.params.movieId; // Obtenez l'ID du film à retirer depuis les paramètres d'URL

        // Supprimez l'entrée correspondante dans la table Views pour retirer ce film de la watchlist de l'utilisateur
        const deleteQuery = 'DELETE FROM View WHERE MovieID = ? AND UserID = ? AND AddToWatchlist = 1';
        db.query(deleteQuery, [movieId, userId], (err, result) => {
            if (err) {
                console.error('Erreur lors du retrait du film de la watchlist :', err);
                res.redirect('/watchlist'); // Redirigez vers la watchlist en cas d'erreur
            } else {
                res.redirect('/watchlist'); // Redirigez l'utilisateur vers sa watchlist après le retrait du film
            }
        });
    } else {
        res.redirect('/'); // Redirigez vers la page de connexion si l'utilisateur n'est pas connecté
    }
});




module.exports = router;