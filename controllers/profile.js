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


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './static/img'); 
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
        fileSize: 1024 * 1024 * 5 
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

router.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; 
    console.log(userId)
    const selectQuery = 'SELECT * FROM View WHERE UserID = ? AND `Like` = 1';
    db.query(selectQuery, [userId], async (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération de la watchlist :', err);
            res.redirect('/');
            return; 
        } else {
            const LikeMovies = results;
            const moviesWithDetails = [];

            for (const movie of LikeMovies) {
                try {
                    const movieDetailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.movieID}?api_key=df1e67f93440369e82c54d553192cb3b`);
                    const movieDetails = movieDetailsResponse.data;

                    moviesWithDetails.push(movieDetails);
                } catch (error) {
                    console.error('Erreur lors de la récupération des détails du film :', error);
                }
            }

            db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
                if (err) {
                    console.error('Error fetching user data:', err);
                    res.redirect('/'); 
                    return; 
                }

                if (results.length > 0) {
                    const username = results[0].username;
                    const bio = results[0].bio;
                    const urlpp = results[0].profile_image_url;
                    res.render('user', { username, bio,urlpp, Movies: moviesWithDetails });
                } else {
                    res.redirect('/'); 
                }
            });
        }
    }
    );
    }

});

router.post('/update-bio', (req, res) => {
    const newBio = req.body.bio;
    const userId = req.session.userId; 
    
    const updateQuery = 'UPDATE users SET Bio = ? WHERE id = ?';
    db.query(updateQuery, [newBio, userId], (err, result) => {
        if (err) {
            console.error('ERROR:', err);
            res.redirect('/'); 
        } else {
            res.redirect('/profile'); 
        }
    });
});


router.post('/delete-account', (req, res) => {
    const userId = req.session.userId; 

    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    db.query(deleteQuery, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting account:', err);
            res.redirect('/'); 
        } else {
            req.session.destroy(err => {
                if (err) {
                    console.error('Error logging out:', err);
                    res.redirect('/'); 
                } else {
                    res.redirect('/'); 
                }
            });
        }
    });
});

router.post('/update-picture', upload.single('profilePicture'), (req, res, next) => {

    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const userId = req.session.userId; 
    const imagePath = './static/img/' + req.file.filename; 

    const updateQuery = 'UPDATE users SET profile_image_url = ? WHERE id = ?';
    db.query(updateQuery, [imagePath, userId], (err, result) => {
        if (err) {
            console.error('Error updating profile image:', err);
            return res.redirect('/'); 
        } else {
            res.redirect('/profile'); 
        }
    });
}, (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('A Multer error occurred when uploading:', err);
        return res.status(500).send('A Multer error occurred when uploading.');
    } else if (err) {
        console.error('An unknown error occurred when uploading:', err);
        return res.status(500).send('An unknown error occurred when uploading.');
    }
    next();
});

module.exports = router;
