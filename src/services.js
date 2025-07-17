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

// Función para añadir una nueva película al backend (mediante POST)
export async function addMovie(movieData) {
    try {
        const response = await fetch('http://localhost:3001/movies', {
            method: 'POST', // Usamos POST para crear un nuevo recurso
            headers: {
                'Content-Type': 'application/json' // Indicamos que los datos van en formato JSON
            },
            body: JSON.stringify(movieData) // Convertimos el objeto JS a JSON antes de enviarlo
        });

        if (!response.ok) {
            throw new Error(`Error al añadir película: ${response.status}`);
        }

        return await response.json(); // Devuelve la película recién creada (con ID)
    } catch (error) {
        console.error('Error al hacer POST de película:', error);
        throw error; // Re-lanzamos el error para que quien llame sepa que falló
    }
}

// Elimina una película por ID
export async function deleteMovie(id) {
    try {
        const response = await fetch(`http://localhost:3001/movies/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Error al eliminar: ${response.status}`);
        }
    } catch (error) {
        console.error('Error al eliminar la película:', error);
        throw error;
    }
}

// Edita una película por ID (PUT)
export async function editMovie(id, updatedMovie) {
    try {
        const response = await fetch(`http://localhost:3001/movies/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedMovie)
        });

        if (!response.ok) {
            throw new Error(`Error al editar película: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al editar la película:', error);
        throw error;
    }
}
