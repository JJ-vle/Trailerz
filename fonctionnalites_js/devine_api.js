const Movie = require('../models/movie');

module.exports = (app) => {
    let currentMovie = null;

    // obtenir un film aléatoire avec un thumbnailUrl
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
                    // si pas de thumnnail valide
                    res.status(500).json({ message: "Film sans thumbnail valide" });
                }
            } else {
                res.status(404).json({ message: "Aucun film avec un thumbnail valide trouvé" });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du film:', error);
            res.status(500).json({ message: "Erreur serveur", error: error.message });
        }
    });
    

    // rechercher des films par nom
    app.get('/api/search-movies', async (req, res) => {
        const { query } = req.query;
        try {
            const movies = await Movie.find({
                name: { $regex: query, $options: 'i' },  //insensible à la casse
                'trailer.thumbnailUrl': { $ne: null, $ne: '' }
            })
            .limit(5)  //max 5 affichés
            .select('name trailer.thumbnailUrl');

            res.json({ movies });
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur", error: error.message });
        }
    });
};
