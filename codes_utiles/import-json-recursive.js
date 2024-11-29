const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Configuration
const folderPath = 'C:/Users/valen/Downloads/archive/Data'; // Remplace par le chemin de ton dossier principal
const mongoUri = 'mongodb://localhost:27017'; // URI MongoDB
const dbName = 'trailerz'; // Nom de ta base
const collectionName = 'trailerz'; // Nom de ta collection

// Fonction pour parcourir récursivement les répertoires
const getAllJsonFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      // Si c'est un dossier, on le parcourt récursivement
      getAllJsonFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.json')) {
      // Si c'est un fichier JSON, on l'ajoute à la liste
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

(async () => {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connexion réussie à MongoDB.');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Obtenir tous les fichiers JSON du répertoire principal et ses sous-répertoires
    const jsonFiles = getAllJsonFiles(folderPath);
    console.log(`Trouvé ${jsonFiles.length} fichiers JSON.`);

    for (const filePath of jsonFiles) {
      console.log(`Importing: ${filePath}`);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (Array.isArray(data)) {
        // Insérer un tableau de documents
        await collection.insertMany(data);
      } else {
        // Insérer un seul document
        await collection.insertOne(data);
      }
    }

    console.log('Tous les fichiers JSON ont été importés avec succès !');
    await client.close();
  } catch (error) {
    console.error('Erreur :', error);
  }
})();
