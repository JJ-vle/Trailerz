const express = require('express');
const Movie = require('../models/movie');
const mongoose = require('mongoose');

module.exports = (app) => {

    app.post('/api/add-movie', async (req, res) => {
        const { name, genre, url, actor, director, creator, image, keywords } = req.body;
    
        // Validation de base
        if (!name || !genre || !url) {
            return res.status(400).json({ message: 'Certains champs obligatoires sont manquants.' });
        }
    
        // Création du film
        const newMovie = new Movie({
            _id: new mongoose.Types.ObjectId(),
            '@type': 'Movie',
            name,
            genre,
            url,
            image,
            keywords,
            actor: actor ? actor.map(a => ({
                '@type': a['@type'] || 'Person',
                url: a.url,
                name: a.name
            })) : undefined,
            director: director ? director.map(d => ({
                '@type': d['@type'] || 'Person',
                url: d.url,
                name: d.name
            })) : undefined,
            creator: creator ? creator.map(c => ({
                '@type': c['@type'] || 'Person',
                url: c.url,
                name: c.name,
                description: c.description
            })) : undefined
        });
    
        try {
            await newMovie.save();
            res.status(201).json({ message: 'Film ajouté avec succès !', movie: newMovie });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de l\'ajout du film.', error: error.message });
        }
    });
    
    
    // Route de mise à jour de film
    app.put('/api/update-movie', async (req, res) => {
        const { id, ...updates } = req.body;
    
        // Vérification si l'ID est fourni
        if (!id) {
            return res.status(400).json({ message: 'L\'ID du film est requis.' });
        }
    
        try {
            // Mise à jour du film avec les données fournies
            const updatedMovie = await Movie.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    
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
    });
};
