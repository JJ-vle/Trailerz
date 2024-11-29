module.exports = (app, mongoose) => {
    //schema du modele
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
    });

    const Movie = mongoose.model('Movie', movieSchema, 'trailerz');

    //////// ROUTE ////////
    app.get('/api/random-movie', async (req, res) => {
        try {
            const count = await Movie.countDocuments();
            const randomIndex = Math.floor(Math.random() * count);
            const movie = await Movie.findOne().skip(randomIndex); //recup film aleatoire
            if (movie) {
                res.json(movie);
            } else {
                res.status(404).send({ message: 'Aucun film trouvé !' });
            }
        } catch (err) {
            console.error('Erreur :', err);
            res.status(500).send({ message: 'Erreur serveur !' });
        }
    });

    console.log('Route /api/random-movie ajoutée.');
};
