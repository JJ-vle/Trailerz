const fs = require('fs');
const path = require('path');

module.exports = (app, mongoose, Movie) => {

    app.get('/api/derniers-films', async (req, res) => {
        const page = parseInt(req.query.page) || 1; // Page actuelle
        const limit = 15; // Limite de films par page
        const skip = (page - 1) * limit; // Calcul de l'offset

        try {
            // Compter le nombre total de films
            const totalMovies = await Movie.countDocuments();

            // Vérifier si des films existent
            if (totalMovies === 0) {
                return res.status(404).json({
                    message: "Aucun film trouvé.",
                    movies: [],
                    totalMovies: 0,
                    totalPages: 0,
                    currentPage: page
                });
            }

            // Récupérer les films triés par date de sortie descendante
            const movies = await Movie.find({})
                .sort({ datePublished: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            // Calcul des pages totales
            const totalPages = Math.ceil(totalMovies / limit);

            // Retourner la réponse JSON
            res.json({
                movies,
                totalMovies,
                totalPages,
                currentPage: page
            });
        } catch (err) {
            console.error('Erreur:', err);
            res.status(500).json({
                error: 'Erreur interne du serveur.',
                details: err.message
            });
        }
    });
};
