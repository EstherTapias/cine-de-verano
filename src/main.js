import { getMovies } from './services.js';

// =======================
// Cuando el DOM está listo
// =======================

document.addEventListener('DOMContentLoaded', () => {
  displayMovies();
  initializeApp();
  setTimeout(applyMobileAdjustments, 100);
});

// =============================================
// Obtiene todas las películas y las pinta (grid)
// =============================================

async function displayMovies() {
  try {
    const movies = await getMovies();
    renderMovies(movies);
  } catch (error) {
    const container = document.getElementById('movie-list');
    container.innerHTML = '<p>Error al cargar las películas. Inténtalo más tarde.</p>';
  }
}

// ===================================================
// Renderiza todas las cards compactas (póster + título)
// ===================================================

function renderMovies(movies) {
  const container = document.getElementById('movie-list');
  container.innerHTML = '';

  if (!movies.length) {
    container.innerHTML = '<p>No hay películas disponibles</p>';
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement('article');
    card.className = 'movie-card';

    // Solo imagen + titulo para la vista de grid
    card.innerHTML = `
      <div class="movie-poster">
        <img src="${movie.poster_url}" alt="Póster de ${movie.title}">
      </div>
      <div class="movie-title">
        <h3>${movie.title}</h3>
      </div>
    `;

    // Efecto neón (usa solo CSS :hover si prefieres, esto es opcional por JS)
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(138, 43, 226, 0.6)';
      card.style.transform = 'translateY(-5px) scale(1.02)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
      card.style.transform = 'translateY(0) scale(1)';
    });

    // Expande al hacer click
    card.addEventListener('click', () => openMovieModal(movie));
    container.appendChild(card);
  });
}

// ============================
// Modal expandido de la película
// ============================

function openMovieModal(movie) {
  // Cierra/borra cualquier otro modal anterior
  const existingModal = document.getElementById('movie-modal');
  if (existingModal) existingModal.remove();

  // Crea overlay y modal centrado limitado
  const overlay = document.createElement('div');
  overlay.id = 'movie-modal';
  overlay.className = 'movie-modal-overlay';

  overlay.innerHTML = `
    <div class="movie-modal">
      <button class="modal-close" title="Cerrar">&times;</button>
      <div class="modal-content">
        <div class="modal-poster">
          <img src="${movie.poster_url}" alt="Póster de ${movie.title}">
        </div>
        <div class="modal-info">
          <h2 class="modal-title">${movie.title}</h2>
          <div class="modal-basic-info">
            <div class="info-item"><span class="info-label">Director</span><div class="info-value">${movie.director || 'Desconocido'}</div></div>
            <div class="info-item"><span class="info-label">Año</span><div class="info-value">${movie.release_year || 'N/A'}</div></div>
            <div class="info-item"><span class="info-label">Género</span><div class="info-value">${movie.genre || 'N/A'}</div></div>
            <div class="info-item"><span class="info-label">Duración</span><div class="info-value">${movie.duration ? movie.duration + ' min' : 'N/A'}</div></div>
            <div class="info-item"><span class="info-label">Puntuación</span><div class="info-value">${movie.rating ? movie.rating + '/10' : 'N/A'}</div></div>
            <div class="info-item"><span class="info-label">Idioma</span><div class="info-value">${movie.language || 'N/A'}</div></div>
            <div class="info-item"><span class="info-label">País</span><div class="info-value">${movie.country || 'N/A'}</div></div>
          </div>
          ${movie.cast && movie.cast.length ?
            `<div class="modal-cast">
              <div class="cast-title">Reparto:</div>
              <div class="cast-list">
                ${movie.cast.map(actor => `<span class="cast-member">${actor}</span>`).join('')}
              </div>
            </div>` : ''
          }
          <div class="modal-description">${movie.movie_description || ''}</div>
          ${movie.trailer_url ? `<a href="${movie.trailer_url}" target="_blank" rel="noopener" class="trailer-button">🎬 Ver tráiler</a>` : ''}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Animación de entrada
  setTimeout(() => {
    overlay.classList.add('show');
  }, 10);

  // Cerrar modal: botón, click fuera, o ESC
  overlay.querySelector('.modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', closeWithEsc);
}

// Cierra y elimina el modal
function closeModal() {
  const modal = document.getElementById('movie-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
  document.removeEventListener('keydown', closeWithEsc);
}

// Cerrar modal con tecla ESC
function closeWithEsc(e) {
  if (e.key === 'Escape') closeModal();
}

// ===================
// RESTO DE FUNCIONES
// ===================

// Variables para extras
const toggleFormButton = document.getElementById('toggle-form');
const movieForm = document.getElementById('movie-form');
const backgroundScene = document.querySelector('.background-scene');
const skyColors = ['#ffa17f', '#ff758c', '#8559a5', '#5f0a87'];
let currentSkyIndex = 0;

// Mostrar/ocultar formulario de película
function toggleMovieForm() {
  movieForm.classList.toggle('show');
  toggleFormButton.textContent = movieForm.classList.contains('show')
    ? '❌ Cerrar formulario'
    : '➕ Añadir nueva película';
}
if (toggleFormButton) {
  toggleFormButton.addEventListener('click', toggleMovieForm);
}

// Cambia el color de fondo del cielo animado
function changeSkyColor() {
  currentSkyIndex = (currentSkyIndex + 1) % skyColors.length;
  const newGradient = `linear-gradient(to bottom, ${skyColors[currentSkyIndex]}, #845ec2)`;
  if (backgroundScene) {
    backgroundScene.style.background = newGradient;
  }
}

function createSkyToggleButton() {
  if (document.getElementById('sky-toggle-btn')) return;

  const skyToggleButton = document.createElement('button');
  skyToggleButton.textContent = '🎨 Cambiar cielo';
  skyToggleButton.id = 'sky-toggle-btn';
  skyToggleButton.type = 'button';

  skyToggleButton.addEventListener('click', changeSkyColor);

  // Insertar después del párrafo de descripción en el header
  const desc = document.getElementById('header-desc');
  if (desc && desc.parentNode) {
    desc.parentNode.insertBefore(skyToggleButton, desc.nextSibling);
  }
}

// Genera los filtros de género (si los tienes)
function setupGenreFilters() {
  const genreButtons = document.querySelectorAll('[data-genre]');
  genreButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const selectedGenre = event.target.dataset.genre;
      genreButtons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      filterMoviesByGenre(selectedGenre);
      // Aquí podrías hacer el filtrado real en el grid usando renderMovies([...])
    });
  });
}

function filterMoviesByGenre(genre) {
  console.log(`Filtrando películas por género: ${genre}`);
  // Aquí puedes implementar el filtrado y volver a llamar a renderMovies(listaFiltrada)
}

// Manejo del envío del formulario para añadir nueva película
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

  if (!movieData.title || !movieData.title.trim()) {
    alert('Por favor, ingresa un título para la película');
    return;
  }

  // Aquí podrías hacer POST a la API si lo deseas

  movieForm.reset();
  movieForm.classList.remove('show');
  toggleFormButton.textContent = '➕ Añadir nueva película';
  showSuccessMessage('¡Película añadida correctamente!');
}

// Mensaje verde de éxito flotante
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

// Parallax de sol
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

// Gaviotas con hover
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

// Inicializa toda la interfaz de usuario
function initializeApp() {
  setupGenreFilters();
  createSkyToggleButton();
  addParallaxEffect();
  addSeagullHoverEffect();
  if (movieForm) {
    movieForm.addEventListener('submit', handleMovieFormSubmit);
  }
  console.log('🎬 Cine de Verano inicializado correctamente');
}

// Detecta móvil
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Ajusta efectos en móvil
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
