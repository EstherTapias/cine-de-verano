// Función para obtener las películas desde el backend (el endpoint devuelve un array)
export async function getMovies() {
    try {
        const response = await fetch('http://localhost:3001/movies');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json(); // Devuelve el array directo (campos snake_case)
    } catch (error) {
        console.error('Error al obtener las películas:', error);
        return [];
    }
}
