// ========================================
// CONFIGURACIÓN INICIAL Y VARIABLES
// ========================================

// Elementos del DOM principales
const toggleFormButton = document.getElementById('toggle-form');
const movieForm = document.getElementById('movie-form');
const backgroundScene = document.querySelector('.background-scene');

// Array de colores para el cambio dinámico del cielo
const skyColors = [
    '#ffa17f', // Atardecer cálido
    '#ff758c', // Rosa intenso
    '#8559a5', // Púrpura
    '#5f0a87'  // Morado oscuro
];

// Índice actual del color del cielo
let currentSkyIndex = 0;

// ========================================
// FUNCIONALIDAD DEL FORMULARIO
// ========================================

/**
 * Alternar la visibilidad del formulario de películas
 */
function toggleMovieForm() {
    movieForm.classList.toggle('show');
    
    // Cambiar el texto del botón según el estado
    if (movieForm.classList.contains('show')) {
        toggleFormButton.textContent = '❌ Cerrar formulario';
    } else {
        toggleFormButton.textContent = '➕ Añadir nueva película';
    }
}

// Event listener para el botón de toggle del formulario
toggleFormButton.addEventListener('click', toggleMovieForm);

// ========================================
// CAMBIO DINÁMICO DEL CIELO
// ========================================

/**
 * Cambiar el color del cielo de fondo
 */
function changeSkyColor() {
    // Incrementar el índice (con wrap-around)
    currentSkyIndex = (currentSkyIndex + 1) % skyColors.length;
    
    // Aplicar el nuevo gradiente
    const newGradient = `linear-gradient(to bottom, ${skyColors[currentSkyIndex]}, #845ec2)`;
    backgroundScene.style.background = newGradient;
    
    // Log para debugging (opcional)
    console.log(`Cielo cambiado a: ${skyColors[currentSkyIndex]}`);
}

/**
 * Crear y añadir botón para cambiar el cielo
 */
function createSkyToggleButton() {
    const skyToggleButton = document.createElement('button');
    
    // Configurar el botón
    skyToggleButton.textContent = '🎨 Cambiar cielo';
    skyToggleButton.id = 'sky-toggle-button';
    
    // Estilos inline para el botón
    Object.assign(skyToggleButton.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: '1000',
        padding: '0.5rem 1rem',
        borderRadius: '10px',
        border: 'none',
        fontFamily: 'Orbitron, sans-serif',
        background: '#fff',
        color: '#333',
        cursor: 'pointer',
        fontSize: '0.9rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
    });
    
    // Efecto hover
    skyToggleButton.addEventListener('mouseenter', () => {
        skyToggleButton.style.background = '#ffcc70';
        skyToggleButton.style.transform = 'scale(1.05)';
    });
    
    skyToggleButton.addEventListener('mouseleave', () => {
        skyToggleButton.style.background = '#fff';
        skyToggleButton.style.transform = 'scale(1)';
    });
    
    // Event listener para cambiar el cielo
    skyToggleButton.addEventListener('click', changeSkyColor);
    
    // Añadir al DOM
    document.body.appendChild(skyToggleButton);
}

// ========================================
// FUNCIONALIDAD DE FILTROS DE GÉNERO
// ========================================

/**
 * Configurar los filtros de género
 */
function setupGenreFilters() {
    const genreButtons = document.querySelectorAll('[data-genre]');
    
    genreButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedGenre = event.target.dataset.genre;
            
            // Remover clase 'active' de todos los botones
            genreButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir clase 'active' al botón clickeado
            event.target.classList.add('active');
            
            // Filtrar películas (esta función debe implementarse según tu lógica)
            filterMoviesByGenre(selectedGenre);
            
            console.log(`Filtro aplicado: ${selectedGenre}`);
        });
    });
}

/**
 * Filtrar películas por género (función placeholder)
 * @param {string} genre - Género seleccionado
 */
function filterMoviesByGenre(genre) {
    // TODO: Implementar lógica de filtrado
    // Esta función debe conectarse con tu sistema de gestión de películas
    console.log(`Filtrando películas por género: ${genre}`);
}

// ========================================
// MANEJO DEL FORMULARIO DE PELÍCULA
// ========================================

/**
 * Manejar el envío del formulario de película
 */
function handleMovieFormSubmit(event) {
    event.preventDefault();
    
    // Obtener datos del formulario
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
    
    // Validar datos básicos
    if (!movieData.title.trim()) {
        alert('Por favor, ingresa un título para la película');
        return;
    }
    
    // Procesar los datos de la película
    console.log('Nueva película añadida:', movieData);
    
    // TODO: Aquí deberías llamar a tu función para guardar la película
    // saveMovie(movieData);
    
    // Limpiar formulario
    movieForm.reset();
    
    // Cerrar formulario
    movieForm.classList.remove('show');
    toggleFormButton.textContent = '➕ Añadir nueva película';
    
    // Mostrar mensaje de éxito
    showSuccessMessage('¡Película añadida correctamente!');
}

/**
 * Mostrar mensaje de éxito
 * @param {string} message - Mensaje a mostrar
 */
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
    
    // Remover mensaje después de 3 segundos
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// ========================================
// EFECTOS VISUALES ADICIONALES
// ========================================

/**
 * Añadir efecto de parallax al sol
 */
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

/**
 * Añadir efecto de hover a las gaviotas
 */
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

/**
 * Inicializar todas las funcionalidades cuando el DOM esté listo
 */
function initializeApp() {
    console.log('Inicializando Cine de Verano...');
    
    // Configurar funcionalidades principales
    setupGenreFilters();
    createSkyToggleButton();
    addParallaxEffect();
    addSeagullHoverEffect();
    
    // Event listener para el formulario
    movieForm.addEventListener('submit', handleMovieFormSubmit);
    
    // Mensaje de bienvenida en consola
    console.log('🎬 Cine de Verano inicializado correctamente');
    console.log('🌅 Disfruta de la experiencia cinematográfica');
}

// ========================================
// EVENTOS DE CARGA
// ========================================

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializeApp);

// ========================================
// FUNCIONES UTILITARIAS
// ========================================

/**
 * Debounce function para optimizar eventos
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} - Función debounced
 */
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

/**
 * Detectar dispositivos móviles
 * @returns {boolean} - True si es dispositivo móvil
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ========================================
// AJUSTES PARA DISPOSITIVOS MÓVILES
// ========================================

/**
 * Aplicar ajustes específicos para móviles
 */
function applyMobileAdjustments() {
    if (isMobileDevice()) {
        // Reducir la velocidad de animación en móviles
        const seagulls = document.querySelectorAll('.seagull');
        seagulls.forEach(seagull => {
            seagull.style.animationDuration = '20s';
        });
        
        // Ajustar el botón de cambio de cielo para móviles
        const skyButton = document.getElementById('sky-toggle-button');
        if (skyButton) {
            skyButton.style.fontSize = '0.8rem';
            skyButton.style.padding = '0.4rem 0.8rem';
        }
        
        console.log('Ajustes para móviles aplicados');
    }
}

// Aplicar ajustes móviles después de la inicialización
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(applyMobileAdjustments, 100);
});