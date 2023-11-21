const express = require('express');
const app = express();
const axios = require('axios');
const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

const apiKey = 'df1e67f93440369e82c54d553192cb3b'; // Remplacez par votre clé API TMDb


app.set('view engine', 'ejs');

app.get('/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        // Appel à l'API pour récupérer les détails du film en utilisant l'ID du film
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
        const movieDetails = response.data;

        // Rendre la vue (template) EJS en transmettant les détails du film
        res.render('movie-details', { movieDetails: movieDetails });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des détails du film' });
    }
});

app.get('/', async (req, res) => {
    try {
        const trendingResponse = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
        const trendingMovies = trendingResponse.data.results;

        const newMoviesResponse = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=fr-FR&page=1`);
        const newMovies = newMoviesResponse.data.results;

        res.render('index', { movies: trendingMovies, newMovies: newMovies });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
});

// Écoutez le port pour les requêtes HTTP
const port = 3000;
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
