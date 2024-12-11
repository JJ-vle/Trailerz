const fs = require('fs');
const path = require('path');

module.exports = (app, mongoose, Movie) => {

    // API pour obtenir l'ID d'un film par son nom
    app.get('/api/trouver-id', async (req, res) => {
        const nomFilm = req.query.nom; // Récupère le paramètre "nom" dans la requête

        // Vérifie si le nom du film est fourni
        if (!nomFilm) {
            return res.status(400).send('Veuillez fournir le nom du film');
        }

        try {
            // Recherche le film dans la base de données par son nom (insensible à la casse)
            const movie = await Movie.findOne({ name: new RegExp(`^${nomFilm}$`, 'i') }).exec();

            if (!movie) {
                return res.status(404).send('Film non trouvé');
            }

            // Renvoie l'ID du film trouvé
            res.json({
                id: movie._id
            });
        } catch (err) {
            console.error('Erreur:', err);
            res.status(500).send('Erreur serveur');
        }
    });

    //console.log('Route /api/trouver-id ajoutée pour rechercher un film par nom.');
};