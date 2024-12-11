const fs = require('fs');
const path = require('path');

module.exports = (app, mongoose, Movie) => {
    // conversion de la durée en vraie durée
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

    // route de l'api
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

        // recherche par noms
        if (name) {
            query.name = { $regex: name, $options: 'i' }; //on enlève la bonne casse obligatoire
        }

        // reccherche par date
        if (startDate || endDate) {
            query.datePublished = {};
            if (startDate) query.datePublished.$gte = startDate;
            if (endDate) query.datePublished.$lte = endDate;
        }

        // recherche par genre
        if (genres) {
            query.genre = { $in: genres.split(',') }; //separation genres par ;
        }

        // recherche par acteur
        if (actors) {
            query['actor.name'] = { $regex: actors, $options: 'i' }; // retrait cassse
        }

        // recherche par réalisateur
        if (directors) {
            query['director.name'] = { $regex: directors, $options: 'i' }; // retrai casse
        }

        // recherche par durée
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

            // formatage de la réponse en json
            const formattedMovies = movies.map((movie) => ({
                name: movie.name || 'Titre inconnu',
                image: movie.image || '../resouces/trailers_pochette_basique.png',
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
                id: movie._id
            }));
            

            //envoi du json
            res.json(formattedMovies);
        } catch (err) {
            console.error('Erreur lors de la recherche des films:', err);
            res.status(500).send({ message: 'Erreur serveur' });
        }
    });

    console.log('Route /api/search-movie ajoutée pour la recherche de films.');
};
