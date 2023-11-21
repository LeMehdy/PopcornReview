const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser')

const apiKey = 'df1e67f93440369e82c54d553192cb3b'; 
const router = express.Router();



router.get('/:id', async (req, res) => {
    try {
        const movieId = req.params.id;

        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
        const movieDetails = response.data;


        res.render('movie-details', { movieDetails: movieDetails });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des détails du film' });
    }
});
module.exports = router;
