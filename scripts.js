/* ============================================================
   Lizeth Lozano · Contadora Pública · Tarjeta digital
   ============================================================ */
function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}
function cerrarTodos() {
  document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarTodos();
});

document.addEventListener('DOMContentLoaded', () => {
  /* QR dinámico */
  const qrBox = document.getElementById("qrcode");
  if (qrBox) {
    new QRCode(qrBox, {
      text: window.location.href,
      width: 130,
      height: 130,
      colorDark: "#0A1F44",
      colorLight: "#ffffff"
    });
  }

  const toast = document.getElementById('toast');
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  };

  const copiarFallback = (texto) => {
    const ta = document.createElement('textarea');
    ta.value = texto; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('Enlace copiado'); } catch (e) { showToast('Copia: ' + texto); }
    ta.remove();
  };
  const copiar = (texto) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(() => showToast('Enlace copiado al portapapeles'), () => copiarFallback(texto));
    } else {
      copiarFallback(texto);
    }
  };

  /* Compartir nativo con respaldo a copiar */
  document.getElementById('btn-share').addEventListener('click', async () => {
    const shareData = {
      title: 'Lizeth Lozano | Contadora Pública',
      text: 'Tu tranquilidad, mi compromiso. Conoce mis servicios contables y tributarios.',
      url: window.location.href
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else copiar(window.location.href);
    } catch (e) {}
  });

  /* Botón copiar enlace del modal QR */
  const btnCopiar = document.getElementById('btn-copiar');
  if (btnCopiar) btnCopiar.addEventListener('click', () => copiar(window.location.href));

  /* Guardar contacto (vCard) */
  document.getElementById('btn-vcard').addEventListener('click', () => {
    const vCardData = [
      "BEGIN:VCARD", "VERSION:3.0",
      "FN:Lizeth Lozano",
      "ORG:Lizeth Lozano Contadora Pública",
      "TITLE:Contadora Pública",
      "TEL;TYPE=CELL:+573125580886",
      "ADR:;;Colombia;;;;Colombia",
      "NOTE:Declaración de renta, planeación tributaria, RUT, certificados de ingresos, asesoría contable.",
      "END:VCARD"
    ].join("\r\n");
    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Lizeth_Lozano.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    showToast('Contacto guardado');
  });

  /* Carrusel de la galería */
  let currentSlide = 0;
  const slides = document.querySelectorAll('.carousel-item');
  if (slides.length > 0) {
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 2800);
  }

  /* Año del pie */
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();

  /* Service worker */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
});
