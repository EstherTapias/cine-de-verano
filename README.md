# 🎬 Cine de Verano

Bienvenid@ a **Cine de Verano**, una app web interactiva pensada para recomendar películas perfectas para una noche de verano 🌅🎞️. Puedes consultar películas disponibles, añadir nuevas, editar tus favoritas o eliminar las que ya no quieras ver. ¡Tu cine al aire libre, a un clic de distancia!

---

## 🧠 ¿De qué trata este proyecto?

> Este proyecto surge como parte del bootcamp **Fullstack + DevOps** . La idea es ofrecer una experiencia veraniega con una interfaz llamativa inspirada en los atardeceres de la playa y el estilo **neón retro**. 💿🌴🌇

🧩 Funcionalidades principales:

- 🔍 Ver cartelera actual  
- ➕ Añadir nuevas películas  
- 📝 Editar información existente  
- ❌ Eliminar películas  
- 🖼️ Diseño responsive  
- 🎨 Estética inspirada en un cine de verano junto al mar

---

## 🛠️ Tecnologías usadas

| Herramienta     | Uso                                       |
|------------------|--------------------------------------------|
| `HTML5`         | Estructura de la app                       |
| `CSS3`          | Estilos, animaciones y diseño responsive   |
| `JavaScript`    | Lógica de interacción                      |
| [`json-server`](https://github.com/typicode/json-server) | API fake local para gestionar las películas |

---

## 🚀 ¿Cómo ejecutarlo en local?

### 1. 🔽 Clona el repositorio

```bash
git clone https://github.com/tu-usuario/cine-de-verano.git
cd cine-de-verano
```

### 2. 📦 Instala las dependencias
```bash
npm install
```
### 3. 🧪 Ejecuta el servidor de la API falsa
```bash
npm run api-fake
```
Esto ejecutará json-server y dejará disponible la API en:
📍 http://localhost:3001/peliculas
### 4. 🌐 Abre el proyecto
Abre el archivo index.html con tu navegador favorito o usa la extensión Live Server de VSCode.
```bash
📁 Estructura del proyecto
cine-de-verano/
├── server/
│   └── db.json                # Base de datos falsa para json-server
│
├── src/
│   ├── index.html             # Entrada principal de la app
│   ├── style.css              # Estilos y diseño visual
│   ├── main.js                # Lógica de la interfaz
│   └── services.js            # Funciones de comunicación con la API
│
├── .gitignore                 # Archivos/Carpetas a ignorar por Git
├── package.json               # Dependencias y scripts del proyecto
├── package-lock.json          # Versiones exactas instaladas
└── README.md                  # Documentación del proyecto (este archivo)

```
## 💡 Notas importantes
El proyecto no usa frameworks como React ni librerías de testing.

La persistencia de datos se simula con json-server, por lo que los cambios se guardan mientras el servidor esté activo.

Está optimizado para navegadores modernos y dispositivos móviles 📱.

## 🧑‍💻 Autora y equipo
Proyecto desarrollado por Esther Tapias, como parte del módulo de desarrollo web.

📬 Contacto: [EstherTapias](https://github.com/EstherTapias)

🌟 ¡Gracias por pasarte por nuestro cine bajo las estrellas!
“La vida es como una película: lo importante no es lo larga que sea, sino lo bien que se disfrute.” – 🎥