# Projet Fil Rouge - R510 : Trailerz

## Description du Projet

Le projet fil rouge du module R510 consiste à concevoir et mettre en œuvre une base de données dédiée à la gestion de bandes-annonces (trailers). Cette base de données est exploitée via un site web permettant diverses interactions avec les fiches des bandes-annonces.

### Fonctionnalités du Site Web

- **Page d'accueil** : 
    - Menu de navigation
    - Le film à la une
    - Liste des genres
    - Top en fonction du genre (top 4 action, top 4 aventure...)
    - Top global
- **Page Films** :
    - Double curseur de sélections de dates (frise de 1900 à aujourd'hui, peut déplacer les deux curseurs pour former une plage de date de sortie)
    - Recherche par réalisateurs / acteurs
    - Recherche par catégorie : bouton qui déplie une selection de checkbox de catégories
    - Recherche par durée : durée du film (pré-plage de sélection ex:30min-1h30 etc.)
- **Zone de recherche** :
    - Permettre la recherche d'un film en tappant le nom du film
- **Page Admin** : 
    - Gérer les tendances
    - Ajouter un film à la BD
    - Modifier un film
    - Supprimer un film
- **Page de jeux** : 
    - Deviner le titre film à partir d'une image prise dans le film
    - Deviner le titre du film à partir d'un acteur, puis du genre, puis d'une année...


L’objectif est de proposer une interface intuitive et performante pour les utilisateurs tout en exploitant efficacement les données stockées.

---

## Technologies Utilisées

- **Backend** :
  - Base de données orientée document : Json avec MongoDB
  - Framework côté serveur : NodeJS/NestJS
- **Frontend** :
  - HTML/CSS
  - JavaScript/React
- **Outils** :
  - Systèmes de gestion de version : Github

---

## Membres de l’Équipe

- **Valentin LUTHRINGER**  
- **Jean-Jacques VIALE**  
- **Luca VIZIO**

Chacun des membres contribue activement aux aspects de conception, développement et intégration du projet.

---

## Objectifs

- Mettre en œuvre une solution complète alliant base de données robuste et interface utilisateur fluide.
- Favoriser la collaboration en équipe tout en respectant les principes de gestion de projet logiciel.
- Démontrer une maîtrise des technologies enseignées durant le module.
