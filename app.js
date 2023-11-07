const express = require('express');
const app = express();

// Configuration pour utiliser EJS comme moteur de modèle
app.set('view engine', 'ejs');
const mysql = require('mysql');



// Importez la configuration de connexion à la base de données depuis votre fichier db.js
const db = require('./db');

app.get('/', async (req, res) => {
    try {
        const Nmovies = await getRecentMovies();
        const Rmovies = await getRandomMovies();

        res.render('index', { Nmovies, Rmovies });
    } catch (err) {
        console.error('Erreur lors de la récupération des films : ' + err);
        res.status(500).send('Erreur lors de la récupération des films');
    }
});

async function getRecentMovies() {
    return new Promise((resolve, reject) => {
        const Nquery = 'SELECT * FROM Movies ORDER BY ReleaseDate DESC LIMIT 5';
        db.query(Nquery, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

async function getRandomMovies() {
    return new Promise((resolve, reject) => {
        const Rquery = 'SELECT * FROM Movies ORDER BY RAND() LIMIT 5';
        db.query(Rquery, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Créez une route pour récupérer les films récemment ajoutés
app.get('/new-movies', (req, res) => {
    // Effectuez une requête SQL pour récupérer les films récemment ajoutés depuis la base de données
    const query = 'SELECT * FROM Movies ORDER BY ReleaseDate DESC LIMIT 5'; // Par exemple, les 5 films les plus récents

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des films récents : ' + err);
            res.status(500).send('Erreur lors de la récupération des films récents');
            return;
        }

        // Renvoyez les résultats à la vue (template) pour les afficher dans la section "New on PopcornReview"
        res.render('new-movies', { Nmovies: results });
    });
});

// Créez une route pour récupérer des films aléatoires
app.get('/random-movies', (req, res) => {
    // Effectuez une requête SQL pour récupérer des films aléatoires depuis la base de données
    const query = 'SELECT * FROM Movies ORDER BY RAND() LIMIT 5'; // Par exemple, 5 films aléatoires

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des films aléatoires : ' + err);
            res.status(500).send('Erreur lors de la récupération des films aléatoires');
            return;
        }

        // Renvoyez les résultats à la vue (template) pour les afficher dans la section "Some Random Movies"
        res.render('random-movies', { Rmovies: results });
    });
});

// Écoutez le port pour les requêtes HTTP
const port = 3000;
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
