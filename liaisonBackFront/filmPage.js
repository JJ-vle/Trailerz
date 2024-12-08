const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { Client } = require('youtubei');

module.exports = (app, mongoose, Movie) => {
    // transformation durée de base en vraie durée du film
    const formatDuration = (duration) => {
        const regex = /^PT(\d+H)?(\d+M)?$/;
        const matches = duration.match(regex);
        if (!matches) return 'Rien à afficher';

        let hours = 0;
        let minutes = 0;

        if (matches[1]) {
            hours = parseInt(matches[1].replace('H', ''), 10);
        }
        if (matches[2]) {
            minutes = parseInt(matches[2].replace('M', ''), 10);
        }

        return `${hours > 0 ? hours + 'h' : ''}${minutes > 0 ? minutes : ''}`;
    };

    // étoiles de note
    const generateStars = (ratingValue) => {
        const totalStars = 10;
        const filledStars = Math.round(ratingValue);
        const emptyStars = totalStars - filledStars;
        let stars = '';
        for (let i = 0; i < filledStars; i++) {
            stars += '★';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        return stars;
    };

    // ajout URL imdb avant tous les liens de la BD
    const addImdbUrl = (url) => {
        return url ? `https://www.imdb.com${url}` : '#';
    };

    // recherche du trailer sur ytb
    const fetchYouTubeTrailerUrl = async (movieName) => {
        try {
            const youtube = new Client();
            const searchQuery = `${movieName} Trailer VO`; //requete sur ytb
            console.log("Recherche pour :", searchQuery);
            const searchResults = await youtube.search(searchQuery);
    
            if (searchResults && searchResults.items && searchResults.items.length > 0) {
                const firstVideo = searchResults.items[0];
                if (firstVideo.id) {
                    const embedUrl = `https://www.youtube.com/embed/${firstVideo.id}`; //url trouvé
                    console.log("URL du trailer trouvé :", embedUrl);
                    return embedUrl;
                }
            }
            console.log("Aucun résultat trouvé.");
            return null;
        } catch (error) {
            console.error('Erreur lors de la recherche sur YouTube:', error.message);
            return null;
        }
    };
    
    

    // APPI PRINCIPALE
    app.get('/film/:id', async (req, res) => {
        const movieId = req.params.id;

        try {
            const movie = await Movie.findById(movieId);
            if (!movie) {
                return res.status(404).send('Film non trouvé');
            }

            // recuperation url trailer ytb
            const ytTrailerUrl = movie.name ? await fetchYouTubeTrailerUrl(movie.name) : null;

            // lecteur du template html
            const filePath = path.join(__dirname, '../template_api_front/template_film_page.html');
            let htmlContent = fs.readFileSync(filePath, 'utf8');

            // remplacement des holders par les données de la BD
            htmlContent = htmlContent.replace(/{{name}}/g, movie.name || 'Film non trouvé');
            htmlContent = htmlContent.replace(/{{image}}/g, movie.image || 'https://via.placeholder.com/500x750?text=Image+indisponible');
            htmlContent = htmlContent.replace(/{{url}}/g, addImdbUrl(movie.url));
            htmlContent = htmlContent.replace(/{{description}}/g, movie.description || 'Rien à afficher');
            htmlContent = htmlContent.replace(/{{type}}/g, movie['@type'] || 'Rien à afficher');
            htmlContent = htmlContent.replace(/{{duration}}/g, movie.duration ? formatDuration(movie.duration) : 'Rien à afficher');
            htmlContent = htmlContent.replace(/{{ratingStars}}/g, movie.aggregateRating ? generateStars(movie.aggregateRating.ratingValue) : 'Rien à afficher');
            htmlContent = htmlContent.replace(/{{ratingValue}}/g, movie.aggregateRating ? movie.aggregateRating.ratingValue : 'Rien à afficher');
            htmlContent = htmlContent.replace(/{{bestRating}}/g, movie.aggregateRating ? movie.aggregateRating.bestRating : 'Rien à afficher');
            htmlContent = htmlContent.replace(/{{worstRating}}/g, movie.aggregateRating ? movie.aggregateRating.worstRating : 'Rien à afficher');
            htmlContent = htmlContent.replace(/{{ratingCount}}/g, movie.aggregateRating ? movie.aggregateRating.ratingCount : 'Rien à afficher');

            // Contenu en dessous : acteurs, réalisateurs, créateurs ---> Collections
            htmlContent = htmlContent.replace(/{{actors}}/g, movie.actor && movie.actor.length > 0 ? movie.actor.map(actor => `
                <p><strong>${actor.name || 'Acteur inconnu'}</strong> - <a target="_blank" href="${addImdbUrl(actor.url)}">Voir profil</a></p>
            `).join('') : '<p>Rien à afficher</p>');

            htmlContent = htmlContent.replace(/{{directors}}/g, movie.director ? `
                <p><strong>${movie.director.name}</strong> - <a target="_blank" href="${addImdbUrl(movie.director.url)}">Voir profil</a></p>
            ` : '<p>Rien à afficher</p>');

            htmlContent = htmlContent.replace(/{{creators}}/g, movie.creator && movie.creator.some(creator => creator.name) ? `
                ${movie.creator.map(creator => creator.name ? `
                    <p><strong>${creator.name || 'Créateur inconnu'}</strong> - <a target="_blank" href="${addImdbUrl(creator.url)}">Voir profil</a></p>
                ` : '').join('')}
            ` : '<p>Rien à afficher</p>');

            htmlContent = htmlContent.replace(/{{keywords}}/g, movie.keywords && movie.keywords.length > 0 ? movie.keywords.join(', ') : 'Rien à afficher');
            htmlContent = htmlContent.replace(/{{budget}}/g, movie.budget || 'Rien à afficher');

            htmlContent = htmlContent.replace(/{{ytbTrailer}}/g, ytTrailerUrl || '#');

            htmlContent = htmlContent.replace(/{{trailerUrl}}/g, addImdbUrl(movie.trailer ? movie.trailer.embedUrl : '#'));


            //on envoie le contenu
            res.send(htmlContent);

        } catch (err) {
            console.error('Erreur:', err);
            res.status(500).send('Erreur serveur');
        }
    });

    console.log('Route /film/:id ajoutée pour afficher les informations du film.');
};