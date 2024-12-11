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

    // API pour récupérer l'image du film le mieux noté et ayant le plus de votes
    app.get('/api/best-rated-movie', async (req, res) => {
        try {
            // Récupération du film le mieux noté et ayant le plus de votes
            const bestMovie = await Movie.aggregate([
                {
                    $match: {
                        "aggregateRating.ratingValue": { $exists: true, $ne: null },
                        "aggregateRating.ratingCount": { $exists: true, $ne: null }
                    }
                },
                {
                    $addFields: {
                        ratingScore: {
                            $multiply: [
                                { $toDouble: "$aggregateRating.ratingValue" },
                                { $toInt: "$aggregateRating.ratingCount" }
                            ]
                        }
                    }
                },
                { $sort: { ratingScore: -1 } },
                { $limit: 1 },
                { $project: { _id: 1, image: 1, name: 1 } } // Ne récupérer que les champs nécessaires
            ]).exec();

            if (!bestMovie || bestMovie.length === 0) {
                return res.status(404).send('Aucun film trouvé');
            }

            const movie = bestMovie[0];

            // Vérification de l'image
            let imageUrl = movie.image && movie.image.trim() ? movie.image : '../resources/trailerz_pochette_basique.png';

            if (imageUrl !== '../resources/trailerz_pochette_basique.png') {
                const isValid = await isImageValid(imageUrl);
                if (!isValid) {
                    imageUrl = '../resources/trailerz_pochette_basique.png';
                }
            }

            // Construire et envoyer la réponse
            res.json({
                id: movie._id,
                name: movie.name,
                image: imageUrl
            });
        } catch (err) {
            console.error('Erreur:', err);
            res.status(500).send('Erreur serveur');
        }
    });
};
