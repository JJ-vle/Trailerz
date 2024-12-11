const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = (app, mongoose, Movie) => {

    // mise en cache pour optimisation
    const imageCache = new Map();

    const isImageValid = async (imageUrl) => {
        if (imageCache.has(imageUrl)) {
            return imageCache.get(imageUrl);
        }

        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            const isValid = response.ok;
            imageCache.set(imageUrl, isValid);
            return isValid;
        } catch (error) {
            imageCache.set(imageUrl, false);
            return false;
        }
    };

    // API pour afficher 12 affiches de films les mieux notés par catégorie spécifiée dans l'URL
    app.get('/api/carrousel-bestrate-cat', async (req, res) => {
        const category = req.query.category;

        if (!category) {
            return res.status(400).send('Paramètre "category" manquant dans l\'URL');
        }

        try {
            const movies = await Movie.aggregate([
                { $match: { genre: { $in: [category] } } },  //filtre en fonction de la catégorie voulue
                { $match: { 'aggregateRating.ratingValue': { $exists: true, $ne: null }, 'aggregateRating.ratingCount': { $exists: true, $ne: null } } }, //nombre de votes et note existent ?
                { $sort: { 'aggregateRating.ratingValue': -1, 'aggregateRating.ratingCount': -1 } },  //On trie par note et par nombre de votes
                { $limit: 12 },  //12 uniquement
                { $project: { _id: 1, image: 1, aggregateRating: 1 } }
            ]).exec();

            if (!movies || movies.length === 0) {
                return res.status(404).send(`Aucun film trouvé dans la catégorie "${category}"`);
            }

            //reponse API
            const response = await Promise.all(movies.map(async (movie) => {
                let imageUrl = movie.image && movie.image.trim() ? movie.image : '../resources/trailerz_pochette_basique.png';

                if (imageUrl !== '../resources/trailerz_pochette_basique.png') {
                    const isValid = await isImageValid(imageUrl);
                    if (!isValid) {
                        imageUrl = '../resources/trailerz_pochette_basique.png';
                    }
                }

                // Si la note existe et est une chaîne, on la convertit en nombre
                const rating = parseFloat(movie.aggregateRating.ratingValue);

                return {
                    id: movie._id,
                    image: imageUrl,
                    rating: isNaN(rating) ? null : rating, // Inclure la note si elle est valide
                    ratingCount: movie.aggregateRating.ratingCount // Inclure le nombre de votes
                };
            }));

            // Envoyer la réponse
            res.json(response);
        } catch (err) {
            console.error('Erreur:', err);
            res.status(500).send('Erreur serveur');
        }
    });

    //console.log('Route /api/carrousel-bestrate-cat ajoutée pour afficher un carrousel des films les mieux notés et ayant le plus de notes par catégorie.');
};
