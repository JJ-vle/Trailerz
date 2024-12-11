const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = (app, mongoose, Movie) => {

    // Cache des images déjà vérifiées
    const imageCache = new Map();

    // Fonction pour vérifier si une URL est valide
    const isImageValid = async (imageUrl) => {
        // Vérifier dans le cache
        if (imageCache.has(imageUrl)) {
            return imageCache.get(imageUrl);
        }

        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            const isValid = response.ok; // Vérifier si l'image existe (code 2xx)
            imageCache.set(imageUrl, isValid);  // Mettre en cache le résultat
            return isValid;
        } catch (error) {
            imageCache.set(imageUrl, false); // En cas d'erreur, on cache le résultat comme invalide
            return false;
        }
    };

    // API pour afficher un carrousel de 12 affiches de films d'horreur les mieux notés
    app.get('/api/carrousel-random-horror', async (req, res) => {
        try {
            // Récupération des 12 films d'horreur les mieux notés
            const movies = await Movie.aggregate([
                { $match: { genre: { $in: ['Horror'] } } },  // Filtrer les films ayant le genre 'Horror'
                { $match: { 'aggregateRating.ratingValue': { $exists: true, $ne: null } } }, // Assurer que la note existe
                { $sort: { 'aggregateRating.ratingValue': -1 } },  // Trier les films par note (ordre décroissant)
                { $limit: 12 },  // Limiter à 12 films
                { $project: { _id: 1, image: 1, aggregateRating: 1 } } // Ne récupérer que les champs nécessaires
            ]).exec();

            if (!movies || movies.length === 0) {
                return res.status(404).send('Aucune affiche de film d\'horreur trouvée');
            }

            // Construire une réponse contenant uniquement les affiches
            const response = await Promise.all(movies.map(async (movie) => {
                // Vérification si l'image existe et est valide
                let imageUrl = movie.image && movie.image.trim() ? movie.image : '../resources/trailerz_pochette_basique.png';

                // Si l'image existe, on vérifie sa validité
                if (imageUrl !== '../resources/trailerz_pochette_basique.png') {
                    const isValid = await isImageValid(imageUrl);
                    if (!isValid) {
                        imageUrl = '../resources/trailerz_pochette_basique.png';  // Si l'image n'est pas valide, utiliser l'image par défaut
                    }
                }

                // Si la note existe et est une chaîne, on la convertit en nombre
                const rating = parseFloat(movie.aggregateRating.ratingValue);

                return {
                    id: movie._id,
                    image: imageUrl,
                    rating: isNaN(rating) ? null : rating // Inclure la note si elle est valide
                };
            }));

            // Envoyer la réponse
            res.json(response);
        } catch (err) {
            console.error('Erreur:', err);
            res.status(500).send('Erreur serveur');
        }
    });

    //console.log('Route /api/carrousel-random-horror ajoutée pour afficher un carrousel des films d\'horreur les mieux notés.');
};
