// Función para obtener las películas desde el backend
export async function getMovies() {
    try {
      const response = await fetch('http://localhost:3001/movies');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json(); // DEVUELVE EL ARRAY DIRECTO
    } catch (error) {
      console.error('Error al obtener las películas:', error);
      return [];
    }
}
