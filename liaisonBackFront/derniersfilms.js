const fs = require('fs');
const path = require('path');

module.exports = (app, mongoose, Movie) => {

    app.get('/api/derniers-films', async (req, res) => {
        const page = parseInt(req.query.page) || 1; //page actuelle
        const limit = 15; //limite affichage par page
        const skip = (page - 1) * limit;

        try {
            //compte le nb total de films
            const totalMovies = await Movie.countDocuments();

            //verif si film existe dans la bd
            if (totalMovies === 0) {
                return res.status(404).json({
                    message: "Aucun film trouvé.",
                    movies: [],
                    totalMovies: 0,
                    totalPages: 0,
                    currentPage: page
                });
            }

            //recup film triés par date
            const movies = await Movie.find({})
                .sort({ datePublished: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            //calcul total pages
            const totalPages = Math.ceil(totalMovies / limit);

            //reponse JSON
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
