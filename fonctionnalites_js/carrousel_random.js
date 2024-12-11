const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = (app, mongoose, Movie) => {

    // mise en cache pour optimisation
    const imageCache = new Map();

    const isImageValid = async (imageUrl) => {
        // Vérifier dans le cache
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

    // API pour afficher 12 affiches de films aléatoires
    app.get('/api/carrousel-random', async (req, res) => {
        try {

            const movies = await Movie.aggregate([
                { $sample: { size: 12 } },
                { $project: { _id: 1, image: 1 } }
            ]).exec();

            if (!movies || movies.length === 0) {
                return res.status(404).send('Aucune affiche trouvée');
            }

            //réponse
            const response = await Promise.all(movies.map(async (movie) => {
                //si l'image est valide sur le web et/ou existe
                let imageUrl = movie.image && movie.image.trim() ? movie.image : '../resources/trailerz_pochette_basique.png';
                if (imageUrl !== '../resources/trailerz_pochette_basique.png') {
                    const isValid = await isImageValid(imageUrl);
                    if (!isValid) {
                        imageUrl = '../resources/trailerz_pochette_basique.png';
                    }
                }

                return {
                    id: movie._id,
                    image: imageUrl
                };
            }));

            //envoi réponse
            res.json(response);
        } catch (err) {
            console.error('Erreur:', err);
            res.status(500).send('Erreur serveur');
        }
    });

    //console.log('Route /api/carrousel-random ajoutée pour afficher un carrousel de films aléatoires.');
};
