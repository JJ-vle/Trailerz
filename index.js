const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 2030; //port

app.use(express.static('public'));
app.use(express.json());

//connexion a la BD
mongoose.connect('mongodb://127.0.0.1:27017/trailerz', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('>>> Connexion à Mongo OK');
    console.log('*'.repeat(process.stdout.columns || 80));
}).catch((err) => {
    console.error('XXX Erreur de connexion mongo :', err);
});

//Si ok connecté
mongoose.connection.on('connected', () => {
    console.log('>>> MongoDB connecté sur mongodb://localhost:27017/trailerz');
});
//sinon
mongoose.connection.on('error', (err) => {
    console.error('Erreur de connexion à MongoDB:', err);
});

const Movie = require('./models/movie'); //recuperation du model movie

const fonctionnalitesDir = path.join(__dirname, 'fonctionnalites_js'); //recuperation des api

if (!fs.existsSync(fonctionnalitesDir)) {
    console.error(`Le dossier "${fonctionnalitesDir}" est introuvable.`);
    process.exit(1);
}

fs.readdirSync(fonctionnalitesDir).forEach((file) => {
    if (file.endsWith('.js')) {
        const routePath = path.join(fonctionnalitesDir, file);
        console.log(`--- Chargement de la fonctionnalité : ${file}`);
        require(routePath)(app, mongoose, Movie);
    }
}
);
console.log('>>> Chargement des routes OK\n');

// Ajout du path princpal
app.use(express.static(path.join(__dirname, './')));


// Ajout des paths pour les pages templates
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/template_page_accueil.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/recherche_page.html'));
});

app.get('/random', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/random_by_category_page.html'));
});

app.get('/derniers-films', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/template_films_recents.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/admin.html'));
});

app.get('/devine', (req, res) => {
    res.sendFile(path.join(__dirname, 'template_api_front/devinelefilm.html'));
});


//log exécution si tout est OK
app.listen(PORT, () => {
    console.log(`\n>>> Serveur en cours d'exécution sur http://localhost:${PORT}`);
});