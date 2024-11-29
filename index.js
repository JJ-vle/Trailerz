const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

//creation avec express
const app = express();

const PORT = 2030;

// connexion mongo
mongoose.connect('mongodb://localhost:27017/trailerz', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connexion à MongoDB réussie');
}).catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
});

//logs au cas ou
mongoose.connection.on('connected', () => {
    console.log('MongoDB connecté sur mongodb://localhost:27017/trailerz');
});

mongoose.connection.on('error', (err) => {
    console.error('Erreur de connexion à MongoDB:', err);
});

//schema pour Trailerz via la BD
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
    creator: {
        '@type': String,
        url: String,
    },
    keywords: String,
    aggregateRating: {
        '@type': String,
        ratingCount: Number,
        bestRating: String,
        worstRating: String,
        ratingValue: String,
    },
    review: {
        '@type': String,
    },
    itemReviewed: {
        '@type': String,
        url: String,
    },
    author: {
        '@type': String,
        name: String,
    },
    dateCreated: String,
    inLanguage: String,
    reviewBody: String,
    duration: String,
});

//modèle pour Trailerz
const Movie = mongoose.model('Movie', movieSchema, 'trailerz');
app.use(express.static(path.join(__dirname, 'html')));

// Route du html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/test.html'));
});


// api pour faire appel aux films de la BD
app.get('/api/movie', async (req, res) => {
    try {
        // recuperation d'un film aleatoire juste pour tester
        const movie = await Movie.findOne();
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).send('Aucun film trouvé');
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du film :', err);
        res.status(500).send('Erreur serveur');
    }
});

//LANCEMENT SERVEUR JS
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});