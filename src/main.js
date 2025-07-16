// main.js

import { getMovies } from './services.js';

// When the DOM loads, fetch and render movies and initialize the rest of the UI
document.addEventListener('DOMContentLoaded', () => {
    displayMovies();
    initializeApp();
    setTimeout(applyMobileAdjustments, 100);
});

// Fetches movies and draws them in the DOM
async function displayMovies() {
    try {
        const movies = await getMovies();
        console.log('Array of movies received:', movies); // Para depuración
        renderMovies(movies);
    } catch (error) {
        console.error('Error al cargar las películas:', error);
        const container = document.getElementById('movie-list');
        container.innerHTML = '<p>Error al cargar las películas. Inténtalo más tarde.</p>';
    }
}

// Renders movie cards in the container
function renderMovies(movies) {
    const container = document.getElementById('movie-list');
    container.innerHTML = '';

    if (!movies.length) {
        container.innerHTML = '<p>No hay películas disponibles</p>';
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement('article');
        card.classList.add('movie-card');

        card.innerHTML = `
            <img src="${movie.poster_url}" alt="Póster de ${movie.title}">
            <h3>${movie.title}</h3>
            <p><strong>Director:</strong> ${movie.director || 'Desconocido'}</p>
            <p><strong>Año:</strong> ${movie.release_year || 'N/A'}</p>
            <p><strong>Género:</strong> ${movie.genre || 'N/A'}</p>
            <p>${movie.movie_description || ''}</p>
            ${movie.trailer_url ? `<a href="${movie.trailer_url}" target="_blank">🎬 Ver tráiler</a>` : ''}
        `;

        container.appendChild(card);
    });
}

// ========================================
// UI AND STATE SETUP (names in English, web/messages in Spanish)
// ========================================

const toggleFormButton = document.getElementById('toggle-form');
const movieForm = document.getElementById('movie-form');
const backgroundScene = document.querySelector('.background-scene');
const skyColors = ['#ffa17f', '#ff758c', '#8559a5', '#5f0a87'];
let currentSkyIndex = 0;

// ========================================
// FORM TOGGLE LOGIC
// ========================================

function toggleMovieForm() {
    movieForm.classList.toggle('show');
    toggleFormButton.textContent = movieForm.classList.contains('show')
        ? '❌ Cerrar formulario'
        : '➕ Añadir nueva película';
}
toggleFormButton.addEventListener('click', toggleMovieForm);

// ========================================
// CHANGING SKY COLOR
// ========================================

function changeSkyColor() {
    currentSkyIndex = (currentSkyIndex + 1) % skyColors.length;
    const newGradient = `linear-gradient(to bottom, ${skyColors[currentSkyIndex]}, #845ec2)`;
    backgroundScene.style.background = newGradient;
}

function createSkyToggleButton() {
    if (document.getElementById('sky-toggle-btn')) return;
    const skyToggleButton = document.createElement('button');
    skyToggleButton.textContent = '🎨 Cambiar cielo';
    skyToggleButton.id = 'sky-toggle-btn';
    skyToggleButton.type = 'button';

    skyToggleButton.addEventListener('click', changeSkyColor);

    // Insert just after <p> in header
    const desc = document.getElementById('header-desc');
    if (desc && desc.parentNode) {
        desc.parentNode.insertBefore(skyToggleButton, desc.nextSibling);
    }
}

// ========================================
// GENRE FILTERS
// ========================================

function setupGenreFilters() {
    const genreButtons = document.querySelectorAll('[data-genre]');
    genreButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedGenre = event.target.dataset.genre;
            genreButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            filterMoviesByGenre(selectedGenre);
            console.log(`Filtro aplicado: ${selectedGenre}`);
        });
    });
}

function filterMoviesByGenre(genre) {
    // Future filter logic if needed
    console.log(`Filtrando películas por género: ${genre}`);
}

// ========================================
// FORM SUBMISSION HANDLING
// ========================================

function handleMovieFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(movieForm);
    const movieData = {
        title: formData.get('title'),
        director: formData.get('director'),
        release_year: formData.get('release_year'),
        genre: formData.get('genre'),
        movie_description: formData.get('movie_description'),
        poster_url: formData.get('poster_url'),
        trailer_url: formData.get('trailer_url')
    };

    if (!movieData.title.trim()) {
        alert('Por favor, ingresa un título para la película');
        return;
    }

    // Para depuración
    console.log('Nueva película añadida:', movieData);

    // Aquí puedes hacer POST a la API si lo deseas

    movieForm.reset();
    movieForm.classList.remove('show');
    toggleFormButton.textContent = '➕ Añadir nueva película';
    showSuccessMessage('¡Película añadida correctamente!');
}

// ========================================
// UI EFFECTS AND EXTRAS
// ========================================

function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.textContent = message;

    Object.assign(successMessage.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#4CAF50',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '10px',
        zIndex: '1001',
        fontFamily: 'Orbitron, sans-serif',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    });

    document.body.appendChild(successMessage);
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

function addParallaxEffect() {
    const sun = document.getElementById('sun');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        if (sun) {
            sun.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    });
}

function addSeagullHoverEffect() {
    const seagulls = document.querySelectorAll('.seagull');
    seagulls.forEach(seagull => {
        seagull.addEventListener('mouseenter', () => {
            seagull.style.transform = 'scale(1.2)';
            seagull.style.filter = 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))';
        });

        seagull.addEventListener('mouseleave', () => {
            seagull.style.transform = 'scale(1)';
            seagull.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))';
        });
    });
}

// ========================================
// INITIALIZATION
// ========================================

function initializeApp() {
    setupGenreFilters();
    createSkyToggleButton();
    addParallaxEffect();
    addSeagullHoverEffect();
    movieForm.addEventListener('submit', handleMovieFormSubmit);
    console.log('🎬 Cine de Verano inicializado correctamente');
    console.log('🌅 Disfruta de la experiencia cinematográfica');
}

// ========================================
// MOBILE ADJUSTMENTS
// ========================================

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function applyMobileAdjustments() {
    if (isMobileDevice()) {
        const seagulls = document.querySelectorAll('.seagull');
        seagulls.forEach(seagull => {
            seagull.style.animationDuration = '20s';
        });

        const skyButton = document.getElementById('sky-toggle-btn');
        if (skyButton) {
            skyButton.style.fontSize = '0.8rem';
            skyButton.style.padding = '0.4rem 0.8rem';
        }

        console.log('Ajustes para móviles aplicados');
    }
}
