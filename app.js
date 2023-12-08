const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser')
const session = require('express-session');

const apiKey = 'df1e67f93440369e82c54d553192cb3b'; 

app.set("view engine", "ejs");
app.set('views', path.join( './views'));
app.use('/static', express.static("static/")); 
app.use(session({
    secret: 'votre_secret_session', // Clé secrète pour signer la session
    resave: false,
    saveUninitialized: false
}));
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.isAdmin = req.session.isAdmin || false;
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use('/register', require('./controllers/register'));
app.use('/movie-details',require('./controllers/moviesdetail'));
app.use('/movies',require('./controllers/movies'))
app.use('/login', require('./controllers/login'));
app.use('/logout', require('./controllers/logout'));
app.use('/profile',require('./controllers/profile'));
app.use('/watchlist',require('./controllers/watchlist'));
app.use('/admin',require('./controllers/admin'));






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
