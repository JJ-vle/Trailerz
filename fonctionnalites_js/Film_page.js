const fs = require('fs');
const path = require('path');

module.exports = (app, mongoose, Movie) => {
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

    const addImdbUrl = (url) => {
        return url ? `https://www.imdb.com/${url}` : '#';
    };

    app.get('/film/:id', async (req, res) => {
        const movieId = req.params.id;

        try {
            const movie = await Movie.findById(movieId);
            if (!movie) {
                return res.status(404).send('Film non trouvé');
            }

            // Lire le fichier HTML
            const filePath = path.join(__dirname, '../template_api_front/template_film_page.html');
            let htmlContent = fs.readFileSync(filePath, 'utf8');

            // Remplacer les placeholders dans le fichier HTML
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

            // Injecter les acteurs, réalisateurs, créateurs etc.
            htmlContent = htmlContent.replace(/{{actors}}/g, movie.actor && movie.actor.length > 0 ? movie.actor.map(actor => `
                <p><strong>${actor.name || 'Acteur inconnu'}</strong> - <a href="${addImdbUrl(actor.url)}">Voir profil</a></p>
            `).join('') : '<p>Rien à afficher</p>');

            htmlContent = htmlContent.replace(/{{directors}}/g, movie.director ? `
                <p><strong>${movie.director.name}</strong> - <a href="${addImdbUrl(movie.director.url)}">Voir profil</a></p>
            ` : '<p>Rien à afficher</p>');

            htmlContent = htmlContent.replace(/{{creators}}/g, movie.creator && movie.creator.some(creator => creator.name) ? `
                ${movie.creator.map(creator => creator.name ? `
                    <p><strong>${creator.name || 'Créateur inconnu'}</strong> - <a href="${addImdbUrl(creator.url)}">Voir profil</a></p>
                ` : '').join('')}
            ` : '<p>Rien à afficher</p>');

            // Autres informations
            htmlContent = htmlContent.replace(/{{keywords}}/g, movie.keywords && movie.keywords.length > 0 ? movie.keywords.join(', ') : 'Rien à afficher');
            htmlContent = htmlContent.replace(/{{budget}}/g, movie.budget || 'Rien à afficher');
            htmlContent = htmlContent.replace(/{{trailerUrl}}/g, addImdbUrl(movie.trailer ? movie.trailer.embedUrl : '#'));

            // Envoyer le contenu HTML
            res.send(htmlContent);

        } catch (err) {
            console.error('Erreur:', err);
            res.status(500).send('Erreur serveur');
        }
    });

    console.log('Route /film/:id ajoutée pour afficher les informations du film.');
};
