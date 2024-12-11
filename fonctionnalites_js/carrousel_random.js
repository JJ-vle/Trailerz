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

    // API pour afficher un carrousel de 12 affiches de films aléatoires
    app.get('/api/carrousel-random', async (req, res) => {
        try {
            // Récupération de 12 films aléatoires
            const movies = await Movie.aggregate([
                { $sample: { size: 12 } },
                { $project: { _id: 1, image: 1 } } // Ne récupérer que les champs nécessaires
            ]).exec();

            if (!movies || movies.length === 0) {
                return res.status(404).send('Aucune affiche trouvée');
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

                return {
                    id: movie._id,
                    image: imageUrl
                };
            }));

            // Envoyer la réponse
            res.json(response);
        } catch (err) {
            console.error('Erreur:', err);
            res.status(500).send('Erreur serveur');
        }
    });

    //console.log('Route /api/carrousel-random ajoutée pour afficher un carrousel de films aléatoires.');
};
