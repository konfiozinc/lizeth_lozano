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
  /* KZ-QA-012 · la librería del QR se carga desde un CDN. Si ese CDN no llega (móvil con mala
     señal, bloqueador o caída del servicio), antes quedaba un recuadro blanco vacío y un error
     «QRCode is not defined» en consola. Ahora se comprueba y, si falta, se explica y se ofrece
     el enlace para copiar. */
  const qrBox = document.getElementById("qrcode");
  const urlTarjeta = window.location.href;
  function mostrarQrNoDisponible(caja) {
    caja.innerHTML = '<p style="font-size:10px;color:#0A1F44;max-width:160px;line-height:1.45;margin:6px;text-align:center;">No se pudo generar el código QR en este momento. Usa el botón «Copiar enlace» para compartir la tarjeta.</p>';
    caja.setAttribute('role', 'status');
  }
  if (qrBox) {
    if (typeof window.QRCode === 'function') {
      try {
        new QRCode(qrBox, {
          text: urlTarjeta,
          width: 130,
          height: 130,
          colorDark: "#0A1F44",
          colorLight: "#ffffff"
        });
        const imgQr = qrBox.querySelector("img");
        if (imgQr) {
          imgQr.alt = "Código QR de la tarjeta de Lizeth Lozano";
          imgQr.setAttribute("aria-label", imgQr.alt);
        }
      } catch (e) {
        mostrarQrNoDisponible(qrBox);
      }
    } else {
      mostrarQrNoDisponible(qrBox);
    }
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
  /* KZ-QA-012 · si el sistema tiene «compartir» pero falla por algo que no sea el usuario
     cancelando, antes no pasaba nada. Ahora se copia el enlace y se avisa. */
  document.getElementById('btn-share').addEventListener('click', async () => {
    const shareData = {
      title: 'Lizeth Lozano | Contadora Pública',
      text: 'Tu tranquilidad, mi compromiso. Conoce mis servicios contables y tributarios.',
      url: window.location.href
    };
    if (!navigator.share) { copiar(window.location.href); return; }
    try {
      await navigator.share(shareData);
    } catch (e) {
      /* AbortError = el usuario cerró el menú de compartir: no se hace nada más. */
      if (!e || e.name !== 'AbortError') copiar(window.location.href);
    }
  });

  /* Botón copiar enlace del modal QR */
  const btnCopiar = document.getElementById('btn-copiar');
  if (btnCopiar) btnCopiar.addEventListener('click', () => copiar(window.location.href));

  /* Guardar contacto: intentar abrir el editor de Contactos en Android.
     No descargar VCF, no abrir pestañas y no afirmar guardado automático. */
  const btnVcard = document.getElementById('btn-vcard');
  if (btnVcard) btnVcard.addEventListener('click', () => {
    const nombre = 'Lizeth Lozano';
    const telefono = '+573125580886';
    const correo = 'dlozanor@ucentral.edu.co';
    const android = /Android/i.test(navigator.userAgent);
    const chrome = /Chrome\/|CriOS\//i.test(navigator.userAgent);
    if (android && chrome) {
      /* Intent de Android ACTION_INSERT. La disponibilidad depende del navegador
         y de la app Contactos instalada. */
      const intent = 'intent:#Intent;action=android.intent.action.INSERT;' +
        'type=vnd.android.cursor.dir/contact;' +
        'S.name=' + encodeURIComponent(nombre) + ';' +
        'S.phone=' + encodeURIComponent(telefono) + ';' +
        'S.email=' + encodeURIComponent(correo) + ';end';
      window.location.href = intent;
      return;
    }

    /* En iOS y otros navegadores no existe API web universal para insertar
       un contacto directamente. Mostrar datos sin descargar archivos. */
    let panel = document.getElementById('contacto-alternativo');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'contacto-alternativo';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-label', 'Guardar contacto de Lizeth Lozano');
      panel.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000b;display:flex;align-items:center;justify-content:center;padding:18px';
      panel.innerHTML = '<div style="background:#fff;color:#13284c;border-radius:18px;padding:24px;max-width:360px;width:100%;font:16px system-ui">' +
        '<h2 style="margin:0 0 12px;font-size:21px">Contacto de Lizeth Lozano</h2>' +
        '<p>Tu navegador no permite abrir directamente el editor de contactos. Puedes copiar los datos y guardarlos en tu agenda.</p>' +
        '<p><strong>Teléfono:</strong> +57 312 558 0886</p>' +
        '<p><strong>Correo:</strong> dlozanor@ucentral.edu.co</p>' +
        '<button type="button" id="copiar-contacto" style="padding:12px;border:0;border-radius:9px;background:#d5a332;color:#111">Copiar datos</button> ' +
        '<button type="button" id="cerrar-contacto" style="padding:12px;border:1px solid #bbb;border-radius:9px;background:#fff;color:#111">Cerrar</button></div>';
      document.body.appendChild(panel);
      panel.querySelector('#cerrar-contacto').addEventListener('click', () => panel.remove());
      panel.querySelector('#copiar-contacto').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(nombre + '\\n' + telefono + '\\n' + correo);
          showToast('Datos copiados. Guárdalos desde Contactos.');
        } catch (_) { showToast('Copia el teléfono y correo mostrados.'); }
      });
    }
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
