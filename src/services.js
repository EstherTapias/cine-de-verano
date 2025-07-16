// Función para obtener las películas desde el backend
export async function getMovies() {
    try {
      const response = await fetch('http://localhost:3001/movies');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const movies = await response.json();
      return movies; // Array con las películas
    } catch (error) {
      console.error('Error al obtener las películas:', error);
      return []; // Devuelve un array vacío si falla la petición
    }
  }