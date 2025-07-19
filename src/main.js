// Importamos las funciones del servicio que manejan las operaciones CRUD de películas
import { getMovies, addMovie, editMovie, deleteMovie } from './services.js';

// Array con todas las películas y el filtro actual
let allMovies = [];
let currentGenre = "all";

// Referencias a nodos DOM que usamos a menudo
const movieForm = document.getElementById('movie-form');
const toggleFormButton = document.getElementById('toggle-form');
const backgroundScene = document.querySelector('.background-scene');

// Colores del fondo "cielo"
const skyColors = ['#ffa17f', '#ff758c', '#8559a5', '#5f0a87'];
let currentSkyIndex = 0;

// ---- INICIO DE LA APP ----
document.addEventListener('DOMContentLoaded', () => {
  displayMovies();                  // Carga y muestra las películas actuales
  setupGenreFilters();              // Configura los filtros por género
  initializeApp();                  // Efectos visuales (sky, gaviotas, etc)
  setTimeout(applyMobileAdjustments, 100); // Ajustes para móviles (delay)
});

// ---- FUNCIÓN PRINCIPAL: Cargar y mostrar todas ----
async function displayMovies() {
  try {
    allMovies = await getMovies();
    renderAllMovies();
  } catch (error) {
    console.error('Error al cargar las películas:', error);
  }
}

// ---- Renderizar todas las películas actuales del filtro ----
function renderAllMovies() {
  // Solo muestra las películas activas del filtro
  const movies = getMoviesByActiveGenre();
  const container = document.getElementById('movie-list');

  // Si nunca hubo tarjetas, simplemente se agregan
  if (!container.querySelector('.movie-card')) {
    movies.forEach(movie => addMovieCardToDOM(movie, container));
    if (movies.length === 0) container.innerHTML = '<p>No hay películas disponibles</p>';
    return;
  }

  // Si ya hay tarjetas, se sincroniza: solo cambia lo que ha cambiado
  const domIds = Array.from(container.querySelectorAll('.movie-card')).map(c => c.dataset.id);

  // ELIMINA las tarjetas que ya no existen en el array (con transición)
  domIds.forEach(id => {
    if (!movies.some(m => String(m.id) === id)) {
      const card = container.querySelector(`.movie-card[data-id="${id}"]`);
      const block = card.nextElementSibling; // .movie-title-under (acciones)
      card.classList.add('fade-out-movie');
      if (block) block.classList.add('fade-out-movie');
      setTimeout(() => {
        card.remove(); if (block) block.remove();
      }, 400);
    }
  });

  // AGREGA nuevas tarjetas no presentes (con transición)
  movies.forEach(movie => {
    if (!container.querySelector(`.movie-card[data-id="${movie.id}"]`)) {
      addMovieCardToDOM(movie, container, true);
    }
  });
}

// ---- Crea en el DOM una tarjeta de película y su bloque de acciones ----
function addMovieCardToDOM(movie, container = document.getElementById('movie-list'), useFade = false) {
  const card = document.createElement('article');
  card.className = 'movie-card';
  card.dataset.id = movie.id;
  if (useFade) card.classList.add('fade-in-movie');
  card.innerHTML = `
    <div class="movie-poster">
      <img src="${movie.poster_url}" alt="Póster de ${movie.title}" class="movie-poster-img"/>
    </div>
  `;
  // Bloque de título y acciones
  const titleAndActions = document.createElement('div');
  titleAndActions.className = 'movie-title-under';
  if (useFade) titleAndActions.classList.add('fade-in-movie');
  titleAndActions.innerHTML = `
    <h3>${movie.title}</h3>
    <div class="movie-actions">
      <button class="edit-btn" data-id="${movie.id}">✏️ Editar</button>
      <button class="delete-btn" data-id="${movie.id}">🗑 Eliminar</button>
    </div>
  `;
  // Añadir ambos bloques al DOM (al final)
  container.appendChild(card);
  container.appendChild(titleAndActions);
  setTimeout(() => {
    card.classList.remove('fade-in-movie');
    titleAndActions.classList.remove('fade-in-movie');
  }, 400);
  // Efectos y botones
  addCardEvents(card, titleAndActions, movie);
}

// ---- Altera solo esta tarjeta si se edita (transición local) ----
function updateMovieCardInDOM(movie) {
  // Busca la tarjeta y la actualiza in-place
  const card = document.querySelector(`.movie-card[data-id="${movie.id}"]`);
  if (card) {
    const img = card.querySelector('img.movie-poster-img');
    if (img) {
      img.src = movie.poster_url;
      img.alt = 'Póster de ' + movie.title;
    }
    const actions = card.nextElementSibling;
    if (actions && actions.classList.contains('movie-title-under')) {
      actions.querySelector('h3').textContent = movie.title;
    }
    // Efecto resaltado al editar
    card.classList.add('edit-glow');
    setTimeout(() => card.classList.remove('edit-glow'), 650);
  }
}

// ---- Añade listeners a una tarjeta concreta ----
function addCardEvents(card, titleAndActions, movie) {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(138,43,226,0.6)';
    card.style.transform = 'translateY(-5px) scale(1.02)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    card.style.transform = 'translateY(0) scale(1)';
  });
  card.addEventListener('click', () => openMovieModal(movie));
  // Botón editar
  titleAndActions.querySelector('.edit-btn').addEventListener('click', e => {
    e.stopPropagation();
    openEditMovieModal(movie);
  });
  // Botón eliminar
  titleAndActions.querySelector('.delete-btn').addEventListener('click', e => {
    e.stopPropagation();
    openDeleteModal(movie);
  });
}

// ------- FILTRO ACTIVO -------
function getMoviesByActiveGenre() {
  if (currentGenre === "all") return allMovies;
  return allMovies.filter(m => {
    if (!m.genre) return false;
    const genresArr = m.genre.split(/[,\/;]+/).map(g => g.trim().toLowerCase());
    return genresArr.includes(currentGenre.trim().toLowerCase());
  });
}

// ------- Detalle de película en modal, muestra reparto ------
function openMovieModal(movie) {
  removeAllModals();
  showModalHTML(`
    <div class="modal-content">
      <div class="movie-poster"><img src="${movie.poster_url}" alt="Póster de ${movie.title}" class="movie-poster-img"></div>
      <div class="movie-info">
        <h2 class="modal-title">${movie.title}</h2>
        <div class="modal-basic-info">
          <div class="info-item"><span class="info-label">Director</span><div class="info-value">${movie.director || 'Desconocido'}</div></div>
          <div class="info-item"><span class="info-label">Año</span><div class="info-value">${movie.release_year || 'N/A'}</div></div>
          <div class="info-item"><span class="info-label">Género</span><div class="info-value">${movie.genre || 'N/A'}</div></div>
        </div>
        <!-- Sección cast -->
        ${(Array.isArray(movie.cast) && movie.cast.length)
          ? `<div class="modal-cast"><div class="cast-title">Reparto:</div>
                <div class="cast-list">${movie.cast.map(actor => `<span class="cast-member">${actor}</span>`).join('')}</div>
             </div>` : ''}
        <div class="modal-description">${movie.movie_description || ''}</div>
        ${movie.trailer_url ? `<a href="${movie.trailer_url}" target="_blank" rel="noopener" class="trailer-button">🎬 Ver tráiler</a>` : ''}
      </div>
    </div>
  `);
}

// ------- MODAL DE EDICIÓN, con reparto/cast ------
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
          <!-- Nuevo campo -->
          <label><span class="info-label">Reparto (separa por comas)</span>
            <input type="text" name="cast" value="${Array.isArray(movie.cast) ? movie.cast.join(', ') : ''}" placeholder="Ej: Ana Torrent, Fele Martínez, Eduardo Noriega" />
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
      cast: form.cast.value ? form.cast.value.split(',').map(x => x.trim()).filter(Boolean) : [],
      poster_url: form.poster_url.value,
      trailer_url: form.trailer_url.value,
      movie_description: form.movie_description.value
    };
    try {
      await editMovie(movie.id, updated);
      updateMovieInArray(movie.id, updated);
      updateMovieCardInDOM({ ...movie, ...updated });
      removeEditModal();
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

// ---- Modal de confirmación ----
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
      // Elimina la tarjeta directamente con fade-out
      const card = document.querySelector(`.movie-card[data-id="${movie.id}"]`);
      const ta = card ? card.nextElementSibling : null;
      if (card) {
        card.classList.add('fade-out-movie');
        if (ta && ta.classList.contains('movie-title-under')) ta.classList.add('fade-out-movie');
        setTimeout(() => {
          if (ta) ta.remove();
          card.remove();
          removeAllModals();
        }, 400);
      } else {
        removeAllModals();
      }
    } catch (error) {
      console.error('Error al eliminar la película:', error);
    }
  };
}

// ------ Utilidad: muestra/modifica modal con overlay
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
  overlay.querySelector('.modal-close').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.addEventListener('keydown', function escListener(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escListener);
    }
  });
}
function removeEditModal() { removeAllModals(); }
function removeAllModals() {
  document.querySelectorAll('.movie-modal-overlay').forEach(m => m.remove());
}

// ========== FORMULARIO PARA NUEVA PELÍCULA ==========
// Botón mostrar/ocultar el formulario
if (toggleFormButton) {
  toggleFormButton.addEventListener('click', toggleMovieForm);
}
function toggleMovieForm() {
  movieForm.classList.toggle('show');
  toggleFormButton.textContent = movieForm.classList.contains('show')
    ? '❌ Cerrar formulario'
    : '➕ Añadir nueva película';
}
// Añadir nueva película desde el formulario principal (campo reparto incluído)
if (movieForm) {
  movieForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(movieForm);
    const movieData = {
      title: formData.get('title'),
      director: formData.get('director'),
      release_year: formData.get('release_year'),
      genre: formData.get('genre'),
      cast: formData.get('cast') ? formData.get('cast').split(',').map(x => x.trim()).filter(Boolean) : [],
      poster_url: formData.get('poster_url'),
      trailer_url: formData.get('trailer_url'),
      movie_description: formData.get('movie_description')
    };
    if (!movieData.title || !movieData.title.trim()) {
      console.warn('Error: Se requiere un título para la película');
      return;
    }
    try {
      const newMovie = await addMovie(movieData);
      addMovieToArray(newMovie || { ...movieData, id: Date.now() });
      addMovieCardToDOM(newMovie || { ...movieData, id: Date.now() });
      movieForm.reset();
      movieForm.classList.remove('show');
      toggleFormButton.textContent = '➕ Añadir nueva película';
    } catch (error) {
      console.error('Error al añadir la película:', error);
    }
  });
}

// ========== EFECTOS VISUALES Y SKY BUTTON Y MOBILE ==========
// (igual que antes)
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

/* 
======= AGREGA ESTO A TU CSS PARA SUAVIDAD =======
.movie-card, .movie-title-under {
  transition: opacity 0.4s, transform 0.4s;
}
.fade-in-movie {
  opacity: 0;
  transform: scale(1.10) translateY(30px);
  animation: fadeInMovie 0.38s cubic-bezier(.21,.77,.43,1.15) forwards;
}
@keyframes fadeInMovie {
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.fade-out-movie {
  opacity: 0 !important;
  transform: scale(0.97) translateY(35px) !important;
  pointer-events: none;
}
.edit-glow {
  box-shadow: 0 0 20px #09f99d, 0 2px 10px #fff;
  transition: box-shadow 0.5s;
}
*/
