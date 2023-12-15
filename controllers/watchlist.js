const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config({ path: './.env' });
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

router.post('/add-to-watchlist/:movieId', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; 
        const movieId = req.params.movieId; 

        const insertQuery = 'INSERT INTO View (MovieID, UserID, AddToWatchlist) VALUES (?, ?, ?)';
        db.query(insertQuery, [movieId, userId, 1], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'ajout du film à la watchlist :', err);
                res.redirect('/'); 
            } else {
                res.redirect('/'); 
            }
        });
    } else {
        res.redirect('/register'); 
    }
});


router.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; 

        
        const selectQuery = 'SELECT * FROM View WHERE UserID = ? AND AddToWatchlist = 1';
        db.query(selectQuery, [userId], async (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération de la watchlist :', err);
                res.redirect('/');
            } else {
                const watchlistMovies = results;
                const moviesWithDetails = [];
                for (const movie of watchlistMovies) {
                    try {
                        const movieDetailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.movieID}?api_key=df1e67f93440369e82c54d553192cb3b`);
                        const movieDetails = movieDetailsResponse.data;
                        moviesWithDetails.push(movieDetails);
                    } catch (error) {
                        console.error('Erreur lors de la récupération des détails du film :', error);
                    }
                }
                res.render('watchlist', { watchlistMovies: moviesWithDetails });
            }
        });
    } else {
        res.redirect('/'); 
    }
});

router.post('/remove-from-watchlist/:movieId', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; 
        const movieId = req.params.movieId; 

        const deleteQuery = 'DELETE FROM View WHERE MovieID = ? AND UserID = ? AND AddToWatchlist = 1';
        db.query(deleteQuery, [movieId, userId], (err, result) => {
            if (err) {
                console.error('Erreur lors du retrait du film de la watchlist :', err);
                res.redirect('/watchlist'); 
            } else {
                res.redirect('/watchlist'); 
            }
        });
    } else {
        res.redirect('/'); 
    }
});




module.exports = router;