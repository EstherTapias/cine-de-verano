import { getMovies } from './services.js';

// Cuando el DOM esté cargado, ejecutamos la función principal
document.addEventListener('DOMContentLoaded', () => {
  mostrarPeliculas();
  // Aquí puedes llamar también otras funciones como setup de filtros o formulario si las tienes
});

// Función que pide las pelis al backend y las muestra
async function mostrarPeliculas() {
  try {
    const movies = await getMovies();
    pintarPeliculas(movies); // Usa tu propia función para mostrarlas
  } catch (error) {
    console.error('Error al cargar las películas:', error);
    const contenedor = document.getElementById('movie-list');
    contenedor.innerHTML = '<p>Error al cargar las películas. Inténtalo más tarde.</p>';
  }
}



// ========================================
// CONFIGURACIÓN INICIAL Y VARIABLES
// ========================================

const toggleFormButton = document.getElementById('toggle-form');
const movieForm = document.getElementById('movie-form');
const backgroundScene = document.querySelector('.background-scene');

// Array de colores para el cambio dinámico del cielo
const skyColors = [
    '#ffa17f',
    '#ff758c',
    '#8559a5',
    '#5f0a87'
];
let currentSkyIndex = 0;

// ========================================
// FUNCIONALIDAD DEL FORMULARIO
// ========================================

function toggleMovieForm() {
    movieForm.classList.toggle('show');
    toggleFormButton.textContent = movieForm.classList.contains('show')
        ? '❌ Cerrar formulario'
        : '➕ Añadir nueva película';
}

toggleFormButton.addEventListener('click', toggleMovieForm);

// ========================================
// CAMBIO DINÁMICO DEL CIELO
// ========================================

function changeSkyColor() {
    currentSkyIndex = (currentSkyIndex + 1) % skyColors.length;
    const newGradient = `linear-gradient(to bottom, ${skyColors[currentSkyIndex]}, #845ec2)`;
    backgroundScene.style.background = newGradient;
    console.log(`Cielo cambiado a: ${skyColors[currentSkyIndex]}`);
}

function createSkyToggleButton() {
    if (document.getElementById('sky-toggle-btn')) return;

    const skyToggleButton = document.createElement('button');
    skyToggleButton.textContent = '🎨 Cambiar cielo';
    skyToggleButton.id = 'sky-toggle-btn';
    skyToggleButton.type = 'button';

    skyToggleButton.addEventListener('click', changeSkyColor);

    // Insertamos justo después del <p> en el header
    const desc = document.getElementById('header-desc');
    if (desc && desc.parentNode) {
        desc.parentNode.insertBefore(skyToggleButton, desc.nextSibling);
    }
}

// ========================================
// FUNCIONALIDAD DE FILTROS DE GÉNERO
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
    console.log(`Filtrando películas por género: ${genre}`);
}

// ========================================
// MANEJO DEL FORMULARIO DE PELÍCULA
// ========================================

function handleMovieFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(movieForm);
    const movieData = {
        title: formData.get('title'),
        director: formData.get('director'),
        releaseYear: formData.get('release_year'),
        genre: formData.get('genre'),
        description: formData.get('movie_description'),
        posterUrl: formData.get('poster_url'),
        trailerUrl: formData.get('trailer_url')
    };

    if (!movieData.title.trim()) {
        alert('Por favor, ingresa un título para la película');
        return;
    }

    console.log('Nueva película añadida:', movieData);

    // TODO: saveMovie(movieData);

    movieForm.reset();
    movieForm.classList.remove('show');
    toggleFormButton.textContent = '➕ Añadir nueva película';
    showSuccessMessage('¡Película añadida correctamente!');
}

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

// ========================================
// EFECTOS VISUALES ADICIONALES
// ========================================

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
// INICIALIZACIÓN
// ========================================

function initializeApp() {
    console.log('Inicializando Cine de Verano...');
    setupGenreFilters();
    createSkyToggleButton();
    addParallaxEffect();
    addSeagullHoverEffect();
    movieForm.addEventListener('submit', handleMovieFormSubmit);
    console.log('🎬 Cine de Verano inicializado correctamente');
    console.log('🌅 Disfruta de la experiencia cinematográfica');
}

// ========================================
// EVENTOS DE CARGA
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setTimeout(applyMobileAdjustments, 100);
});

// ========================================
// FUNCIONES UTILITARIAS
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ========================================
// AJUSTES PARA DISPOSITIVOS MÓVILES
// ========================================

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
