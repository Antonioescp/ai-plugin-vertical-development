// Comportamiento de RF-NNN: validaciones y acciones simuladas, tal como las define ux.md.
// Usa proto.go(), proto.setState(), proto.delay() y proto.forceError (ver proto.js).

const form = document.getElementById('form-registro');

// Mensajes de error exactamente como aparecen en ux.md.
const validators = {
  nombre: (v) => (v.trim() ? '' : 'Escribe tu nombre.'),
  correo: (v) => {
    if (!v.trim()) return 'Escribe tu correo electrónico.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
    if (window.DATA.correosRegistrados.includes(v.trim().toLowerCase())) {
      return 'Ya existe una cuenta con este correo.';
    }
    return '';
  },
  clave: (v) => (v.length >= 8 ? '' : 'La contraseña debe tener al menos 8 caracteres.'),
};

function showFieldError(name, message) {
  const input = form.elements[name];
  input.closest('.field').classList.toggle('is-invalid', Boolean(message));
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  document.getElementById(`${name}-error`).textContent = message;
}

function validate() {
  let firstInvalid = null;
  for (const [name, check] of Object.entries(validators)) {
    const message = check(form.elements[name].value);
    showFieldError(name, message);
    if (message && !firstInvalid) firstInvalid = form.elements[name];
  }
  firstInvalid?.focus();
  return !firstInvalid;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!validate()) {
    proto.setState('error-validacion');
    return;
  }
  proto.setState('cargando');
  form.querySelectorAll('input, button').forEach((el) => { el.disabled = true; });
  await proto.delay();
  form.querySelectorAll('input, button').forEach((el) => { el.disabled = false; });

  if (proto.forceError) {
    proto.setState('error-sistema');
    return;
  }
  document.querySelectorAll('[data-bind="correo"]').forEach((el) => {
    el.textContent = form.elements.correo.value.trim();
  });
  proto.setState('inicial'); // al volver atrás, P1 no queda en "cargando"
  proto.go('P2', 'exito');
});

// Al abrir un estado directamente desde la barra de revisión, rellena datos de ejemplo
// para que el estado se vea como en el recorrido real.
// Si el estado viene del recorrido real (el formulario ya se validó), no toca nada.
document.addEventListener('proto:show', ({ detail }) => {
  if (detail.screen === 'P1' && detail.state === 'inicial') {
    Object.keys(validators).forEach((name) => showFieldError(name, ''));
  }
  if (detail.screen === 'P1' && detail.state === 'error-validacion' && !form.querySelector('.is-invalid')) {
    form.elements.correo.value = 'ana.perez@ejemplo';
    showFieldError('correo', validators.correo(form.elements.correo.value));
  }
  if (detail.screen === 'P2') {
    document.querySelectorAll('[data-bind="correo"]').forEach((el) => {
      el.textContent ||= 'nuevo.usuario@ejemplo.com';
    });
  }
});
