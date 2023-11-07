const request = require('request');

function searchMoviePoster(movieTitle) {
    const apiKey = 'AIzaSyCPY9dIXlWByw7s6l2eyACJKci5dZrK5pU';
    const cx = '820463ecca5fa4557';
    const query = `${movieTitle} poster`;

    const options = {
        url: `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}`,
        method: 'GET',
        json: true,
    };

    request(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const items = body.items;
            if (items && items.length > 0) {
                // Vous pouvez traiter les résultats ici, par exemple, afficher les liens vers les images.
                for (const item of items) {
                    console.log(item.link);
                }
            } else {
                console.log('Aucune image trouvée.');
            }
        } else {
            console.error('Erreur lors de la recherche d\'images : ' + error);
        }
    });
}

// Utilisation de la fonction de recherche
searchMoviePoster('Nom de votre film');
