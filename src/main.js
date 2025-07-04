// Mostrar / ocultar el formulario
const toggleBtn = document.getElementById('toggle-form');
const form = document.getElementById('movie-form');

toggleBtn.addEventListener('click', () => {
  form.classList.toggle('show');
});

// 🎨 Cambiar el color del cielo dinámicamente al pulsar un botón
const sky = document.querySelector('.background-scene');
const skyColors = ['#ffa17f', '#ff758c', '#8559a5', '#5f0a87'];
let skyIndex = 0;

// Crear botón para cambiar el cielo dinámicamente
const toggleSkyBtn = document.createElement('button');
toggleSkyBtn.textContent = "🎨 Cambiar cielo";
toggleSkyBtn.style.position = "fixed";
toggleSkyBtn.style.top = "10px";
toggleSkyBtn.style.right = "10px";
toggleSkyBtn.style.zIndex = "20";
toggleSkyBtn.style.padding = "0.5rem 1rem";
toggleSkyBtn.style.borderRadius = "10px";
toggleSkyBtn.style.border = "none";
toggleSkyBtn.style.fontFamily = "Orbitron";
toggleSkyBtn.style.background = "#fff";
toggleSkyBtn.style.color = "#333";
toggleSkyBtn.style.cursor = "pointer";
document.body.appendChild(toggleSkyBtn);

toggleSkyBtn.addEventListener('click', () => {
  skyIndex = (skyIndex + 1) % skyColors.length;
  sky.style.background = `linear-gradient(to bottom, ${skyColors[skyIndex]}, #845ec2)`;
});
