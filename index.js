const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// creation appli avec express
const app = express();
const PORT = 2030;

// connexion MongoDB
mongoose.connect('mongodb://localhost:27017/trailerz', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connexion à Mongo OK');
}).catch((err) => {
    console.error('Erreur de connexion mongo :', err);
});

// surveillance de la connexion a la BD si ok ou non
mongoose.connection.on('connecte', () => {
    console.log('MongoDB connecté sur mongodb://localhost:27017/trailerz');
});

mongoose.connection.on('error', (err) => {
    console.error('Erreur de connexion à MongoDB:', err);
});

///////////// ROUTES /////////////
// charger les fonctionnalites (evite de surcharger l'index)
const fonctionnalitesDir = path.join(__dirname, 'fonctionnalites_js');

// verification existance du dossier des routes
if (!fs.existsSync(fonctionnalitesDir)) {
    console.error(`Le dossier "${fonctionnalitesDir}" est introuvable.`);
    process.exit(1);
}

fs.readdirSync(fonctionnalitesDir).forEach((file) => {
    if (file.endsWith('.js')) {
        const routePath = path.join(fonctionnalitesDir, file);
        console.log(`Chargement de la fonctionnalité : ${file}`);
        require(routePath)(app, mongoose);
    }
});

//middleware pour servir les fichiers html
app.use(express.static(path.join(__dirname, 'html')));

// on envoie dans la page de test
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/test.html'));
});



///// DEMARRAGE SERVEUR /////
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});