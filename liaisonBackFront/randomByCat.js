async function fetchRandomMovie() {
    const selectedCategories = [];
    const categoryInputs = document.querySelectorAll('input[name="category"]:checked');
    categoryInputs.forEach(input => {
        selectedCategories.push(input.value);
    });

    if (selectedCategories.length === 0) {
        alert('Veuillez sélectionner au moins une catégorie');
        return;
    }

    try {
        const response = await fetch(`/api/film-aleatoire?categories=${selectedCategories.join(',')}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données du film');
        }
        const movie = await response.json();

        document.getElementById('movie-details').innerHTML = `
            <a href="./film/${movie.id}">
            <h1>${movie.name}</h1>
            <img src="${movie.image}" alt="${movie.name}">
            </a>
            <p><strong>Genre:</strong> ${movie.genre.join(', ')}</p>
            <p><strong>Réalisateur:</strong> <a href="${movie.director.url}">${movie.director.name}</a></p>
            <p><strong>Note:</strong> ${movie.aggregateRating.ratingValue}/10 (${movie.aggregateRating.ratingCount} votes)</p>
        `;
    } catch (err) {
        console.error(err);
        document.getElementById('movie-details').innerText = 'Erreur lors du chargement des données.';
    }
}