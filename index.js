const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Création de l'application avec express
const app = express();
const PORT = 2030;

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/trailerz', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connexion à Mongo OK');
}).catch((err) => {
    console.error('Erreur de connexion mongo :', err);
});

// Surveillance de la connexion à la BD si OK ou non
mongoose.connection.on('connected', () => {
    console.log('MongoDB connecté sur mongodb://localhost:27017/trailerz');
});

mongoose.connection.on('error', (err) => {
    console.error('Erreur de connexion à MongoDB:', err);
});

// Définition du modèle Movie
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
    reviewBody: String,
    dateCreated: String,
    duration: String,
});

const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema, 'trailerz');

// Charger les fonctionnalités (évite de surcharger l'index)
const fonctionnalitesDir = path.join(__dirname, 'fonctionnalites_js');

// Vérification existence du dossier des routes
if (!fs.existsSync(fonctionnalitesDir)) {
    console.error(`Le dossier "${fonctionnalitesDir}" est introuvable.`);
    process.exit(1);
}

fs.readdirSync(fonctionnalitesDir).forEach((file) => {
    if (file.endsWith('.js')) {
        const routePath = path.join(fonctionnalitesDir, file);
        console.log(`Chargement de la fonctionnalité : ${file}`);
        require(routePath)(app, mongoose, Movie); //recuperation modele Movie pour les autres instances
    }
});

//directory de tous les html
app.use(express.static(path.join(__dirname, 'html')));

// Route pour la page de test
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/test.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
