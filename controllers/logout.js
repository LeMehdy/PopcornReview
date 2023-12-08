// Dans votre fichier logout.js ou dans la section appropriée de votre application Express
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // Déconnexion de la session
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
        // Redirection vers la page d'accueil ou une autre page après la déconnexion
        res.redirect('/');
    });
});

module.exports = router;
