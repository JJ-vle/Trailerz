const fs = require('fs');
const path = require('path');

module.exports = (app, mongoose, Movie) => {
    // Fonction pour convertir la durée ISO 8601 en minutes
    const durationToMinutes = (duration) => {
        const regex = /^PT(\d+H)?(\d+M)?$/;
        const match = duration.match(regex);

        let hours = 0;
        let minutes = 0;

        if (match) {
            if (match[1]) hours = parseInt(match[1].replace('H', ''), 10);
            if (match[2]) minutes = parseInt(match[2].replace('M', ''), 10);
        }

        return hours * 60 + minutes;
    };

    // Route pour rechercher des films
    app.get('/api/search-movie', async (req, res) => {
        const { 
            name, 
            startDate, 
            endDate, 
            genres, 
            actors, 
            directors, 
            minDuration, 
            maxDuration 
        } = req.query;

        let query = {};

        // Recherche par nom
        if (name) {
            query.name = { $regex: name, $options: 'i' }; // Insensible à la casse
        }

        // Recherche par date
        if (startDate || endDate) {
            query.datePublished = {};
            if (startDate) query.datePublished.$gte = startDate;
            if (endDate) query.datePublished.$lte = endDate;
        }

        // Recherche par genres
        if (genres) {
            query.genre = { $in: genres.split(',') }; // Plusieurs genres séparés par des virgules
        }

        // Recherche par acteur
        if (actors) {
            query['actor.name'] = { $regex: actors, $options: 'i' }; // Insensible à la casse
        }

        // Recherche par réalisateur
        if (directors) {
            query['director.name'] = { $regex: directors, $options: 'i' }; // Insensible à la casse
        }

        // Recherche par durée
        if (minDuration || maxDuration) {
            const minMinutes = minDuration ? durationToMinutes(minDuration) : 0;
            const maxMinutes = maxDuration ? durationToMinutes(maxDuration) : Infinity;

            query.duration = { 
                $gte: `PT${Math.floor(minMinutes / 60)}H${minMinutes % 60}M`, 
                $lte: `PT${Math.floor(maxMinutes / 60)}H${maxMinutes % 60}M`
            };
        }

        try {
            const movies = await Movie.find(query);
            if (movies.length === 0) {
                return res.status(404).send({ message: 'Aucun film trouvé avec ces critères.' });
            }

            // Formater la réponse
            const formattedMovies = movies.map((movie) => ({
                name: movie.name || 'Titre inconnu',
                image: movie.image || 'https://via.placeholder.com/200x300?text=Image+indisponible',
                genre: movie.genre || ['Genre inconnu'],
                director: movie.director ? {
                    name: movie.director.name || 'Réalisateur inconnu',
                    url: movie.director.url ? `https://www.imdb.com${movie.director.url}` : '#'
                } : { name: 'Réalisateur inconnu', url: '#' },
                aggregateRating: movie.aggregateRating ? {
                    ratingValue: movie.aggregateRating.ratingValue || 'Non noté',
                    ratingCount: movie.aggregateRating.ratingCount || 'Aucun vote'
                } : { ratingValue: 'Non noté', ratingCount: 'Aucun vote' },
                duration: movie.duration ? `${durationToMinutes(movie.duration)} minutes` : 'Durée inconnue',
                datePublished: movie.datePublished || 'Date inconnue',
                id: movie._id // Ajout de l'ID
            }));
            

            res.json(formattedMovies);
        } catch (err) {
            console.error('Erreur lors de la recherche des films:', err);
            res.status(500).send({ message: 'Erreur serveur' });
        }
    });

    console.log('Route /api/search-movie ajoutée pour la recherche de films.');
};
