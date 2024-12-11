// Fonction pour extraire les données des champs multiples
function extractData(containerId, inputClass) {
    const elements = document.querySelectorAll(`#${containerId} .${inputClass}`);
    return Array.from(elements).map(el => ({
        name: el.querySelector('.actor-name')?.value || 
              el.querySelector('.director-name')?.value || 
              el.querySelector('.creator-name')?.value,
        url: el.querySelector('.actor-url')?.value || 
             el.querySelector('.director-url')?.value || 
             el.querySelector('.creator-url')?.value,
    })).filter(item => item.name && item.url);
}

// Ajout de film
async function addMovie(event) {
    event.preventDefault();

    const movieName = document.getElementById('add-name').value;
    const datePublished = document.getElementById('add-date').value;
    const genres = Array.from(document.querySelectorAll('#add-genres input:checked')).map(cb => cb.value);
    const duration = document.getElementById('add-duration').value;
    const movieUrl = document.getElementById('add-url').value;
    const posterUrl = document.getElementById('add-url-img').value;
    const keywords = document.getElementById('add-keywords').value.split(',').map(k => k.trim());
    const description = document.getElementById('add-description').value;
    const actors = extractData('add-actors', 'actor-input');
    const directors = extractData('add-directors', 'director-input');
    const creators = extractData('add-creators', 'creator-input');

    const movieData = {
        name: movieName,
        datePublished, // Date de sortie
        genres, // Genres sélectionnés
        duration, // Durée en minutes
        url: movieUrl, // Lien vers le film
        image: posterUrl, // Lien vers l'affiche
        keywords, // Mots-clés
        description, // Description
        actor: actors, // Acteurs
        director: directors, // Réalisateurs
        creator: creators, // Créateurs
    };

    try {
        const response = await fetch('/api/add-movie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movieData),
        });

        if (response.ok) {
            alert('Film ajouté avec succès!');
            document.getElementById('add-movie-form').reset();
        } else {
            const errorData = await response.json();
            alert(`Erreur lors de l'ajout du film : ${errorData.message}`);
        }
    } catch (error) {
        console.error('Erreur réseau:', error);
        alert('Erreur réseau.');
    }
}

// Fonction pour modifier un film
async function updateMovie(event) {
    event.preventDefault();

    const movieId = document.getElementById('update-id').value;
    const movieName = document.getElementById('update-name').value;
    const releaseDate = document.getElementById('update-date').value;
    const actors = extractData('update-actors', 'actor-input');
    const directors = extractData('update-directors', 'director-input');
    const creators = extractData('update-creators', 'creator-input');
    const genres = Array.from(document.querySelectorAll('#update-genres input:checked')).map(checkbox => checkbox.value);
    const duration = document.getElementById('update-duration').value;
    const url = document.getElementById('update-url').value;
    const imageUrl = document.getElementById('update-url-img').value;
    const keywords = document.getElementById('update-keywords')?.value.split(',').map(keyword => keyword.trim());

    // Préparer l'objet à envoyer
    const body = {
        id: movieId,
        ...(movieName && { name: movieName }),
        ...(releaseDate && { datePublished: releaseDate }),
        ...(actors.length > 0 && { actor: actors }),
        ...(directors.length > 0 && { director: directors }),
        ...(creators.length > 0 && { creator: creators }),
        ...(genres.length > 0 && { genre: genres }),
        ...(duration && { duration: `PT${Math.floor(duration / 60)}H${duration % 60}M` }),
        ...(url && { url }),
        ...(imageUrl && { image: imageUrl }),
        ...(keywords && { keywords })
    };

    // Envoyer la requête PUT
    const response = await fetch('/api/update-movie', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    const result = await response.json();
    if (response.ok) {
        alert('Film mis à jour avec succès !');
    } else {
        alert(`Erreur lors de la mise à jour du film : ${result.message}`);
    }
}



// Fonction pour supprimer un film
async function deleteMovie(event) {
    event.preventDefault();

    const movieId = document.getElementById('delete-id').value;

    const response = await fetch('/api/delete-movie', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: movieId })
    });

    const result = await response.json();
    if (response.ok) {
        alert('Film supprimé avec succès !');
    } else {
        alert(`Erreur lors de la suppression du film : ${result.message}`);
    }
}

//
document.getElementById('add-actor-btn').addEventListener('click', () => {
    const container = document.getElementById('add-actors');
    const newField = document.createElement('div');
    newField.className = 'actor-input';
    newField.innerHTML = `
        <input type="text" placeholder="Nom de l'acteur" class="actor-name">
        <input type="text" placeholder="URL de l'acteur" class="actor-url">
        <button type="button" class="remove-actor">Supprimer</button>
    `;
    newField.querySelector('.remove-actor').addEventListener('click', () => {
        container.removeChild(newField);
    });
    container.appendChild(newField);
});
document.getElementById('add-director-btn').addEventListener('click', () => {
    const container = document.getElementById('add-directors');
    const newField = document.createElement('div');
    newField.className = 'director-input';
    newField.innerHTML = `
        <input type="text" placeholder="Nom du directeur" class="director-name">
        <input type="text" placeholder="URL du directeur" class="director-url">
        <button type="button" class="remove-director">Supprimer</button>
    `;
    newField.querySelector('.remove-director').addEventListener('click', () => {
        container.removeChild(newField);
    });
    container.appendChild(newField);
});
document.getElementById('add-creator-btn').addEventListener('click', () => {
    const container = document.getElementById('add-creators');
    const newField = document.createElement('div');
    newField.className = 'creator-input';
    newField.innerHTML = `
        <input type="text" placeholder="Nom du directeur" class="creator-name">
        <input type="text" placeholder="URL du directeur" class="creator-url">
        <button type="button" class="remove-creator">Supprimer</button>
    `;
    newField.querySelector('.remove-creator').addEventListener('click', () => {
        container.removeChild(newField);
    });
    container.appendChild(newField);
});
document.getElementById('update-actor-btn').addEventListener('click', () => {
    const container = document.getElementById('update-actors');
    const newField = document.createElement('div');
    newField.className = 'actor-input';
    newField.innerHTML = `
        <input type="text" placeholder="Nom de l'acteur" class="actor-name">
        <input type="text" placeholder="URL de l'acteur" class="actor-url">
        <button type="button" class="remove-actor">Supprimer</button>
    `;
    newField.querySelector('.remove-actor').addEventListener('click', () => {
        container.removeChild(newField);
    });
    container.appendChild(newField);
});
document.getElementById('update-director-btn').addEventListener('click', () => {
    const container = document.getElementById('update-directors');
    const newField = document.createElement('div');
    newField.className = 'director-input';
    newField.innerHTML = `
        <input type="text" placeholder="Nom du directeur" class="director-name">
        <input type="text" placeholder="URL du directeur" class="director-url">
        <button type="button" class="remove-director">Supprimer</button>
    `;
    newField.querySelector('.remove-director').addEventListener('click', () => {
        container.removeChild(newField);
    });
    container.appendChild(newField);
});
document.getElementById('update-creator-btn').addEventListener('click', () => {
    const container = document.getElementById('update-creators');
    const newField = document.createElement('div');
    newField.className = 'creator-input';
    newField.innerHTML = `
        <input type="text" placeholder="Nom du créateur" class="creator-name">
        <input type="text" placeholder="URL du créateur" class="creator-url">
        <button type="button" class="remove-creator">Supprimer</button>
    `;
    newField.querySelector('.remove-creator').addEventListener('click', () => {
        container.removeChild(newField);
    });
    container.appendChild(newField);
});



// Ajout des écouteurs d'événements
document.getElementById('add-movie-form').addEventListener('submit', addMovie);
document.getElementById('update-movie-form').addEventListener('submit', updateMovie);
document.getElementById('delete-movie-form').addEventListener('submit', deleteMovie);
