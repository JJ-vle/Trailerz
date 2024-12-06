const fs = require('fs');
const path = require('path');

module.exports = (app, mongoose, Movie) => {

    // APPI PRINCIPALE
    app.get('/api/film-aleatoire', async (req, res) => {
        const categories = req.query.categories ? req.query.categories.split(',') : [];

        // Vérifier si les catégories sont valides
        const validCategories = [
            'Action', 'Adult', 'Adventure', 'Animation', 'Biography', 'Comedy', 
            'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Film-Noir', 
            'Game-Show', 'History', 'Horror', 'Music', 'Musical', 'Mystery', 
            'News', 'Reality-TV', 'Romance', 'Sci-Fi', 'Short', 'Sport', 
            'Talk-Show', 'Thriller', 'War', 'Western'
        ];

        // Vérifier que toutes les catégories sont valides
        if (categories.some(category => !validCategories.includes(category))) {
            return res.status(400).send('Catégorie invalide');
        }

        if (categories.length === 0) {
            return res.status(400).send('Veuillez sélectionner au moins une catégorie');
        }

        try {
            // Sélectionner un film aléatoire parmi les catégories spécifiées
            const movie = await Movie.aggregate([
                { $match: { genre: { $in: categories } } },
                { $sample: { size: 1 } }
            ]).exec();

            if (!movie || movie.length === 0) {
                return res.status(404).send('Aucun film trouvé dans ces catégories');
            }

            const selectedMovie = movie[0];

            // Formatage de la réponse au format JSON
            const response = {
                id: selectedMovie._id,
                name: selectedMovie.name || 'Film non trouvé',
                image: selectedMovie.image || 'https://via.placeholder.com/200x300?text=Image+indisponible',
                genre: selectedMovie.genre || ['Rien à afficher'],
                director: selectedMovie.director ? {
                    name: selectedMovie.director.name || 'Réalisateur inconnu',
                    url: addImdbUrl(selectedMovie.director.url)
                } : { name: 'Réalisateur inconnu', url: '#' },
                aggregateRating: selectedMovie.aggregateRating ? {
                    ratingValue: selectedMovie.aggregateRating.ratingValue || 'Rien à afficher',
                    ratingCount: selectedMovie.aggregateRating.ratingCount || 'Rien à afficher'
                } : { ratingValue: 'Rien à afficher', ratingCount: 'Rien à afficher' }
            };
            

            // Envoi de la réponse sous forme de JSON
            res.json(response);
        } catch (err) {
            console.error('Erreur:', err);
            res.status(500).send('Erreur serveur');
        }
    });

    // Ajoute l'URL IMDb devant chaque lien clicable
    const addImdbUrl = (url) => {
        return url ? `https://www.imdb.com${url}` : '#';
    };

    console.log('Route /api/random-movie ajoutée pour afficher un film aléatoire par catégorie.');
};
