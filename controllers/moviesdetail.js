const express = require('express');
const router = express.Router();
const axios = require('axios');
const mysql = require('mysql');
const apiKey = 'df1e67f93440369e82c54d553192cb3b';
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});



router.get('/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
        const movieDetails = response.data;
        const selectUserQuery = 'SELECT * FROM Users WHERE id = ?';
        if (req.session.userId) {
            db.query(selectUserQuery, [req.session.userId], (err, userResults) => {
                if (err) {
                    console.error('Error fetching user info:', err);
                    res.status(500).json({ error: 'Error fetching user info' });
                    return;
                }
        
                const currentUser = userResults[0];
                getCommentsForMovie(movieId,currentUser);
            });
        } else {
            getCommentsForMovie(movieId, currentUser = null);
        }
        
        function getCommentsForMovie(movieId, currentUser) {
            const selectQuery = 'SELECT * FROM View WHERE movieID = ?';
            db.query(selectQuery, [movieId], (err, commentsForMovie) => {
                if (err) {
                    console.error('Error fetching comments:', err);
                    res.status(500).json({ error: 'Error fetching comments' });
                    return;
                }

                const likesQuery = 'SELECT SUM(`Like`) as likes FROM view WHERE movieID = ?';
                const ratingQuery = 'SELECT AVG(rating) as averageRating FROM Ratings WHERE movieId = ?';

                db.query(likesQuery, [movieId], (err, likesResult) => {
                    if (err) {
                        console.error('Error fetching likes:', err);
                        res.status(500).send('Error fetching likes');
                        return;
                    }

                    const likes = likesResult[0].likes;

                    db.query(ratingQuery, [movieId], (err, ratingResult) => {
                        if (err) {
                            console.error('Error fetching average rating:', err);
                            res.status(500).send('Error fetching average rating');
                            return;
                        }

                        const averageRating = ratingResult[0].averageRating;
                        console.log('userId:', req.session.userId);
                        console.log('movieId:', movieId);
                        const userLikeQuery = 'SELECT * FROM view WHERE userId = ? AND movieID = ?';
                        db.query(userLikeQuery, [req.session.userId, movieId], (err, userLikeResult) => {
                            if (err) {
                                console.error('Error fetching user like:', err);
                                res.status(500).send('Error fetching user like');
                                return;
                            }
                            const userHasLiked = userLikeResult.some(row => row.Like == 1);
                            const userHasWatchlisted = userLikeResult.some(row => row.addToWatchlist == 1);
                            res.render('movie-details', {
                                movieDetails: movieDetails,
                                comments: commentsForMovie,
                                currentUser: currentUser,
                                likes: likes,
                                averageRating: averageRating,
                                IsLoggedIn: !!req.session.userId,
                                userHasLiked: userHasLiked,
                                userHasWatchlisted: userHasWatchlisted
                            });
                        });
                    });
                });
            });
        }
    } catch (err) {
        console.error('Error fetching movie details:', err);
        res.status(500).json({ error: 'Error fetching movie details' });
    }
});


router.post('/:id/add-comment', async (req, res) => {
    const movieId = req.params.id;
    const commentText = req.body.reviewText; 
    const UserId = req.session.userId; 

    const insertQuery = 'INSERT INTO View (userID, movieID, reviewText) VALUES (?, ?, ?)';
    db.query(insertQuery, [UserId, movieId, commentText], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'insertion du commentaire :', err);
            res.status(500).json({ error: 'Erreur lors de l\'insertion du commentaire' });
        } else {
            res.redirect(`/movie-details/${movieId}`);
        }
    });
});
router.post('/:movieid/update-comment/:viewid', async (req, res) => {
    const movieId = req.params.movieid; 
    const commentId = req.params.viewid;
    const commentText = req.body.reviewText;
    console.log(commentId);
    const updateQuery = 'UPDATE View SET reviewText = ? WHERE ViewID = ?';
    db.query(updateQuery, [commentText, commentId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour du commentaire :', err);
            res.status(500).json({ error: 'Erreur lors de la mise à jour du commentaire' });
        } else {
            res.redirect(`/movie-details/${movieId}`);
        }
    });
});
router.post('/:movieid/delete-comment/:viewid', async (req, res) => {
    const movieId = req.params.movieid; 
    const commentId = req.params.viewid;
    console.log(commentId);
    const deleteQuery = 'DELETE FROM View WHERE ViewID = ?';
    db.query(deleteQuery, [commentId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression du commentaire :', err);
            res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
        } else {
            res.redirect(`/movie-details/${movieId}`);
        }
    });
});
router.post('/:movieId/rate', (req, res) => {
    const movieId = req.params.movieId;
    const userId = req.body.userId;
    const rating = req.body.rating;
    const findQuery = 'SELECT * FROM Ratings WHERE movieId = ? AND userId = ?';
    db.query(findQuery, [movieId, userId], (err, existingRatings) => {
        if (err) {
            console.error(err); 
            res.status(500).json({ error: 'Erreur lors de la recherche de la note' });
        } else {
            if (existingRatings.length > 0) {
                const updateQuery = 'UPDATE Ratings SET rating = ? WHERE movieId = ? AND userId = ?';
                db.query(updateQuery, [rating, movieId, userId], (err, result) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ error: 'Erreur lors de la mise à jour de la note' });
                    } else {
                        res.json({ message: 'Note mise à jour' });
                    }
                });
            } else {
                const insertQuery = 'INSERT INTO Ratings (movieId, userId, rating) VALUES (?, ?, ?)';
                db.query(insertQuery, [movieId, userId, rating], (err, result) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ error: 'Erreur lors de la création de la note' });
                    } else {
                        res.json({ message: 'Note créée' });
                    }
                });
            }
        }
    });
});
router.post('/:movieid/delete-rating', (req, res) => {
    const movieId = req.params.id;
    const userId = req.session.userId;
    
    const sql = 'DELETE FROM Ratings WHERE movieId = ? AND userId = ?';
    db.query(sql, [movieId, userId], (err, result) => {
        if (err) {
            console.error('Error deleting rating:', err);
            res.status(500).send('Error deleting rating');
            return;
        }

        res.send('Rating deleted');
    });
});

router.post('/add-to-Like/:movieId', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; 
        const movieId = req.params.movieId; 
        const insertQuery = 'INSERT INTO View (MovieID, UserID, `Like`) VALUES (?, ?, ?)';
        db.query(insertQuery, [movieId, userId, 1], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'ajout du film à la watchlist :', err);
                res.redirect('/'); 
            }else {
                res.redirect(/movie-details/ + movieId);
            } 
        });
    } else {
        res.redirect('/register'); 
    
    }

});
router.post('/remove-from-Like/:movieId', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; 
        const movieId = req.params.movieId; 

    
        const updateQuery = 'UPDATE View SET `Like` = 0 WHERE MovieID = ? AND UserID = ?';
        db.query(updateQuery, [movieId, userId], (err, result) => {
            if (err) {
                console.error('Erreur lors de la suppression du "like" pour le film :', err);
                res.redirect('/'); 
            } else {
                res.redirect('/movie-details/' + movieId);
            }
        });
    } else {
        res.redirect('/register'); 
    }
});


router.get('/:movieId/likes', (req, res) => {
    const movieId = req.params.movieId;
    const sql = 'SELECT COUNT(*) as likes FROM Likes WHERE movieId = ?';
    db.query(sql, [movieId], (err, result) => {
        if (err) {
            console.error('Error fetching likes:', err);
            res.status(500).send('Error fetching likes');
            return;
        }

        res.json(result[0]);
    });
});

router.get('/:movieId/average-rating', (req, res) => {
    const movieId = req.params.movieId;
    const sql = 'SELECT AVG(rating) as averageRating FROM Ratings WHERE movieId = ?';
    db.query(sql, [movieId], (err, result) => {
        if (err) {
            console.error('Error fetching average rating:', err);
            res.status(500).send('Error fetching average rating');
            return;
        }

        res.json(result[0]);
    });
});

router.post('/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchTerm)}`);
        const searchResults = response.data.results;

        //res.json({ results: searchResults });
        res.redirect(`/movie-details/${searchResults[0].id}`)
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la recherche de films' });
    }
    });

module.exports = router;
