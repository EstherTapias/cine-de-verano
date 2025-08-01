// Importamos las funciones del servicio que manejan las operaciones CRUD de películas
import { getMovies, addMovie, editMovie, deleteMovie } from './services.js';

// Variables globales para el estado de la aplicación
let allMovies = []; // Array que contiene todas las películas
let currentGenre = "all"; // Género actualmente seleccionado en los filtros

// Referencias a elementos del DOM que usaremos frecuentemente
const movieForm = document.getElementById('movie-form');
const toggleFormButton = document.getElementById('toggle-form');
const backgroundScene = document.querySelector('.background-scene');

// Colores para el efecto de cambio de cielo
const skyColors = ['#ffa17f', '#ff758c', '#8559a5', '#5f0a87'];
let currentSkyIndex = 0;

// Esperamos a que el DOM esté completamente cargado antes de inicializar la app
document.addEventListener('DOMContentLoaded', () => {
  displayMovies(); // Carga y muestra las películas
  setupGenreFilters(); // Configura los filtros por género
  initializeApp(); // Inicializa efectos visuales y funcionalidades extras
  setTimeout(applyMobileAdjustments, 100);
});

// Función principal para cargar y mostrar todas las películas
async function displayMovies() {
  try {
    allMovies = await getMovies();
    renderMovies(getMoviesByActiveGenre());
  } catch (error) {
    console.error('Error al cargar las películas:', error);
    renderMovies([]);
  }
}

// Actualiza solo la vista sin recargar el array global
function updateMoviesView() {
  renderMovies(getMoviesByActiveGenre());
}

// Añadir una nueva película al array local
function addMovieToArray(newMovie) {
  allMovies.push(newMovie);
}

// Editar una película específica en el array local
function updateMovieInArray(movieId, updatedData) {
  const index = allMovies.findIndex(m => m.id === movieId);
  if (index !== -1) {
    allMovies[index] = { ...allMovies[index], ...updatedData };
  }
}

// Eliminar una película específica del array local
function removeMovieFromArray(movieId) {
  allMovies = allMovies.filter(m => m.id !== movieId);
}

// Filtra las películas según el género actualmente activo
function getMoviesByActiveGenre() {
  if (currentGenre === "all") return allMovies;
  return allMovies.filter(m => {
    if (!m.genre) return false;
    const genresArr = m.genre
      .split(/[,\/;]+/)
      .map(g => g.trim().toLowerCase());
    return genresArr.includes(currentGenre.trim().toLowerCase());
  });
}

// Configura los event listeners para los botones de filtro por género
function setupGenreFilters() {
  const genreButtons = document.querySelectorAll('[data-genre]');
  genreButtons.forEach(btn => {
    btn.addEventListener('click', ev => {
      currentGenre = ev.target.dataset.genre;
      genreButtons.forEach(b => b.classList.remove('active'));
      ev.target.classList.add('active');
      renderMovies(getMoviesByActiveGenre());
    });
  });
}

// Renderiza las películas en el DOM con efectos de transición suaves
function renderMovies(movies) {
  const container = document.getElementById('movie-list');
  container.classList.add('fade-out');
  setTimeout(() => {
    container.innerHTML = '';
    if (!movies.length) {
      container.innerHTML = '<p>No hay películas disponibles</p>';
    } else {
      movies.forEach(movie => {
        const card = document.createElement('article');
        card.className = 'movie-card';
        card.innerHTML = `
          <div class="movie-poster">
            <img src="${movie.poster_url}" alt="Póster de ${movie.title}" class="movie-poster-img"/>
          </div>
        `;
        const titleAndActions = document.createElement('div');
        titleAndActions.className = 'movie-title-under';
        titleAndActions.innerHTML = `
          <h3>${movie.title}</h3>
          <div class="movie-actions">
            <button class="edit-btn" data-id="${movie.id}">✏️ Editar</button>
            <button class="delete-btn" data-id="${movie.id}">🗑 Eliminar</button>
          </div>
        `;
        container.appendChild(card);
        container.appendChild(titleAndActions);
        setupMovieCardEvents(card, titleAndActions, movie);
      });
    }
    void container.offsetWidth;
    container.classList.remove('fade-out');
  }, 150);
}

// Añade los eventos de interacción a cada tarjeta de película
function setupMovieCardEvents(card, titleAndActions, movie) {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(138,43,226,0.6)';
    card.style.transform = 'translateY(-5px) scale(1.02)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    card.style.transform = 'translateY(0) scale(1)';
  });
  card.addEventListener('click', () => openMovieModal(movie));
  titleAndActions.querySelector('.edit-btn').addEventListener('click', e => {
    e.stopPropagation();
    openEditMovieModal(movie);
  });
  titleAndActions.querySelector('.delete-btn').addEventListener('click', e => {
    e.stopPropagation();
    openDeleteModal(movie);
  });
}

// Muestra el modal de detalle de la película
function openMovieModal(movie) {
  removeAllModals();
  showModalHTML(`
    <div class="modal-content">
      <div class="movie-poster">
        <img src="${movie.poster_url}" alt="Póster de ${movie.title}" class="movie-poster-img">
      </div>
      <div class="movie-info">
        <h2 class="modal-title">${movie.title}</h2>
        <div class="modal-basic-info">
          <div class="info-item"><span class="info-label">Director</span><div class="info-value">${movie.director || 'Desconocido'}</div></div>
          <div class="info-item"><span class="info-label">Año</span><div class="info-value">${movie.release_year || 'N/A'}</div></div>
          <div class="info-item"><span class="info-label">Género</span><div class="info-value">${movie.genre || 'N/A'}</div></div>
          <div class="info-item"><span class="info-label">Duración</span><div class="info-value">${movie.duration ? movie.duration + " min" : 'N/A'}</div></div>
          <div class="info-item"><span class="info-label">Puntuación</span><div class="info-value">${movie.rating ? movie.rating + '/10' : 'N/A'}</div></div>
          <div class="info-item"><span class="info-label">Idioma</span><div class="info-value">${movie.language || 'N/A'}</div></div>
          <div class="info-item"><span class="info-label">País</span><div class="info-value">${movie.country || 'N/A'}</div></div>
        </div>
        ${
          Array.isArray(movie.cast) && movie.cast.length 
            ? `<div class="modal-cast">
                <div class="cast-title">Reparto:</div>
                <div class="cast-list">
                  ${movie.cast.map(actor => `<span class="cast-member">${actor}</span>`).join('')}
                </div>
              </div>`
            : ''
        }
        <div class="modal-description">${movie.movie_description || ''}</div>
        ${movie.trailer_url ? `<a href="${movie.trailer_url}" target="_blank" rel="noopener" class="trailer-button">🎬 Ver tráiler</a>` : ''}
      </div>
    </div>
  `);
}

// Muestra el modal para editar una película existente
function openEditMovieModal(movie) {
  removeAllModals();
  showModalHTML(`
    <div class="modal-content">
      <div class="movie-poster">
        <img src="${movie.poster_url}" alt="Póster de ${movie.title}" class="movie-poster-img">
      </div>
      <div class="movie-info">
        <form id="edit-movie-form" autocomplete="off">
          <h2 class="modal-title">Editar: ${movie.title}</h2>
          <label><span class="info-label">Título</span>
            <input type="text" name="title" required value="${movie.title || ''}"/>
          </label>
          <label><span class="info-label">Director</span>
            <input type="text" name="director" value="${movie.director || ''}"/>
          </label>
          <label><span class="info-label">Año</span>
            <input type="number" name="release_year" value="${movie.release_year || ''}"/>
          </label>
          <label><span class="info-label">Género</span>
            <input type="text" name="genre" value="${movie.genre || ''}"/>
          </label>
          <label><span class="info-label">Descripción</span>
            <textarea name="movie_description">${movie.movie_description || ''}</textarea>
          </label>
          <!-- CAMPO PARA EL REPARTO -->
          <label><span class="info-label">Reparto (separa por comas)</span>
            <input type="text" name="cast" value="${Array.isArray(movie.cast) ? movie.cast.join(', ') : ''}" placeholder="Ej: Ana Torrent, Fele Martínez, Eduardo Noriega"/>
          </label>
          <label><span class="info-label">URL del póster</span>
            <input type="text" name="poster_url" value="${movie.poster_url || ''}"/>
          </label>
          <label><span class="info-label">URL del tráiler</span>
            <input type="text" name="trailer_url" value="${movie.trailer_url || ''}"/>
          </label>
          <div class="modal-actions-row">
            <button type="submit" class="save-btn-modal modal-action-btn">💾 Guardar cambios</button>
            <button type="button" class="delete-btn-modal modal-action-btn">🗑 Eliminar</button>
            <button type="button" class="cancel-edit-modal modal-action-btn">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `);

  document.getElementById('edit-movie-form').onsubmit = async function(ev) {
    ev.preventDefault();
    const form = ev.target;
    const updated = {
      title: form.title.value,
      director: form.director.value,
      release_year: form.release_year.value,
      genre: form.genre.value,
      movie_description: form.movie_description.value,
      poster_url: form.poster_url.value,
      trailer_url: form.trailer_url.value,
      // Nuevo: obtener cast como array de actores
      cast: form.cast.value
        ? form.cast.value.split(',').map(x => x.trim()).filter(Boolean)
        : []
    };
    try {
      await editMovie(movie.id, updated);
      updateMovieInArray(movie.id, updated);
      removeEditModal();
      updateMoviesView();
      console.log('Película modificada exitosamente:', updated.title);
    } catch (error) {
      console.error('Error al modificar la película:', error);
    }
  };
  document.querySelector('.delete-btn-modal').onclick = () => {
    removeEditModal();
    openDeleteModal(movie);
  };
  document.querySelector('.cancel-edit-modal').onclick = removeEditModal;
}

// Elimina una película (modal de confirmación)
function openDeleteModal(movie) {
  removeAllModals();
  showModalHTML(`
    <div class="modal-content">
      <div class="movie-poster">
        <img src="${movie.poster_url}" alt="Póster de ${movie.title}" class="movie-poster-img">
      </div>
      <div class="movie-info">
        <h2 class="modal-title">${movie.title}</h2>
        <div class="modal-description" style="color:#fc5c65;font-weight:500;">
          ¿Seguro que quieres eliminar esta película?<br>
          <em>No podrás deshacer esta acción.</em>
        </div>
        <div class="modal-actions-row">
          <button class="do-delete-btn modal-action-btn modal-delete-confirm">Sí, eliminar</button>
          <button class="cancel-del-modal modal-action-btn">Cancelar</button>
        </div>
      </div>
    </div>
  `);
  document.querySelector('.cancel-del-modal').onclick = removeAllModals;
  document.querySelector('.do-delete-btn').onclick = async () => {
    try {
      await deleteMovie(movie.id);
      removeMovieFromArray(movie.id);
      removeAllModals();
      updateMoviesView();
      console.log('Película eliminada exitosamente:', movie.title);
    } catch (error) {
      console.error('Error al eliminar la película:', error);
    }
  };
}

// Función para mostrar el modal (overlay) con contenido HTML
function showModalHTML(contentHTML) {
  removeAllModals();
  const overlay = document.createElement('div');
  overlay.className = 'movie-modal-overlay';
  overlay.innerHTML = `
    <div class="movie-modal">
      <button class="modal-close" title="Cerrar">&times;</button>
      ${contentHTML}
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);

  // Esquema para cerrar modales
  function closeModal() { overlay.remove(); }
  overlay.querySelector('.modal-close').onclick = closeModal;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function escListener(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escListener);
    }
  });
}

// Función para cerrar y remover todos los modales activos
function removeAllModals() {
  document.querySelectorAll('.movie-modal-overlay').forEach(m => m.remove());
}

// ========== FORMULARIO PARA NUEVA PELÍCULA ==========

if (toggleFormButton) {
  toggleFormButton.addEventListener('click', toggleMovieForm);
}

function toggleMovieForm() {
  movieForm.classList.toggle('show');
  toggleFormButton.textContent = movieForm.classList.contains('show')
    ? '❌ Cerrar formulario'
    : '➕ Añadir nueva película';
}

// ========= FUNCIONALIDADES VISUALES Y EFECTOS Y MOBILE =========

// Cambia el color del cielo
function changeSkyColor() {
  currentSkyIndex = (currentSkyIndex + 1) % skyColors.length;
  const newGradient = `linear-gradient(to bottom, ${skyColors[currentSkyIndex]}, #845ec2)`;
  if (backgroundScene) backgroundScene.style.background = newGradient;
}

// Botón de cielo
function createSkyToggleButton() {
  if (document.getElementById('sky-toggle-btn')) return;
  const skyToggleButton = document.createElement('button');
  skyToggleButton.textContent = '🎨 Cambiar cielo';
  skyToggleButton.id = 'sky-toggle-btn';
  skyToggleButton.type = 'button';
  skyToggleButton.addEventListener('click', changeSkyColor);
  const desc = document.getElementById('header-desc');
  if (desc && desc.parentNode) desc.parentNode.insertBefore(skyToggleButton, desc.nextSibling);
}

function addParallaxEffect() {
  const sun = document.getElementById('sun');
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    if (sun) sun.style.transform = `translateY(${scrolled * 0.5}px)`;
  });
}

function addSeagullHoverEffect() {
  document.querySelectorAll('.seagull').forEach(seagull => {
    seagull.addEventListener('mouseenter', () => {
      seagull.style.transform = 'scale(1.2)';
      seagull.style.filter = 'drop-shadow(0 0 15px rgba(255,255,255,0.8))';
    });
    seagull.addEventListener('mouseleave', () => {
      seagull.style.transform = 'scale(1)';
      seagull.style.filter = 'drop-shadow(0 0 8px rgba(255,255,255,0.3))';
    });
  });
}

function initializeApp() {
  createSkyToggleButton();
  addParallaxEffect();
  addSeagullHoverEffect();
  console.log('🎬 Cine de Verano inicializado correctamente');
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function applyMobileAdjustments() {
  if (isMobileDevice()) {
    document.querySelectorAll('.seagull').forEach(seagull => {
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
