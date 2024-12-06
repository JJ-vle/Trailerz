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
    '@context': {
        type: String,
        default: 'http://schema.org'
    },
    '@type': {
        type: String,
        default: 'Movie'
    },
    url: String,
    name: String,
    image: String,
    genre: [String],
    contentRating: String,
    actor: [{
        '@type': {
            type: String,
            default: 'Person'
        },
        url: String,
        name: String,
    }],
    director: {
        '@type': {
            type: String,
            default: 'Person'
        },
        url: String,
        name: String,
    },
    creator: [{
        '@type': String,
        url: String,
        name: String,
        description: String
    }],
    keywords: [String],
    description: String,
    datePublished: String,
    aggregateRating: {
        '@type': {
            type: String,
            default: 'AggregateRating'
        },
        ratingCount: Number,
        bestRating: String,
        worstRating: String,
        ratingValue: String,
    },
    review: [{
        '@type': {
            type: String,
            default: 'Review'
        },
        itemReviewed: {
            '@type': {
                type: String,
                default: 'CreativeWork'
            },
            url: String,
        },
        author: {
            '@type': {
                type: String,
                default: 'Person'
            },
            name: String,
        },
        dateCreated: String,
        inLanguage: String,
        name: String,
        reviewBody: String,
        reviewRating: {
            '@type': String,
            worstRating: String,
            bestRating: String,
            ratingValue: String,
        }
    }],
    dateCreated: String,
    duration: String,
    mainEntityOfPage: String,
    musicBy: {
        '@type': String,
        name: String,
        url: String
    },
    productionCompany: {
        '@type': String,
        name: String,
        url: String,
    },
    distributor: {
        '@type': String,
        name: String,
        url: String,
    },
    countryOfOrigin: String,
    language: String,
    releaseDate: String,
    dateModified: String,
    trailer: {
        '@type': String,
        name: String,
        embedUrl: String,
        thumbnailUrl: String,
        description: String,
        uploadDate: String
    },
    budget: String,
    boxOffice: String,
    hasPart: [{
        '@type': String,
        name: String,
        url: String,
    }],
    offers: {
        '@type': String,
        url: String,
        priceCurrency: String,
        price: String,
        validFrom: String,
        validThrough: String,
    },
    video: {
        '@type': String,
        name: String,
        url: String,
    }
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
        require(routePath)(app, mongoose, Movie); // Passer le modèle Movie ici
    }
});

// Middleware pour servir les fichiers HTML
app.use(express.static(path.join(__dirname, 'html')));

// Route pour la page de test
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/test.html'));
});

// Page de test de recherche
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/search_movie.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});