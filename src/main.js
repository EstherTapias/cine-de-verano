import { getMovies, addMovie, editMovie, deleteMovie } from './services.js';

// --------- Estado global de filtro -----------
let allMovies = [];
let currentGenre = "all";

const movieForm = document.getElementById('movie-form');
const toggleFormButton = document.getElementById('toggle-form');
const backgroundScene = document.querySelector('.background-scene');
const skyColors = ['#ffa17f', '#ff758c', '#8559a5', '#5f0a87'];
let currentSkyIndex = 0;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  displayMovies();
  setupGenreFilters();
  initializeApp();
  setTimeout(applyMobileAdjustments, 100);
});

// ========== MAIN LOAD Y FILTRO =============

async function displayMovies() {
  try {
    allMovies = await getMovies();
    renderMovies(getMoviesByActiveGenre());
  } catch (error) {
    showModalMessage('Error al cargar las películas. Inténtalo más tarde.', 'error');
  }
}

// Filtra películas donde CUALQUIERA de los géneros del campo coincida (case-insensitive, espacios limpios, varios separadores)
function getMoviesByActiveGenre() {
  if (currentGenre === "all") return allMovies;
  return allMovies.filter(m => {
    if (!m.genre) return false;
    // Dividir por "/", ",", ";" o cualquier combinación ("Drama, Thriller/Acción;Psicológico…")
    // Quita espacios y normaliza.
    const genresArr = m.genre
      .split(/[,\/;]+/) // divide por coma, barra, punto y coma
      .map(g => g.trim().toLowerCase());
    return genresArr.includes(currentGenre.trim().toLowerCase());
  });
}

// ========== FILTROS NAV ==========
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

// ========== GRID =============
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
  });
}

// ------- MODAL DETALLE ------
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
  `);
}

// ------- MODAL EDICIÓN -----
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
          <label><span class="info-label">URL del póster</span>
            <input type="text" name="poster_url" value="${movie.poster_url || ''}"/>
          </label>
          <label><span class="info-label">URL del tráiler</span>
            <input type="text" name="trailer_url" value="${movie.trailer_url || ''}"/>
          </label>
          <label><span class="info-label">Descripción</span>
            <textarea name="movie_description">${movie.movie_description || ''}</textarea>
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
      trailer_url: form.trailer_url.value
    };
    try {
      await editMovie(movie.id, updated);
      showModalMessage('Película modificada con éxito', 'success', () => displayMovies());
      removeEditModal();
    } catch {
      showModalMessage('No se ha podido modificar la película', 'error');
    }
  };
  document.querySelector('.delete-btn-modal').onclick = () => {
    removeEditModal();
    openDeleteModal(movie);
  };
  document.querySelector('.cancel-edit-modal').onclick = removeEditModal;
}
function removeEditModal() {
  removeAllModals();
}

// ------- MODAL ELIMINAR -----
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
      showModalMessage('Película eliminada con éxito', 'success', () => displayMovies());
      removeAllModals();
    } catch {
      showModalMessage('No se ha podido eliminar la película', 'error');
    }
  };
}

// ------- MODAL INFORMATIVO ---------
function showModalMessage(message, type = 'success', callback) {
  removeAllModals();
  showModalHTML(`
    <div class="modal-content" style="max-width:380px;">
      <div class="modal-description" style="background:rgba(255,255,255,0.13); box-shadow:0 2px 10px #ffcc7080; color:#fff; font-size:1.14rem; border-left:6px solid ${type==='error'?'#d7263d':'#4CAF50'}">
        ${message}
      </div>
    </div>
  `, callback);
}

function showModalHTML(contentHTML, callback) {
  removeAllModals();
  const overlay = document.createElement('div');
  overlay.className = 'movie-modal-overlay';
  overlay.innerHTML = `<div class="movie-modal"><button class="modal-close" title="Cerrar">&times;</button>${contentHTML}</div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  overlay.querySelector('.modal-close').onclick = () => {
    overlay.remove();
    if (typeof callback === 'function') callback();
  };
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (typeof callback === 'function') callback();
    }
  });
  document.addEventListener('keydown', function escListener(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      if (typeof callback === 'function') callback();
      document.removeEventListener('keydown', escListener);
    }
  });
}
function removeAllModals() {
  document.querySelectorAll('.movie-modal-overlay').forEach(m => m.remove());
}

// ========== FORMULARIO NUEVA PELI ==========
if (toggleFormButton) {
  toggleFormButton.addEventListener('click', toggleMovieForm);
}
function toggleMovieForm() {
  movieForm.classList.toggle('show');
  toggleFormButton.textContent = movieForm.classList.contains('show') ? '❌ Cerrar formulario' : '➕ Añadir nueva película';
}
if (movieForm) {
  movieForm.addEventListener('submit', async function(event) {
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
      showModalMessage('Por favor, ingresa un título para la película', 'error');
      return;
    }
    try {
      await addMovie(movieData);
      movieForm.reset();
      movieForm.classList.remove('show');
      toggleFormButton.textContent = '➕ Añadir nueva película';
      showModalMessage('¡Película añadida correctamente!', 'success', () => displayMovies());
    } catch (error) {
      showModalMessage('Error al añadir la película. Inténtalo de nuevo.', 'error');
    }
  });
}

// ========== INTERFAZ Y EFECTOS EXTRA ==========
function changeSkyColor() {
  currentSkyIndex = (currentSkyIndex + 1) % skyColors.length;
  const newGradient = `linear-gradient(to bottom, ${skyColors[currentSkyIndex]}, #845ec2)`;
  if (backgroundScene) backgroundScene.style.background = newGradient;
}
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
