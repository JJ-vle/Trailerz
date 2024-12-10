const express = require('express');
const Movie = require('../models/movie');
const mongoose = require('mongoose');

module.exports = (app) => {
    //app.use(express.json()); // Assure-toi que le middleware JSON est utilisé ici

    // Route pour ajouter un film
    app.post('/api/add-movie', async (req, res) => {
        console.log("Données reçues :", req.body);
    
        // Déstructuration des données
        const { name, datePublished, actor, director, genre, duration, url, description } = req.body;
    
        // Vérification des champs obligatoires
        if (!name || !datePublished || !actor || !director || !genre || !duration || !url || !description) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }
    
        const newMovie = new Movie({
            _id: new mongoose.Types.ObjectId(),
            '@context': 'http://schema.org',
            '@type': 'Movie',
            name,
            datePublished,
            actor: actor.map(a => ({ '@type': 'Person', name: a.name, url: a.url || '' })),
            director: director.map(d => ({ '@type': 'Person', name: d.name, url: d.url || '' })),
            genre,
            duration,
            url,
            description
        });
    
        try {
            await newMovie.save();
            res.status(201).json({ message: 'Film ajouté avec succès !', movie: newMovie });
        } catch (error) {
            console.error('Erreur lors de l\'ajout du film:', error);
            res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du film', error: error.message });
        }
    });
    


    
/*
    // Route de mise à jour de film
    app.put('/api/update-movie', async (req, res) => {
        const { id, name, datePublished, actor, director, genre, duration, url, description } = req.body;

        // Vérification si l'ID du film est présent
        if (!id) {
            return res.status(400).json({ message: 'L\'ID du film est requis.' });
        }

        try {
            // Mise à jour du film par son ID
            const updatedMovie = await Movie.findByIdAndUpdate(id, {
                name,
                datePublished,
                actor,
                director,
                genre,
                duration,
                url,
                description
            }, { new: true });

            if (!updatedMovie) {
                return res.status(404).json({ message: 'Film non trouvé' });
            }

            res.json({ message: 'Film mis à jour avec succès', updatedMovie });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du film', error);
            res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du film', error });
        }
    });

    // Route de suppression de film
    app.delete('/api/delete-movie', async (req, res) => {
        const { id } = req.body;

        // Vérification si l'ID est bien présent
        if (!id) {
            return res.status(400).json({ message: 'L\'ID du film est requis.' });
        }

        try {
            // Suppression du film par son ID
            const deletedMovie = await Movie.findByIdAndDelete(id);
            if (!deletedMovie) {
                return res.status(404).json({ message: 'Film non trouvé' });
            }
            res.json({ message: 'Film supprimé avec succès' });
        } catch (error) {
            console.error('Erreur lors de la suppression du film', error);
            res.status(500).json({ message: 'Erreur serveur lors de la suppression du film', error });
        }
    });*/
};
