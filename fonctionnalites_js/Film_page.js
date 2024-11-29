module.exports = (app, mongoose, Movie) => {
    // Route pour afficher un film par son ID
    app.get('/film/:id', async (req, res) => {
        const movieId = req.params.id;  // Récupère l'ID du film depuis l'URL

        try {
            // Chercher le film par son ObjectId
            const movie = await Movie.findById(movieId);
            if (!movie) {
                return res.status(404).send('Film non trouvé');
            }

            // Rendre une page HTML avec les informations du film
            res.send(`
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${movie.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        img { width: 300px; }
                        h1 { color: #333; }
                        p { font-size: 18px; }
                        a { text-decoration: none; color: #007bff; }
                    </style>
                </head>
                <body>
                    <h1>${movie.name}</h1>
                    <img src="${movie.image}" alt="${movie.name}">
                    <p><strong>Genre:</strong> ${movie.genre.join(', ')}</p>
                    <p><strong>Réalisateur:</strong> ${movie.director.name}</p>
                    <p><strong>Note:</strong> ${movie.aggregateRating.ratingValue}/10 (${movie.aggregateRating.ratingCount} votes)</p>
                    <p><strong>Résumé:</strong> ${movie.reviewBody || 'Aucun résumé disponible'}</p>
                    <p><strong>Date de création:</strong> ${movie.dateCreated}</p>
                    <p><strong>Durée:</strong> ${movie.duration}</p>
                    <a href="/">Retour à l'accueil</a>
                </body>
                </html>
            `);

        } catch (err) {
            console.error('Erreur lors de la récupération du film:', err);
            res.status(500).send('Erreur serveur');
        }
    });

    console.log('Route /film/:id ajoutée pour afficher les informations du film.');
};
