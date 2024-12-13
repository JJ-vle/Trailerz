// Récupération des éléments du DOM
const modifyJsonForm = document.getElementById('modify-json-form');
const movieNameInput = document.getElementById('movie-name');
const posterUrlInput = document.getElementById('poster-url');
const logoUrlInput = document.getElementById('logo-url');
const updateJsonButton = document.getElementById('update-json-btn');

// Fonction pour envoyer les données au serveur (via l'API)
async function updateJsonFile(newData) {
    try {
        // Envoyer la requête POST à l'API
        const response = await fetch('/api/update-json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData) // Envoyer les données au format JSON
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result.message);
            alert('Le fichier JSON a été mis à jour avec succès.');
        } else {
            const result = await response.json();
            alert(`Erreur lors de la mise à jour : ${result.message}`);
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour du fichier JSON:', err);
        alert('Une erreur s\'est produite lors de la mise à jour du fichier JSON.');
    }
}

// Fonction pour gérer le clic sur le bouton "Modifier le JSON"
function handleUpdateJsonButtonClick(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Récupérer les valeurs des champs de formulaire
    const movieName = movieNameInput.value.trim();
    const posterUrl = posterUrlInput.value.trim();
    const logoUrl = logoUrlInput.value.trim();

    // Vérifier que tous les champs sont remplis
    if (!movieName || !posterUrl || !logoUrl) {
        alert('Tous les champs doivent être remplis.');
        return;
    }

    const newData = {
        NomFilm: movieName,
        UrlImage: posterUrl,
        UrlLogoFilm: logoUrl
    };

    // Mettre à jour le fichier JSON avec les nouvelles données via l'API
    updateJsonFile(newData);
}

// Ajouter un gestionnaire d'événements pour le bouton de mise à jour JSON
updateJsonButton.addEventListener('click', handleUpdateJsonButtonClick);
