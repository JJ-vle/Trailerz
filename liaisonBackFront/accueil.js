// Liaison du back au front pour le carrousel de sélection aléatoire
document.addEventListener('DOMContentLoaded', async () => {
    const randomCarousel = document.querySelector('#random-carousel-container .carousel'); // Sélectionner le carrousel de la sélection aléatoire

    try {
        // Appel à l'API pour récupérer les affiches aléatoires
        const response = await fetch('/api/carrousel-random');

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données de l’API');
        }

        const movies = await response.json();

        // Vider le contenu initial
        randomCarousel.innerHTML = '';

        // Ajouter les affiches récupérées dans le carrousel
        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie');

            // Créer un lien qui enveloppe l'image
            const linkElement = document.createElement('a');
            linkElement.href = `/film/${movie.id}`; // URL dynamique
            linkElement.style.textDecoration = 'none'; // Enlever soulignement (si besoin)

            const imgElement = document.createElement('img');
            imgElement.src = movie.image;
            imgElement.alt = `Affiche du film ${movie.id}`;

            // Ajouter l'image au lien et le lien au conteneur
            linkElement.appendChild(imgElement);
            movieElement.appendChild(linkElement);
            randomCarousel.appendChild(movieElement);
        });

        // Recalculer la largeur des films pour le carousel
        updateCarouselWidth(randomCarousel);
    } catch (error) {
        console.error('Erreur:', error);
    }
});


// Fonction pour récupérer et afficher les films d'une catégorie donnée dans un carrousel
async function fetchAndDisplayMovies(category, carouselId) {
    const carousel = document.querySelector(`#${carouselId} .carousel`); // Sélectionner le carrousel de la catégorie

    try {
        // Appel à l'API pour récupérer les films les mieux notés de la catégorie spécifiée
        const response = await fetch(`/api/carrousel-bestrate-cat?category=${category}`);

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération des données de l’API pour la catégorie ${category}`);
        }

        const movies = await response.json();

        // Vider le contenu initial du carrousel
        carousel.innerHTML = '';

        // Ajouter les affiches récupérées dans le carrousel
        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie');

            // Créer un lien qui enveloppe l'image
            const linkElement = document.createElement('a');
            linkElement.href = `/film/${movie.id}`; // URL dynamique
            linkElement.style.textDecoration = 'none'; // Enlever soulignement (si besoin)

            const imgElement = document.createElement('img');
            imgElement.src = movie.image;
            imgElement.alt = `Affiche du film ${movie.id}`;

            // Ajouter l'image au lien et le lien au conteneur
            linkElement.appendChild(imgElement);
            movieElement.appendChild(linkElement);
            carousel.appendChild(movieElement);
        });

        // Recalculer la largeur des films pour le carrousel
        updateCarouselWidth(carousel);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Fonction pour recalculer la largeur des films dans le carrousel
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

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', async () => {
    // Appels à l'API pour récupérer les films les mieux notés pour chaque catégorie
    fetchAndDisplayMovies('Horror', 'horror-carousel-container');  // Films d'horreur
    fetchAndDisplayMovies('Action', 'action-carousel-container');  // Films d'action
    fetchAndDisplayMovies('Comedy', 'comedy-carousel-container');  // Films d'aventure
    fetchAndDisplayMovies('War', 'war-carousel-container');  // Films de science-fiction
});