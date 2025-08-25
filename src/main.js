// Importamos las funciones del servicio que manejan las operaciones CRUD de películas
import { getMovies, addMovie, editMovie, deleteMovie } from './services.js';

// Variables globales para el estado de la aplicación
let allMovies = [];                // Array que contiene todas las películas en memoria
let currentGenre = "all";          // Género actualmente seleccionado para filtrar

// Referencias a elementos del DOM usados frecuentemente
const movieForm = document.getElementById('movie-form');              // Formulario para añadir película
const toggleFormButton = document.getElementById('toggle-form');      // Botón para mostrar/ocultar formulario
const backgroundScene = document.querySelector('.background-scene');  // Elemento del fondo animado

// Colores para el cambio cíclico de fondo (cielo)
const skyColors = ['#ffa17f', '#ff758c', '#8559a5', '#5f0a87'];
let currentSkyIndex = 0;           // Índice actual del color del cielo

// Esperamos a que el DOM esté completamente cargado antes de inicializar la app
document.addEventListener('DOMContentLoaded', () => {
  displayMovies();         // Carga y muestra las películas al iniciar
  setupGenreFilters();     // Prepara filtros por género
  initializeApp();         // Inicializa efectos visuales
  setTimeout(applyMobileAdjustments, 100);   // Ajustes móviles tras pequeño delay
});

// Función para obtener y mostrar las películas
async function displayMovies() {
  try {
    allMovies = await getMovies();                       // Obtener todas las películas
    renderMovies(getMoviesByActiveGenre());              // Renderizar con filtro de género activo
  } catch (error) {
    console.error('Error al cargar las películas:', error);
  }
}

// Refresca sólo la vista según filtro sin recargar toda la data
function updateMoviesView() {
  renderMovies(getMoviesByActiveGenre());
}

// Filtra las películas según género seleccionado
function getMoviesByActiveGenre() {
  if (currentGenre === "all") return allMovies;         // Si filtro es "all" devuelve todas
  return allMovies.filter(m => {
    if (!m.genre) return false;                          // Excluye películas sin género
    const genresArr = m.genre
      .split(/[,\/;]+/)                                // Divide por comas, barras, punto y coma
      .map(g => g.trim().toLowerCase());               // Limpia espacios y pasa a minúscula
    return genresArr.includes(currentGenre.trim().toLowerCase());
  });
}

// Configura botones filtros por género con eventos
function setupGenreFilters() {
  const genreButtons = document.querySelectorAll('[data-genre]');
  genreButtons.forEach(btn => {
    btn.addEventListener('click', ev => {
      currentGenre = ev.target.dataset.genre;          // Actualiza el género activo
      genreButtons.forEach(b => b.classList.remove('active'));  // Quita activo a todos
      ev.target.classList.add('active');                // Activa el seleccionado
      renderMovies(getMoviesByActiveGenre());           // Re-renderizar películas filtradas
    });
  });
}

// Renderiza películas en DOM con transición suave de fade-out
function renderMovies(movies) {
  const container = document.getElementById('movie-list');
  container.classList.add('fade-out');                   // Clase para transición de salida

  setTimeout(() => {
    container.innerHTML = '';                             // Limpia películas antiguas
    if (!movies.length) {
      container.innerHTML = '<p>No hay películas disponibles</p>';  // Mensaje si no hay
      container.classList.remove('fade-out');
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

      // Contenedor bajo con título y botones de acción
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

      // Hover sobre tarjeta: sombra y pequeño salto
      card.addEventListener('mouseenter', () => {
        card.style.boxShadow = '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(138,43,226,0.6)';
        card.style.transform = 'translateY(-5px) scale(1.02)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        card.style.transform = 'translateY(0) scale(1)';
      });
      // Click en tarjeta abre modal detalle
      card.addEventListener('click', () => openMovieModal(movie));
      // Botón editar abre modal edición
      titleAndActions.querySelector('.edit-btn')
        .addEventListener('click', e => { e.stopPropagation(); openEditMovieModal(movie); });
      // Botón eliminar abre modal confirmación borrado
      titleAndActions.querySelector('.delete-btn')
        .addEventListener('click', e => { e.stopPropagation(); openDeleteModal(movie); });
    });
    void container.offsetWidth;             // Forzar reflow para restart transiciones
    container.classList.remove('fade-out'); // Quitar clase fade-out para fade-in
  }, 150);
}

// Actualiza película en todasMovies tras edición
function updateMovieInArray(movieId, updatedData) {
  const index = allMovies.findIndex(m => m.id === movieId);
  if (index !== -1) allMovies[index] = { ...allMovies[index], ...updatedData };
}

// Elimina película en allMovies tras borrado
function removeMovieFromArray(movieId) {
  allMovies = allMovies.filter(m => m.id !== movieId);
}

// Añade nueva película al array global
function addMovieToArray(newMovie) {
  allMovies.push(newMovie);
}

// Modal detalle: muestra película con reparto "cast" listado
function openMovieModal(movie) {
  removeAllModals(); // Cierra modales abiertos
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
        </div>
        ${movie.cast && movie.cast.length ? `
          <div class="modal-cast">
            <div class="cast-title">Reparto:</div>
            <div class="cast-list">
              ${movie.cast.map(actor => `<span class="cast-member">${actor}</span>`).join('')}
            </div>
          </div>` : ''}
        <div class="modal-description">${movie.movie_description || ''}</div>
        ${movie.trailer_url ? `<a href="${movie.trailer_url}" target="_blank" rel="noopener" class="trailer-button">🎬 Ver tráiler</a>` : ''}
      </div>
    </div>
  `);
}

// Modal edición con campo cast para modificar reparto
function openEditMovieModal(movie) {
  removeAllModals(); // Cierra modales
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

  // Evento submit edición
  document.getElementById('edit-movie-form').onsubmit = async function(ev) {
    ev.preventDefault();
    const form = ev.target;
    const updated = {
      title: form.title.value,
      director: form.director.value,
      release_year: form.release_year.value,
      genre: form.genre.value,
      // Parseamos el reparto separando por coma y limpiando espacios
      cast: form.cast.value ? form.cast.value.split(',').map(x => x.trim()).filter(Boolean) : [],
      poster_url: form.poster_url.value,
      trailer_url: form.trailer_url.value,
      movie_description: form.movie_description.value
    };
    try {
      await editMovie(movie.id, updated);
      updateMovieInArray(movie.id, updated); // Actualiza localmente
      removeEditModal(); // Cierra modal
      updateMoviesView(); // Refresca lista en pantalla
      console.log('Película modificada exitosamente:', updated.title);
    } catch (error) {
      console.error('Error al modificar la película:', error);
    }
  };

  // Botón eliminar en modal edición
  document.querySelector('.delete-btn-modal').onclick = () => {
    removeEditModal();
    openDeleteModal(movie);
  };

  // Botón cancelar en modal edición
  document.querySelector('.cancel-edit-modal').onclick = removeEditModal;
}

// Modal confirmación eliminar
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

// Muestra modal personalizado con overlay
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
  
  // Cerrar modal con botón X
  overlay.querySelector('.modal-close').onclick = () => overlay.remove();
  
  // Cerrar modal haciendo click fuera del cuadro
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.remove();
  });
  
  // Cerrar modal con ESC
  document.addEventListener('keydown', function escListener(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escListener);
    }
  });
}

// Cierra modales abiertos
function removeEditModal() {
  removeAllModals();
}
function removeAllModals() {
  document.querySelectorAll('.movie-modal-overlay').forEach(m => m.remove());
}

// Botón mostrar/ocultar formulario nueva película
if (toggleFormButton) {
  toggleFormButton.addEventListener('click', toggleMovieForm);
}

// Alterna formulario principal
function toggleMovieForm() {
  movieForm.classList.toggle('show');
  toggleFormButton.textContent = movieForm.classList.contains('show')
    ? '❌ Cerrar formulario'
    : '➕ Añadir nueva película';
}

// AQUÍ ESTÁ EL FIX PRINCIPAL: Evento submit formulario nueva película con reparto
if (movieForm) {
  movieForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(movieForm);
    const movieData = {
      title: formData.get('title'),
      director: formData.get('director'),
      release_year: formData.get('release_year'),
      genre: formData.get('genre'),
      // Cast se pasa de string a array limpiando espacios
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
      // FIX: Solo llamamos a addMovie y esperamos su resultado
      const newMovie = await addMovie(movieData);
      
      // Solo si la petición fue exitosa, añadimos al array local
      if (newMovie) {
        addMovieToArray(newMovie);
        movieForm.reset();
        movieForm.classList.remove('show');
        toggleFormButton.textContent = '➕ Añadir nueva película';
        updateMoviesView();
        console.log('Película añadida exitosamente:', newMovie.title);
      }
    } catch (error) {
      console.error('Error al añadir la película:', error);
      // Opcional: mostrar mensaje de error al usuario
      alert('Error al guardar la película. Por favor, inténtalo de nuevo.');
    }
  });
}

// ========== FUNCIONALIDADES VISUALES Y EFECTOS ==========

// Cambia el color de fondo del cielo de manera cíclica
function changeSkyColor() {
  // Avanzamos al siguiente color en el array de manera circular
  currentSkyIndex = (currentSkyIndex + 1) % skyColors.length;
  
  // Creamos el nuevo gradiente con el color seleccionado
  const newGradient = `linear-gradient(to bottom, ${skyColors[currentSkyIndex]}, #845ec2)`;
  
  // Aplicamos el nuevo gradiente al fondo si el elemento existe
  if (backgroundScene) backgroundScene.style.background = newGradient;
}

// Crea el botón para cambiar el color del cielo
function createSkyToggleButton() {
  // Verificamos que no exista ya el botón para evitar duplicados
  if (document.getElementById('sky-toggle-btn')) return;
  
  // Creamos el elemento button
  const skyToggleButton = document.createElement('button');
  skyToggleButton.textContent = '🎨 Cambiar cielo';
  skyToggleButton.id = 'sky-toggle-btn';
  skyToggleButton.type = 'button';
  
  // Agregamos el event listener para cambiar el color
  skyToggleButton.addEventListener('click', changeSkyColor);
  
  // Insertamos el botón en el DOM después de la descripción del header
  const desc = document.getElementById('header-desc');
  if (desc && desc.parentNode) desc.parentNode.insertBefore(skyToggleButton, desc.nextSibling);
}

// Añade efecto parallax al sol basado en el scroll
function addParallaxEffect() {
  const sun = document.getElementById('sun');
  
  // Event listener para el scroll de la ventana
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset; // Cantidad de scroll vertical
    
    // Movemos el sol más lentamente que el scroll (efecto parallax)
    if (sun) sun.style.transform = `translateY(${scrolled * 0.5}px)`;
  });
}

// Añade efectos hover a las gaviotas
function addSeagullHoverEffect() {
  // Aplicamos el efecto a todas las gaviotas
  document.querySelectorAll('.seagull').forEach(seagull => {
    // Efecto al pasar el mouse por encima
    seagull.addEventListener('mouseenter', () => {
      seagull.style.transform = 'scale(1.2)'; // Aumentamos el tamaño
      seagull.style.filter = 'drop-shadow(0 0 15px rgba(255,255,255,0.8))'; // Añadimos brillo
    });
    
    // Efecto al quitar el mouse
    seagull.addEventListener('mouseleave', () => {
      seagull.style.transform = 'scale(1)'; // Volvemos al tamaño normal
      seagull.style.filter = 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'; // Brillo normal
    });
  });
}

// Inicializa todas las funcionalidades de la aplicación
function initializeApp() {
  createSkyToggleButton(); // Crea el botón para cambiar el cielo
  addParallaxEffect(); // Añade efecto parallax al sol
  addSeagullHoverEffect(); // Añade efectos hover a las gaviotas
  
  // Mensaje en consola para confirmar que la app se inicializó correctamente
  console.log('🎬 Cine de Verano inicializado correctamente');
}

// Detecta si el dispositivo es móvil usando el user agent
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Aplica ajustes específicos para dispositivos móviles
function applyMobileAdjustments() {
  if (isMobileDevice()) {
    // Ralentizamos la animación de las gaviotas en móviles para mejor rendimiento
    document.querySelectorAll('.seagull').forEach(seagull => {
      seagull.style.animationDuration = '20s';
    });
    
    // Ajustamos el tamaño del botón de cambio de cielo para móviles
    const skyButton = document.getElementById('sky-toggle-btn');
    if (skyButton) {
      skyButton.style.fontSize = '0.8rem';
      skyButton.style.padding = '0.4rem 0.8rem';
    }
    
    console.log('Ajustes para móviles aplicados');
  }
}