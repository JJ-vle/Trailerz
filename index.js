const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Création de l'application avec express
const app = express();
const PORT = 2030;

app.use(express.static('public'));
app.use(express.json()); 


const adminMovie = require('./fonctionnalites_js/admin_movie'); 
adminMovie(app);
const devinelefilm = require('./fonctionnalites_js/devine_api'); 
devinelefilm(app);

// Connexion à MongoDB
//mongoose.connect('mongodb://localhost:27017/trailerz', {
mongoose.connect('mongodb://127.0.0.1:27017/trailerz', {
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

const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema, 'trailerz');

// Charger les fonctionnalités (évite de surcharger l'index)
const fonctionnalitesDir = path.join(__dirname, 'liaisonBackFront');

// Vérification existence du dossier des routes
if (!fs.existsSync(fonctionnalitesDir)) {
    console.error(`Le dossier "${fonctionnalitesDir}" est introuvable.`);
    process.exit(1);
}

fs.readdirSync(fonctionnalitesDir).forEach((file) => {
    if (file.endsWith('.js')) {
        const routePath = path.join(fonctionnalitesDir, file);
        console.log(`Chargement de la fonctionnalité : ${file}`);
        require(routePath)(app, mongoose, Movie);
    }
});


// Middleware pour servir les fichiers HTML
app.use(express.static(path.join(__dirname, './')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/template_page_accueil.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/recherche_page.html'));
});

app.get('/random', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/random_by_category_page.html'));
});

app.get('/derniers-films', (req, res) =>{
    res.sendFile(path.join(__dirname, 'template_api_front/template_films_recents.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/admin.html'));
});

app.get('/devine', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/devinelefilm.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});