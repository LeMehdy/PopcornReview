const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
dotenv.config({ path: './.env' });
const dirPath = path.join(__dirname, '../static/img');
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

fs.access(dirPath, fs.constants.F_OK, (err) => {
    if (err) {
        console.error(`Le dossier ${dirPath} n'existe pas`);
    } else {
        console.log(`Le dossier ${dirPath} existe`);
    }
});

// Configuration de multer pour la gestion des fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './static/img'); // Répertoire où les images téléchargées seront stockées temporairement
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extension);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite de taille du fichier (ici, 5 Mo)
    },
    fileFilter: function (req, file, cb) {
        // Vérifier le type de fichier (ici, uniquement les images)
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

router.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; // Get the user ID from the session
    console.log(userId)
    const selectQuery = 'SELECT * FROM View WHERE UserID = ? AND `Like` = 1';
    db.query(selectQuery, [userId], async (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération de la watchlist :', err);
            res.redirect('/'); // Redirigez vers la page d'accueil en cas d'erreur
            return; // Stop execution
        } else {
            const LikeMovies = results;
            const moviesWithDetails = [];

            // Boucle à travers les films de la watchlist
            for (const movie of LikeMovies) {
                try {
                    const movieDetailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.movieID}?api_key=df1e67f93440369e82c54d553192cb3b`);
                    const movieDetails = movieDetailsResponse.data;

                    // Ajout des détails du film à un tableau
                    moviesWithDetails.push(movieDetails);
                } catch (error) {
                    console.error('Erreur lors de la récupération des détails du film :', error);
                }
            }

            // Get user info
            db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
                if (err) {
                    console.error('Error fetching user data:', err);
                    res.redirect('/'); // Redirect to the homepage or another page in case of an error
                    return; // Stop execution
                }

                if (results.length > 0) {
                    const username = results[0].username;
                    const bio = results[0].bio;
                    const urlpp = results[0].profile_image_url;
                    // Render the profile page with user data and movie details
                    res.render('user', { username, bio,urlpp, Movies: moviesWithDetails });
                } else {
                    // Handle case where no user corresponding to the ID is found
                    res.redirect('/'); // Redirect to the homepage or another page
                }
            });
        }
    }
    );
    }

});

router.post('/update-bio', (req, res) => {
    const newBio = req.body.bio;
    const userId = req.session.userId; // Get the ID of the logged-in user from the session

    // Update the user's bio in the database
    
    const updateQuery = 'UPDATE users SET Bio = ? WHERE id = ?';
    db.query(updateQuery, [newBio, userId], (err, result) => {
        if (err) {
            console.error('ERROR:', err);
            res.redirect('/'); // Redirect to the homepage in case of an error
        } else {
            res.redirect('/profile'); // Redirect the user to the profile page after updating the bio
        }
    });
});

// Route to delete the user's account
router.post('/delete-account', (req, res) => {
    const userId = req.session.userId; // Get the ID of the logged-in user from the session

    // Delete the user's account from the database
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    db.query(deleteQuery, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting account:', err);
            res.redirect('/'); // Redirect to the homepage in case of an error
        } else {
            // Log out the user by destroying their session
            req.session.destroy(err => {
                if (err) {
                    console.error('Error logging out:', err);
                    res.redirect('/'); // Redirect to the homepage in case of an error
                } else {
                    res.redirect('/'); // Redirect to the homepage after deleting the account
                }
            });
        }
    });
});

router.post('/update-picture', upload.single('profilePicture'), (req, res, next) => {
    // Access the uploaded file via req.file
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    // Save the image path in the database
    const userId = req.session.userId; // Get the ID of the logged-in user from the session
    const imagePath = './static/img/' + req.file.filename; // Build the image path

    const updateQuery = 'UPDATE users SET profile_image_url = ? WHERE id = ?';
    db.query(updateQuery, [imagePath, userId], (err, result) => {
        if (err) {
            console.error('Error updating profile image:', err);
            return res.redirect('/'); // Redirect to the home page in case of error
        } else {
            res.redirect('/profile'); // Redirect to the profile page after updating the image
        }
    });
}, (err, req, res, next) => {
    // This is the error-handling middleware function
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.error('A Multer error occurred when uploading:', err);
        return res.status(500).send('A Multer error occurred when uploading.');
    } else if (err) {
        // An unknown error occurred when uploading.
        console.error('An unknown error occurred when uploading:', err);
        return res.status(500).send('An unknown error occurred when uploading.');
    }

    // Everything went fine.
    next();
});

module.exports = router;
