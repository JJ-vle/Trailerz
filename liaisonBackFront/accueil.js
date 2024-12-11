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
