const fs = require('fs');
const path = require('path');

module.exports = (app, mongoose, Movie) => {

    // APPI PRINCIPALE
    app.get('/api/random-movie', async (req, res) => {
        try {
            // Sélectionner un film au hasard dans la base de données
            const movie = await Movie.aggregate([{ $sample: { size: 1 } }]).exec();
            
            if (!movie || movie.length === 0) {
                return res.status(404).send('Aucun film trouvé');
            }

            const selectedMovie = movie[0];

            // Formatage de la réponse au format JSON
            const response = {
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

    console.log('Route /api/random-movie ajoutée pour afficher un film aléatoire.');
};
