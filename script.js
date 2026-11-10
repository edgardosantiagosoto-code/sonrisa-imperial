// =====================================================================
// Sonrisa Imperial · CONFIGURACIÓN
// Cambia aquí los datos reales. Todo el sitio (pie de página, botones
// de WhatsApp, correo y Calendly) se actualiza desde este bloque.
// =====================================================================
const CONFIG = {
  nombreClinica: 'Sonrisa Imperial',
  correo:        'inversiones.edsan@gmail.com',        // Correo que recibe las solicitudes
  whatsapp:      '56964583333',                        // Solo números, con código de país (56 = Chile), sin + ni espacios
  telefono:      '+56 2 2345 6789',                    // Teléfono fijo tal como se mostrará
  calendly:      'https://calendly.com/sonrisa-imperial/evaluacion', // Enlace a tu evento de Calendly
  direccion:     'Av. Ejemplo 1234, Providencia, Santiago',
  horario:       'Lun a Vie 9:00 – 19:00 · Sáb 9:00 – 13:00',

  // OPCIONAL · Envío automático por correo (sin que el paciente haga nada).
  // Crea un formulario gratis en https://formspree.io y pega aquí su URL,
  // por ejemplo 'https://formspree.io/f/abcdwxyz'. Déjalo vacío para no usarlo.
  formspreeEndpoint: ''
};
// =====================================================================

// ---------- Rellenar datos en la página ----------
const $ = (id) => document.getElementById(id);
const soloDigitos = (s) => s.replace(/\D/g, '');

document.querySelectorAll('[data-config]').forEach((el) => {
  const valor = CONFIG[el.dataset.config];
  if (valor) el.textContent = valor;
});

$('year').textContent = new Date().getFullYear();
$('f-tel').href      = 'tel:' + CONFIG.telefono.replace(/\s/g, '');
$('f-mail').href     = 'mailto:' + CONFIG.correo;
$('f-wa').href       = 'https://wa.me/' + soloDigitos(CONFIG.whatsapp);
$('f-wa').textContent = '+' + soloDigitos(CONFIG.whatsapp).replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '$1 $2 $3 $4');
$('header-calendly').href = CONFIG.calendly;

// La fecha mínima es hoy
$('fecha').min = new Date().toISOString().split('T')[0];

// ---------- Envío del formulario ----------
const form = $('booking');

function formatearFecha(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const d = Object.fromEntries(new FormData(form));
  const resumen =
    `Hola ${CONFIG.nombreClinica}, quiero agendar una cita.\n\n` +
    `Nombre: ${d.nombre}\n` +
    `Teléfono: ${d.telefono}\n` +
    `Correo: ${d.email}\n` +
    `Motivo: ${d.motivo}\n` +
    `Fecha preferida: ${formatearFecha(d.fecha)}\n` +
    `Horario: ${d.horario}`;

  // 1) WhatsApp con el mensaje ya escrito
  $('btn-wa').href = `https://wa.me/${soloDigitos(CONFIG.whatsapp)}?text=${encodeURIComponent(resumen)}`;

  // 2) Correo con asunto y cuerpo ya escritos
  $('btn-mail').href =
    `mailto:${CONFIG.correo}?subject=${encodeURIComponent('Solicitud de cita · ' + d.nombre)}` +
    `&body=${encodeURIComponent(resumen)}`;

  // 3) Calendly con nombre y correo precargados
  const cal = new URL(CONFIG.calendly);
  cal.searchParams.set('name', d.nombre);
  cal.searchParams.set('email', d.email);
  cal.searchParams.set('a1', `${d.motivo} · ${d.telefono}`);
  $('btn-cal').href = cal.toString();

  // Envío automático por correo (opcional, vía Formspree)
  if (CONFIG.formspreeEndpoint) {
    try {
      await fetch(CONFIG.formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ...d, _subject: 'Nueva solicitud de cita · ' + d.nombre })
      });
    } catch (err) {
      console.warn('No se pudo enviar el correo automático:', err);
    }
  }

  $('nombre-ok').textContent = d.nombre.split(' ')[0];
  form.style.display = 'none';
  $('success').style.display = 'block';
});

$('volver').addEventListener('click', () => {
  $('success').style.display = 'none';
  form.style.display = 'block';
});
