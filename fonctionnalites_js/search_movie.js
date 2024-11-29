module.exports = (app, mongoose) => {
    const movieSchema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        '@context': String,
        '@type': String,
        url: String,
        name: String,
        image: String,
        genre: [String],
        director: {
            '@type': String,
            url: String,
            name: String,
        },
        aggregateRating: {
            '@type': String,
            ratingCount: Number,
            bestRating: String,
            worstRating: String,
            ratingValue: String,
        },
        duration: String,  // Stocké au format ISO 8601 (ex: 'PT1H53M')
        datePublished: String, // Date de publication
    });

    const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema, 'trailerz');

    // Fonction pour convertir la durée ISO 8601 en minutes
    function durationToMinutes(duration) {
        const regex = /^PT(\d+H)?(\d+M)?$/;
        const match = duration.match(regex);

        let hours = 0;
        let minutes = 0;

        if (match) {
            if (match[1]) {
                hours = parseInt(match[1].replace('H', ''), 10);
            }
            if (match[2]) {
                minutes = parseInt(match[2].replace('M', ''), 10);
            }
        }

        return (hours * 60) + minutes;
    }

    // Route de recherche de film
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
            query.name = { $regex: name, $options: 'i' };  // Recherche insensible à la casse
        }

        // Recherche par date (si une seule valeur est présente)
        if (startDate && !endDate) {
            query.datePublished = { $gte: startDate };  // Rechercher à partir de la date minimale
        }

        if (endDate && !startDate) {
            query.datePublished = { $lte: endDate };  // Rechercher jusqu'à la date maximale
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            query.datePublished = { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] };
        }

        // Recherche par genre
        if (genres) {
            query.genre = { $in: genres.split(',') };  // Recherche par genre
        }

        // Recherche par acteur
        if (actors) {
            query['actor.name'] = { $regex: actors, $options: 'i' }; // Recherche insensible à la casse
        }

        // Recherche par réalisateur
        if (directors) {
            query['director.name'] = { $regex: directors, $options: 'i' }; // Recherche insensible à la casse
        }

        // Recherche par durée (si une seule valeur est présente)
        if (minDuration || maxDuration) {
            let minMinutes = minDuration ? durationToMinutes(minDuration) : 0;
            let maxMinutes = maxDuration ? durationToMinutes(maxDuration) : 10000;

            if (minDuration && !maxDuration) {
                // Si seule une durée minimale est définie
                query.duration = { $gte: `PT${minMinutes / 60}H${minMinutes % 60}M` }; // Minimum durée
            } else if (!minDuration && maxDuration) {
                // Si seule une durée maximale est définie
                query.duration = { $lte: `PT${maxMinutes / 60}H${maxMinutes % 60}M` }; // Maximum durée
            } else {
                // Si les deux durées (min et max) sont définies
                query.duration = { 
                    $gte: `PT${minMinutes / 60}H${minMinutes % 60}M`, 
                    $lte: `PT${maxMinutes / 60}H${maxMinutes % 60}M` 
                }; // Durée comprise entre min et max
            }
        }

        try {
            const movies = await Movie.find(query);
            if (movies.length > 0) {
                res.json(movies);
            } else {
                res.status(404).send({ message: 'Aucun film trouvé avec ces critères.' });
            }
        } catch (err) {
            console.error('Erreur lors de la recherche des films:', err);
            res.status(500).send({ message: 'Erreur serveur !' });
        }
    });
};
