// Fonction pour convertir la durée entrée par l'utilisateur en format ISO 8601
function convertDurationToISO(duration) {
    // Exemple d'entrée : "1h30" ou "2h45"
    const regex = /^(\d+)(h|H)?(\d+)?(m|M)?$/;
    const match = duration.match(regex);

    if (match) {
        const hours = match[1] ? parseInt(match[1], 10) : 0;
        const minutes = match[3] ? parseInt(match[3], 10) : 0;
        return `PT${hours}H${minutes}M`;  // Retourne une durée ISO 8601, ex : PT1H30M
    }
    return '';  // Retourne une chaîne vide si le format n'est pas valide
}

// Fonction pour effectuer la recherche de films
async function searchMovie() {
    const movieName = document.getElementById('movie-name').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const actors = document.getElementById('actors').value;
    const directors = document.getElementById('directors').value;

    const minDuration = document.getElementById('min-duration').value;
    const maxDuration = document.getElementById('max-duration').value;
    
    // Conversion des durées en format ISO
    const minDurationISO = minDuration ? convertDurationToISO(minDuration) : '';
    const maxDurationISO = maxDuration ? convertDurationToISO(maxDuration) : '';

    const genres = Array.from(document.querySelectorAll('input[name="genre"]:checked')).map(checkbox => checkbox.value);

    const queryParams = new URLSearchParams();

    if (movieName) queryParams.append('name', movieName);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (actors) queryParams.append('actors', actors);
    if (directors) queryParams.append('directors', directors);
    if (genres.length > 0) queryParams.append('genres', genres.join(','));
    if (minDurationISO) queryParams.append('minDuration', minDurationISO);
    if (maxDurationISO) queryParams.append('maxDuration', maxDurationISO);

    try {
        const response = await fetch(`/api/search-movie?${queryParams.toString()}`);
        const data = await response.json();
        
        const movieDetailsDiv = document.getElementById('movie-details');

        // Si des films sont trouvés, on les affiche
        if (data.length > 0) {
            movieDetailsDiv.innerHTML = data.map(movie => {
                return `
                    <div>
                        <h3>${movie.name}</h3>
                        <img src="${movie.image}" alt="${movie.name}" />
                        <p>${movie.genre.join(', ')}</p>
                        <p>Réalisateur: ${movie.director.name}</p>
                        <p>Durée: ${movie.duration}</p>
                        <p><a href="${movie.url}">Voir plus</a></p>
                    </div>
                `;
            }).join('');
        } else {
            // Si aucun film n'est trouvé, on efface le contenu précédent
            movieDetailsDiv.innerHTML = `<p>Aucun film trouvé avec ces critères.</p>`;
        }
    } catch (error) {
        console.error('Erreur lors de la recherche de films:', error);
    }
}
