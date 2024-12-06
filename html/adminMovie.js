// Fonction pour ajouter un film
async function addMovie(event) {
    event.preventDefault(); // Empêche l'envoi du formulaire classique

    // Récupération des valeurs des champs du formulaire
    const movieName = document.getElementById('add-name').value;
    const releaseDate = document.getElementById('add-date').value;
    const actors = document.getElementById('add-actors').value.split(',').map(actor => actor.trim());
    const director = document.getElementById('add-director').value;
    const genres = Array.from(document.querySelectorAll('#add-genres input:checked')).map(checkbox => checkbox.value);
    const duration = document.getElementById('add-duration').value;
    const url = document.getElementById('add-url').value;
    const description = document.getElementById('add-description').value;

    console.log({
        name: movieName,
        datePublished: releaseDate,
        actor: actors.map(name => ({ name })),
        //director: director,
        director: director.map(name => ({ name })),
        genre: genres,
        duration: `PT${Math.floor(duration / 60)}H${duration % 60}M`, // Conversion en format ISO
        url: url,
        description: description 
    });

    const response = await fetch('/api/add-movie', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: movieName,
            datePublished: releaseDate,
            actor: actors.map(name => ({ name })),
            //director: director, 
            director: director.map(name => ({ name })),
            genre: genres,
            duration: `PT${Math.floor(duration / 60)}H${duration % 60}M`,
            url: url,
            description: description
        })
    });

    const result = await response.json();
    if (response.ok) {
        alert('Film ajouté avec succès !');
    } else {
        alert(`Erreur lors de l'ajout du film : ${result.message}`);
    }
}



// Fonction pour modifier un film
async function updateMovie(event) {
    event.preventDefault();

    const movieId = document.getElementById('update-id').value;
    const movieName = document.getElementById('update-name').value;
    const releaseDate = document.getElementById('update-date').value;
    const actors = document.getElementById('update-actors').value.split(',').map(actor => actor.trim());
    const director = document.getElementById('update-director').value;
    const genres = Array.from(document.querySelectorAll('#update-genres input:checked')).map(checkbox => checkbox.value);
    const duration = document.getElementById('update-duration').value;
    const url = document.getElementById('update-url').value;

    const response = await fetch('/api/update-movie', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: movieId,
            name: movieName,
            datePublished: releaseDate,
            actor: actors.map(name => ({ name })),
            director: { name: director },
            genre: genres,
            duration: `PT${Math.floor(duration / 60)}H${duration % 60}M`, 
            url: url
        })
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

// Ajout des écouteurs d'événements
document.getElementById('add-movie-form').addEventListener('submit', addMovie);
document.getElementById('update-movie-form').addEventListener('submit', updateMovie);
document.getElementById('delete-movie-form').addEventListener('submit', deleteMovie);
