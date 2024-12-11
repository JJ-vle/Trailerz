// Liaison js du back au front pour le carrousel de sélection aléatoire
document.addEventListener('DOMContentLoaded', async () => {
    const randomCarousel = document.querySelector('#random-carousel-container .carousel');

    try {
        // appel API
        const response = await fetch('/api/carrousel-random');

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données de l’API');
        }

        const movies = await response.json();

        // vider contenu de base
        randomCarousel.innerHTML = '';

        // ajout des affiches dans le carrousel
        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie');

            // lien enveloppant l'image
            const linkElement = document.createElement('a');
            linkElement.href = `/film/${movie.id}`;
            linkElement.style.textDecoration = 'none';

            const imgElement = document.createElement('img');
            imgElement.src = movie.image;
            imgElement.alt = `Affiche du film ${movie.id}`;

            //ajout de l'image au lien , et du lien au conteneur
            linkElement.appendChild(imgElement);
            movieElement.appendChild(linkElement);
            randomCarousel.appendChild(movieElement);
        });

        // recalcule avec la fonction la largeur
        updateCarouselWidth(randomCarousel);
    } catch (error) {
        console.error('Erreur:', error);
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
// FONCTION COMMUNE - API du top meilleures notes par catégorie (mis sur tous les carrousels de tops)
async function fetchAndDisplayMovies(category, carouselId) {
    const carousel = document.querySelector(`#${carouselId} .carousel`);

    try {
        const response = await fetch(`/api/carrousel-bestrate-cat?category=${category}`);

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération des données de l’API pour la catégorie ${category}`);
        }

        const movies = await response.json();

        carousel.innerHTML = '';

        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie');

            const linkElement = document.createElement('a');
            linkElement.href = `/film/${movie.id}`;
            linkElement.style.textDecoration = 'none';

            const imgElement = document.createElement('img');
            imgElement.src = movie.image;
            imgElement.alt = `Affiche du film ${movie.id}`;

            linkElement.appendChild(imgElement);
            movieElement.appendChild(linkElement);
            carousel.appendChild(movieElement);
        });

        updateCarouselWidth(carousel);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// FONCTION de calcul de la largeur/hauteur des carrousels
function updateCarouselWidth(carousel) {
    const movieWidth = carousel.children[0]?.offsetWidth + 10 || 0;
    const visibleMovies = 6;
    const maxOffset = -(movieWidth * (carousel.children.length - visibleMovies));

    let offset = 0;
    const prevButton = carousel.closest('.carousel-container').querySelector('.prev');
    const nextButton = carousel.closest('.carousel-container').querySelector('.next');

    prevButton.addEventListener('click', () => {
        if (offset === 0) {
            offset = maxOffset;
        } else {
            offset = Math.min(offset + movieWidth, 0);
        }
        carousel.style.transform = `translateX(${offset}px)`;
    });

    nextButton.addEventListener('click', () => {
        if (offset <= maxOffset) {
            offset = 0;
        } else {
            offset = Math.max(offset - movieWidth, maxOffset);
        }
        carousel.style.transform = `translateX(${offset}px)`;
    });
}

//fetchs des catégories sur les bons carrrousels
document.addEventListener('DOMContentLoaded', async () => {
    fetchAndDisplayMovies('Horror', 'horror-carousel-container');
    fetchAndDisplayMovies('Action', 'action-carousel-container');
    fetchAndDisplayMovies('Comedy', 'comedy-carousel-container');
    fetchAndDisplayMovies('War', 'war-carousel-container');
});



// Fonction pour récupérer l'ID d'un film à partir de son nom
async function getMovieIdByName(movieName) {
    try {
        const response = await fetch(`/api/trouver-id?nom=${encodeURIComponent(movieName)}`);
        if (!response.ok) {
            throw new Error('Film non trouvé ou erreur serveur');
        }
        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'ID du film:', error);
        return null;
    }
}

// Fonction pour récuprérer données du top tendances
async function fetchTopTendancesData() {
    try {
        const response = await fetch('/top_tendances'); //route du top (dans top_tendance.json à la racine)
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération du fichier json !');
        }
        const topTendancesData = await response.json();

        // Mise à jour des éléments HTML avec les données JSON
        const topTendancesLink = document.querySelector('#top-tendances a');
        const topTendancesImg = document.querySelector('#top-tendances img');
        const topTendancesLogo = document.querySelector('#top-tendances .top-tendances-overlay img');

        //envoie des données dans les balises du template html
        topTendancesLink.setAttribute('href', `/film/${topTendancesData.id}`);
        topTendancesImg.setAttribute('src', topTendancesData.UrlImage);
        topTendancesLogo.setAttribute('src', topTendancesData.UrlLogoFilm);

        // récupérer le nom du film du json pour l'envoyer ensuite à la fonction au dessus
        const movieId = await getMovieIdByName(topTendancesData.NomFilm);
        if (movieId) {
            topTendancesLink.setAttribute('href', `/film/${movieId}`);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données !', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchTopTendancesData);