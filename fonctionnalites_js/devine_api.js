const Movie = require('../models/movie');  // Le modèle Movie

module.exports = (app) => {
    let currentMovie = null; // Variable pour garder en mémoire le film actuel

    // Route pour obtenir un film aléatoire avec un thumbnailUrl valide
    app.get('/api/random-movie', async (req, res) => {
        try {
            const randomMovie = await Movie.aggregate([
                { $match: { 'trailer.thumbnailUrl': { $ne: null, $ne: "", $exists: true } } },
                { $sample: { size: 1 } }
            ]);
    
            console.log('Film récupéré:', randomMovie[0].name);
    
            if (randomMovie.length > 0) {
                const movie = randomMovie[0];
                if (movie.trailer && movie.trailer.thumbnailUrl) {
                    res.json({
                        id: movie._id,
                        name: movie.name,
                        thumbnailUrl: movie.trailer.thumbnailUrl,
                        message: "Nouveau film, à vous de jouer !"
                    });
                } else {
                    // Si le film n'a pas de thumbnailUrl valide
                    res.status(500).json({ message: "Film sans thumbnail valide" });
                }
            } else {
                res.status(404).json({ message: "Aucun film avec un thumbnail valide trouvé" });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du film:', error); // Ajoute ceci pour plus de détails dans les logs
            res.status(500).json({ message: "Erreur serveur", error: error.message });
        }
    });
    
    
/*
    // Route pour vérifier la réponse de l'utilisateur
    app.post('/api/verify-answer', async (req, res) => {
        const { answer } = req.body; // La réponse de l'utilisateur (nom du film)
        
        if (!currentMovie) {
            return res.status(400).json({ message: "Aucun film en cours. Veuillez commencer un nouveau jeu." });
        }

        if (answer.trim().toLowerCase() === currentMovie.name.toLowerCase()) {
            // Si la réponse est correcte, afficher "Bien joué" et donner un nouveau film
            console.log(`Bonne réponse ! C'était : ${currentMovie.name}`);
            currentMovie = null; // Réinitialiser le film en cours
            res.json({
                message: `Bien joué ! C'était "${currentMovie.name}"`,
                success: true
            });
        } else {
            // Si la réponse est incorrecte, afficher "Mauvaise réponse"
            res.json({
                message: "Mauvaise réponse. Continuez d'essayer !",
                success: false
            });
        }
    });*/

    // Route pour rechercher des films par nom, avec un thumbnailUrl valide
    app.get('/api/search-movies', async (req, res) => {
        const { query } = req.query;
        try {
            const movies = await Movie.find({
                name: { $regex: query, $options: 'i' },  // Recherche insensible à la casse
                'trailer.thumbnailUrl': { $ne: null, $ne: '' }  // Vérifie que thumbnailUrl existe et n'est pas vide
            })
            .limit(5)  // Limiter à 5 résultats
            .select('name trailer.thumbnailUrl');  // Se concentrer sur le nom et l'URL de l'image

            res.json({ movies });
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur", error: error.message });
        }
    });
};
