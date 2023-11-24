const express = require('express');
const router = express.Router();
const axios = require('axios');

const apiKey = 'df1e67f93440369e82c54d553192cb3b';

// Route pour afficher la liste des films
router.get('/', async (req, res) => {
    const itemsPerPage = 50; // Nombre d'éléments par page
    const page = req.query.page || 1; // Numéro de la page demandée

    try {
        // Récupération des films depuis l'API TMDB
        const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page_size=50`);
        const movies = response.data.results;

        // Calcul du nombre total de pages
        const totalResults = response.data.total_results;
        const totalPages = Math.ceil(totalResults / itemsPerPage);

        res.render('movies', { movies: movies, currentPage: page, totalPages: totalPages });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des films' });
    }
});


module.exports = router;
