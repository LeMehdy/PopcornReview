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

// Route for the profile page
router.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        const userId = req.session.userId; // Get the user ID from the session
        console.log(userId)
        // Replace SQL queries with your own logic to fetch user data from the database
        db.query('SELECT username, bio FROM users WHERE id = ?', [userId], (err, results) => {
            if (err) {
                console.error('Error fetching user data:', err);
                res.redirect('/'); // Redirect to the homepage or another page in case of an error
            } else {
                if (results.length > 0) {
                    const urlpp = results[0].profile_image_url;
                    const username = results[0].username;
                    const bio = results[0].bio;

                    // Render the profile page with user data
                    res.render('user', { username, bio, urlpp });
                } else {
                    // Handle case where no user corresponding to the ID is found
                    res.redirect('/'); // Redirect to the homepage or another page
                }
            }
        });
    } else {
        res.redirect('/'); // Redirect to the login page if the user is not logged in
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

module.exports = router;
