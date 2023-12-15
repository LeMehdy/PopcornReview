const express = require('express');
const router = express.Router();
const axios = require('axios');

const apiKey = 'df1e67f93440369e82c54d553192cb3b';


router.get('/', async (req, res) => {
    const itemsPerPage = 20; 
    const pagesToFetch = 5; 
    const currentPage = parseInt(req.query.page) || 1; 
    let movies = [];

    try {
       
        const begin = (currentPage - 1) * 5 + 1
        for (let page = begin; page <= pagesToFetch + begin; page++) {
            const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false`);
            movies = movies.concat(response.data.results);
        }



        res.render('movies', { movies: movies, currentPage: currentPage});
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des films' });
    }
});

module.exports = router;
