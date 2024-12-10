const mongoose = require('mongoose');

// Définition du modèle Movie
const movieSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    '@context': {
        type: String,
        default: 'http://schema.org'
    },
    '@type': {
        type: String,
        default: 'Movie'
    },
    url: String,
    name: String,
    image: String,
    genre: [String],
    contentRating: String,
    actor: [{
        '@type': {
            type: String,
            default: 'Person'
        },
        url: String,
        name: String,
    }],
    director: {
        '@type': {
            type: String,
            default: 'Person'
        },
        url: String,
        name: String,
    },
    creator: [{
        '@type': String,
        url: String,
        name: String,
        description: String
    }],
    keywords: [String],
    description: String,
    datePublished: String,
    aggregateRating: {
        '@type': {
            type: String,
            default: 'AggregateRating'
        },
        ratingCount: Number,
        bestRating: String,
        worstRating: String,
        ratingValue: String,
    },
    review: [{
        '@type': {
            type: String,
            default: 'Review'
        },
        itemReviewed: {
            '@type': {
                type: String,
                default: 'CreativeWork'
            },
            url: String,
        },
        author: {
            '@type': {
                type: String,
                default: 'Person'
            },
            name: String,
        },
        dateCreated: String,
        inLanguage: String,
        name: String,
        reviewBody: String,
        reviewRating: {
            '@type': String,
            worstRating: String,
            bestRating: String,
            ratingValue: String,
        }
    }],
    dateCreated: String,
    duration: String,
    mainEntityOfPage: String,
    musicBy: {
        '@type': String,
        name: String,
        url: String
    },
    productionCompany: {
        '@type': String,
        name: String,
        url: String,
    },
    distributor: {
        '@type': String,
        name: String,
        url: String,
    },
    countryOfOrigin: String,
    language: String,
    releaseDate: String,
    dateModified: String,
    trailer: {
        '@type': String,
        name: String,
        embedUrl: String,
        thumbnailUrl: String,
        description: String,
        uploadDate: String
    },
    budget: String,
    boxOffice: String,
    hasPart: [{
        '@type': String,
        name: String,
        url: String,
    }],
    offers: {
        '@type': String,
        url: String,
        priceCurrency: String,
        price: String,
        validFrom: String,
        validThrough: String,
    },
    video: {
        '@type': String,
        name: String,
        url: String,
    }
});

const Movie = mongoose.model('Movie', movieSchema, "trailerz");

module.exports = Movie;