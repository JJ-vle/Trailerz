document.addEventListener("DOMContentLoaded", function() {
    let currentThumbnailUrl = '';
    let currentMovieId = '';
    let currentMovieName = '';

    // Fonction pour récupérer un film aléatoire
    function getRandomMovie() {
        fetch('/api/random-movie')
            .then(response => response.json())
            .then(data => {
                console.log("Réponse API:", data);
                if (!data.name || !data.thumbnailUrl) {
                    throw new Error("Données du film incomplètes.");
                }
    
                currentThumbnailUrl = data.thumbnailUrl;
                currentMovieId = data.id;
                currentMovieName = data.name; // Récupère le nom du film
    
                // Afficher l'image du film
                const movieImage = document.getElementById('movieThumbnail');
                movieImage.src = currentThumbnailUrl;
                movieImage.style.display = 'inline-block';
                movieImage.style.width = '300px';
                movieImage.style.textAlign = 'center';
    
                document.getElementById('movieId').value = currentMovieId;
                document.getElementById('movieInput').value = '';
                const textebase=document.getElementById('message');
                textebase.textContent="À vous de jouer, devinez le film !";
                textebase.style.color="white";
            })
            .catch(error => {
                console.error("Erreur lors de la récupération du film :", error);
                document.getElementById('message').textContent = "Erreur : Impossible de récupérer un film.";
            });
    }
    

    // Fonction pour afficher les suggestions de films
    function showSuggestions(query) {
        if (!query) {
            document.getElementById('suggestions').innerHTML = ''; // Vider la liste si la saisie est vide
            return;
        }

        fetch(`/api/search-movies?query=${query}`)
            .then(response => response.json())
            .then(data => {
                const suggestionsList = document.getElementById('suggestions');
                suggestionsList.innerHTML = ''; // Vider la liste avant d'ajouter de nouvelles suggestions

                data.movies.forEach(movie => {
                    const suggestionItem = document.createElement('li');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = movie.name;
                    suggestionItem.addEventListener('click', function() {
                        document.getElementById('movieInput').value = movie.name; // Remplir le champ avec le nom du film sélectionné
                        showSuggestions(''); // Vider les suggestions
                    });
                    suggestionsList.appendChild(suggestionItem);
                });
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des suggestions:", error);
            });
    }

    // Fonction pour vérifier la réponse de l'utilisateur
    function verifyAnswer() {
        if (!currentMovieName) {
            document.getElementById('message').textContent = "Aucun film en cours, veuillez réessayer.";
            console.error("Erreur : le nom du film actuel n'est pas défini.");
            return;
        }

        const userAnswer = document.getElementById('movieInput').value.trim().toLowerCase();

        // Comparer la réponse de l'utilisateur avec le nom du film stocké
        if (userAnswer === currentMovieName.toLowerCase()) {
            const messageElement = document.getElementById('message');
            messageElement.textContent = `Bien joué ! C'était "${currentMovieName}"`;
            messageElement.style.color = "green";

            // Si la réponse est correcte, charger un nouveau film après 2 secondes
            setTimeout(() => {
                getRandomMovie(); // Charger un nouveau film après la bonne réponse
            }, 2000);
        } else {
            // Si la réponse est incorrecte
            const messageElement = document.getElementById('message');
            messageElement.textContent = "Mauvaise réponse, essayez encore !";
            messageElement.style.color = "red";
        }

        // Vider le champ de saisie et la liste des suggestions
        document.getElementById('movieInput').value = '';
        document.getElementById('suggestions').innerHTML = '';
    }
        

    // Écouteur d'événement pour la saisie dans le champ de texte
    document.getElementById('movieInput').addEventListener('input', function(event) {
        const query = event.target.value.trim();
        showSuggestions(query); // Afficher les suggestions en fonction de la saisie
    });

    // Gestion de l'événement "Entrée" pour valider la réponse
    document.getElementById('movieInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            verifyAnswer(); // Appeler la fonction de vérification
        }
    });

    // Initialiser le jeu avec un film aléatoire au début
    getRandomMovie();
});
