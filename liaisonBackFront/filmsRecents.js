let currentPage = 1;
const moviesPerPage = 15;

// afficher les derniers films ajoutés
async function fetchMovies(page) {
    try {
        const response = await fetch(`/api/derniers-films?page=${page}`);
        if (!response.ok) throw new Error('Erreur lors du chargement des films.');

        const data = await response.json();
        displayMovies(data.movies);
        updatePagination(data.currentPage, data.totalPages);
    } catch (err) {
        console.error(err);
        document.getElementById('movie-list').innerHTML = '<p>Erreur lors du chargement des données.</p>';
    }
}

//injection de l'affichage
function displayMovies(movies) {
const movieList = document.getElementById('movie-list');
movieList.innerHTML = movies.map(movie => {
    const releaseYear = movie.datePublished ? new Date(movie.datePublished).getFullYear() : 'Inconnue';
    return `
        <div class="movie">
            <img src="${movie.image || '../resources/trailerz_pochette_basique.png'}" 
                alt="${movie.name}" 
                onerror="this.onerror=null;this.src='../resources/trailerz_pochette_basique.png';">

            <div class="movie-details">
                <h2><a href="/film/${movie._id}" style="color: white;">${movie.name}</a></h2>
                <p><strong>Année de sortie :</strong> ${releaseYear}</p>
                <p><strong>Genre :</strong> ${movie.genre.join(', ') || 'Non spécifié'}</p>
            </div>
        </div>
    `;
}).join('');
}


function updatePagination(current, total) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    prevButton.disabled = current === 1;
    nextButton.disabled = current === total;
    pageInfo.textContent = `Page ${current} sur ${total}`;
}

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchMovies(currentPage);
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    currentPage++;
    fetchMovies(currentPage);
});


fetchMovies(currentPage);