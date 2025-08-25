// ========== VALIDACIONES PERSONALIZADAS CON EXPRESIONES REGULARES ==========

// Expresiones regulares para validar diferentes campos
const REGEX_PATTERNS = {
    // Título: solo letras, números, espacios y algunos símbolos comunes
    title: /^[a-zA-ZÀ-ÿ0-9\s\-\.\:\!\?\,\'\"]{2,100}$/,
    
    // Director: solo letras, espacios, puntos y guiones (nombres de personas)
    director: /^[a-zA-ZÀ-ÿ\s\.\-]{2,50}$/,
    
    // Año: 4 dígitos, desde 1900 hasta año actual + 5 años (para próximos estrenos)
    year: /^(19[0-9]{2}|20[0-9]{2}|203[0-9])$/,
    
    // Género: letras, espacios, comas, barras y guiones para múltiples géneros
    genre: /^[a-zA-ZÀ-ÿ\s\,\/\-]{2,100}$/,
    
    // URL: formato básico de URL válida
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    
    // Cast: nombres separados por comas (similar a director pero permite comas)
    cast: /^[a-zA-ZÀ-ÿ\s\.\-\,]{0,500}$/
  };
  
  // Mensajes de error personalizados
  const ERROR_MESSAGES = {
    title: 'El título debe tener entre 2-100 caracteres y solo contener letras, números y símbolos básicos',
    director: 'El director debe tener entre 2-50 caracteres y solo contener letras, espacios, puntos y guiones',
    year: 'El año debe ser válido (entre 1900 y 2039)',
    genre: 'El género debe tener entre 2-100 caracteres y solo contener letras, espacios, comas, barras y guiones',
    url: 'Debe ser una URL válida que comience con http:// o https://',
    cast: 'El reparto solo puede contener nombres separados por comas (máximo 500 caracteres)',
    required: 'Este campo es obligatorio'
  };
  
  // Función principal para validar un campo específico
  function validateField(fieldName, value, isRequired = false) {
    // Si el campo está vacío
    if (!value || !value.trim()) {
      return isRequired ? { isValid: false, message: ERROR_MESSAGES.required } : { isValid: true };
    }
    
    // Si no existe patrón para este campo, es válido por defecto
    if (!REGEX_PATTERNS[fieldName]) {
      return { isValid: true };
    }
    
    // Validar con la expresión regular
    const isValid = REGEX_PATTERNS[fieldName].test(value.trim());
    
    return {
      isValid,
      message: isValid ? '' : ERROR_MESSAGES[fieldName]
    };
  }
  
  // Función para validar año específicamente (con lógica adicional)
  function validateYear(year) {
    if (!year) return { isValid: true }; // Opcional
    
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    
    if (isNaN(yearNum)) {
      return { isValid: false, message: 'El año debe ser un número válido' };
    }
    
    if (yearNum < 1900) {
      return { isValid: false, message: 'El año no puede ser anterior a 1900' };
    }
    
    if (yearNum > currentYear + 5) {
      return { isValid: false, message: `El año no puede ser posterior a ${currentYear + 5}` };
    }
    
    return { isValid: true };
  }
  
  // Función para validar URL específicamente
  function validateURL(url, fieldName) {
    if (!url || !url.trim()) return { isValid: true }; // URLs son opcionales
    
    const validation = validateField('url', url);
    if (!validation.isValid) {
      return { isValid: false, message: `${fieldName}: ${ERROR_MESSAGES.url}` };
    }
    
    return { isValid: true };
  }
  
  // Función para mostrar/ocultar mensajes de error en el DOM
  function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    // Remover error anterior si existe
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Si hay mensaje de error, crear y mostrar
    if (message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.textContent = message;
      errorDiv.style.color = '#e74c3c';
      errorDiv.style.fontSize = '0.85rem';
      errorDiv.style.marginTop = '0.25rem';
      
      field.parentNode.appendChild(errorDiv);
      field.style.borderColor = '#e74c3c';
    } else {
      // Si no hay error, restaurar estilo normal
      field.style.borderColor = '';
    }
  }
  
  // Función para limpiar todos los errores de un formulario
  function clearFormErrors(formElement) {
    const errorElements = formElement.querySelectorAll('.field-error');
    errorElements.forEach(error => error.remove());
    
    const fields = formElement.querySelectorAll('input, textarea');
    fields.forEach(field => field.style.borderColor = '');
  }
  
  // Función principal para validar todo el formulario
  function validateMovieForm(formData, isEditing = false) {
    const errors = {};
    let isValid = true;
    
    // Validar título (obligatorio)
    const titleValidation = validateField('title', formData.get('title'), true);
    if (!titleValidation.isValid) {
      errors.title = titleValidation.message;
      isValid = false;
    }
    
    // Validar director (opcional pero con formato)
    const directorValidation = validateField('director', formData.get('director'));
    if (!directorValidation.isValid) {
      errors.director = directorValidation.message;
      isValid = false;
    }
    
    // Validar año (opcional pero con lógica especial)
    const yearValidation = validateYear(formData.get('release_year'));
    if (!yearValidation.isValid) {
      errors.release_year = yearValidation.message;
      isValid = false;
    }
    
    // Validar género (opcional pero con formato)
    const genreValidation = validateField('genre', formData.get('genre'));
    if (!genreValidation.isValid) {
      errors.genre = genreValidation.message;
      isValid = false;
    }
    
    // Validar cast (opcional pero con formato)
    const castValidation = validateField('cast', formData.get('cast'));
    if (!castValidation.isValid) {
      errors.cast = castValidation.message;
      isValid = false;
    }
    
    // Validar URLs (opcionales pero con formato correcto)
    const posterUrlValidation = validateURL(formData.get('poster_url'), 'URL del póster');
    if (!posterUrlValidation.isValid) {
      errors.poster_url = posterUrlValidation.message;
      isValid = false;
    }
    
    const trailerUrlValidation = validateURL(formData.get('trailer_url'), 'URL del tráiler');
    if (!trailerUrlValidation.isValid) {
      errors.trailer_url = trailerUrlValidation.message;
      isValid = false;
    }
    
    return { isValid, errors };
  }
  
  // Función para añadir validación en tiempo real a un campo
  function addRealTimeValidation(fieldName, isRequired = false) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    // Validación al salir del campo (blur)
    field.addEventListener('blur', function() {
      let validation;
      
      if (fieldName === 'release_year') {
        validation = validateYear(this.value);
      } else if (fieldName === 'poster_url' || fieldName === 'trailer_url') {
        validation = validateURL(this.value, fieldName);
      } else {
        validation = validateField(fieldName, this.value, isRequired);
      }
      
      showFieldError(fieldName, validation.isValid ? '' : validation.message);
    });
    
    // Limpiar error al escribir (input)
    field.addEventListener('input', function() {
      if (this.style.borderColor === 'rgb(231, 76, 60)') { // Si tiene error
        showFieldError(fieldName, ''); // Limpiar error
      }
    });
  }
  
  // ========== INTEGRACIÓN CON TUS FORMULARIOS EXISTENTES ==========
  
  // Función para inicializar validaciones en tiempo real
  function initializeFormValidations() {
    // Campos con validación en tiempo real
    addRealTimeValidation('title', true);  // Título es obligatorio
    addRealTimeValidation('director');
    addRealTimeValidation('release_year');
    addRealTimeValidation('genre');
    addRealTimeValidation('cast');
    addRealTimeValidation('poster_url');
    addRealTimeValidation('trailer_url');
    
    console.log('✅ Validaciones en tiempo real inicializadas');
  }
  
  // Ejemplo de uso en el submit del formulario principal
  function handleFormSubmitWithValidation(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Limpiar errores anteriores
    clearFormErrors(form);
    
    // Validar formulario
    const validation = validateMovieForm(formData);
    
    if (!validation.isValid) {
      // Mostrar errores
      Object.keys(validation.errors).forEach(fieldName => {
        showFieldError(fieldName, validation.errors[fieldName]);
      });
      
      console.warn('❌ Formulario contiene errores:', validation.errors);
      return false; // No enviar formulario
    }
    
    console.log('✅ Formulario válido, procediendo con el envío...');
    return true; // Continuar con el envío
  }
  
  // Exportar funciones para usar en main.js
  window.MovieValidations = {
    validateMovieForm,
    clearFormErrors,
    showFieldError,
    initializeFormValidations,
    handleFormSubmitWithValidation
  };