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


router.get('/', (req, res) => {
    res.render('login'); 
});


router.post('/', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                throw err;
            }

            if (results.length === 0) {
                res.send(
                    `<script>
                      alert('This email doesnt exist.');
                      window.location.href = '/register';
                    </script>`
                  );
                  return res.end();
          
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(password, user.password);
            console.log(passwordMatch)
            if (!passwordMatch) {
                res.send(
                    `<script>
                      alert('Wrong password.');
                      window.location.href = '/register';
                    </script>`
                  );
                  return res.end();
            }

            
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
