// fonction de recherche d'un film
async function searchMovies() {
    const name = document.getElementById('name').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const genres = Array.from(document.querySelectorAll('input[name="genre"]:checked'))
        .map((checkbox) => checkbox.value)
        .join(',');

    const minDuration = document.getElementById('minDuration').value;
    const maxDuration = document.getElementById('maxDuration').value;

    let query = `?name=${name}&startDate=${startDate}&endDate=${endDate}&genres=${genres}&minDuration=${minDuration}&maxDuration=${maxDuration}`;

    try {
        const response = await fetch(`/api/search-movie${query}`);
        if (!response.ok) throw new Error('Erreur lors de la recherche');
        const movies = await response.json();

        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
        // injection du film dans la page
        movies.forEach(movie => {
            resultsDiv.innerHTML += `
                <a href="./film/${movie.id}">
                    <div class="movie">
                        <img src="${movie.image || '../resources/trailerz_pochette_basique.png'}" 
                            alt="${movie.name}" 
                            onerror="this.onerror=null;this.src='../resources/trailerz_pochette_basique.png';">
                    
                    <div class="movie-content">
                        <h2>${movie.name}</h2>
                </a>
                        <p><strong>Genres:</strong> ${movie.genre.join(', ')}</p>
                        <p><strong>Réalisateur:</strong> <a href="${movie.director.url}">${movie.director.name}</a></p>
                        <p><strong>Durée:</strong> ${movie.duration}</p>
                        <p><strong>Note:</strong> ${movie.aggregateRating.ratingValue}/10 (${movie.aggregateRating.ratingCount} votes)</p>
                        <p><strong>Date de publication:</strong> ${movie.datePublished}</p>
                    </div>
                    </div>
            `;
        });
    } catch (err) {
        console.error(err);
        document.getElementById('results').innerHTML = '<p>Erreur lors du chargement des films.</p>';
    }
}