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

    // API pour afficher un carrousel des films les mieux notés et ayant le plus de notes par catégorie
    app.get('/api/carrousel-bestrate-cat', async (req, res) => {
        const category = req.query.category;  // Récupérer la catégorie depuis le paramètre de requête

        // Vérifier si une catégorie est fournie
        if (!category) {
            return res.status(400).send('Paramètre "category" manquant dans l\'URL');
        }

        try {
            // Récupération des 12 films les mieux notés et ayant reçu le plus de votes dans la catégorie spécifiée
            const movies = await Movie.aggregate([
                { $match: { genre: { $in: [category] } } },  // Filtrer les films ayant la catégorie spécifiée
                { $match: { 'aggregateRating.ratingValue': { $exists: true, $ne: null }, 'aggregateRating.ratingCount': { $exists: true, $ne: null } } }, // Assurer que la note et le nombre de votes existent
                { $sort: { 'aggregateRating.ratingValue': -1, 'aggregateRating.ratingCount': -1 } },  // Trier d'abord par note, puis par nombre de votes
                { $limit: 12 },  // Limiter à 12 films
                { $project: { _id: 1, image: 1, aggregateRating: 1 } } // Ne récupérer que les champs nécessaires
            ]).exec();

            if (!movies || movies.length === 0) {
                return res.status(404).send(`Aucun film trouvé dans la catégorie "${category}"`);
            }

            // Créer un Set pour éliminer les doublons basés sur l'ID
            const uniqueMovies = new Set();
            const filteredMovies = [];

            for (const movie of movies) {
                // Si le film n'est pas déjà dans le Set, on l'ajoute à la liste filtrée
                if (!uniqueMovies.has(movie._id.toString())) {
                    uniqueMovies.add(movie._id.toString());  // Ajouter l'ID du film au Set
                    filteredMovies.push(movie);  // Ajouter le film à la liste filtrée
                }
            }

            // Construire une réponse contenant uniquement les affiches
            const response = await Promise.all(filteredMovies.map(async (movie) => {
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