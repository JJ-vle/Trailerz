module.exports = (app, mongoose, Movie) => {
    // Route pour récupérer un film aléatoire
    app.get('/api/random-movie', async (req, res) => {
        try {
            const count = await Movie.countDocuments();
            const randomIndex = Math.floor(Math.random() * count);
            const movie = await Movie.findOne().skip(randomIndex); // Récupérer un film aléatoire

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
