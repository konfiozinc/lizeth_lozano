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

  /* Guardar contacto (vCard) */
  /* KZ-QA-012 · el campo ADR estaba mal armado («ADR:;;Colombia;;;;Colombia» ponía «Colombia» como
     calle Y como país). Se corrigió y se completaron correo y ciudad.
     KZ-QA-015 · el archivo se descargaba bien pero el teléfono lo abría como texto porque la línea
     NOTE pasaba de 75 octetos SIN plegar: eso incumple RFC 2425/2426 y los parsers estrictos
     rechazan el archivo entero. Ahora:
       · todas las líneas se pliegan a 75 octetos, con continuación empezando por un espacio;
       · las propiedades de texto declaran CHARSET=UTF-8 (así los acentos se leen bien en Android
         antiguo, sin necesidad de BOM);
       · NO se pone BOM: el estándar dice que el archivo empieza en BEGIN:VCARD, y un BOM delante
         hace que los parsers estrictos no reconozcan esa primera línea;
       · se añaden PRODID y REV (el REV evita que el teléfono duplique el contacto al reimportarlo);
       · los saltos de línea son CRLF, como exige la norma. */
  const plegarVcard = (linea) => {
    const codificador = new TextEncoder();
    const partes = [];
    let actual = "";
    let octetos = 0;
    for (const caracter of linea) {
      const bytes = codificador.encode(caracter).length;
      if (octetos + bytes > 75) {
        partes.push(actual);
        actual = " " + caracter;
        octetos = 1 + bytes;
      } else {
        actual += caracter;
        octetos += bytes;
      }
    }
    partes.push(actual);
    return partes.join("\r\n");
  };

  document.getElementById('btn-vcard').addEventListener('click', () => {
    /* URL canónica de la tarjeta (no la de la barra de direcciones), para que el contacto no
       guarde un enlace con parámetros. */
    const canonica = (document.querySelector('link[rel="canonical"]') || {}).href || window.location.href;
    const sello = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const propiedades = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "PRODID:-//KONFIO ZINC//Tarjeta digital//ES",
      "N;CHARSET=UTF-8:Lozano;Lizeth;;;",
      "FN;CHARSET=UTF-8:Lizeth Lozano",
      "ORG;CHARSET=UTF-8:Lizeth Lozano Contadora Pública",
      "TITLE;CHARSET=UTF-8:Contadora Pública",
      "TEL;TYPE=CELL:+573125580886",
      "TEL;TYPE=WORK:+573123442562",
      "EMAIL;TYPE=WORK:dlozanor@ucentral.edu.co",
      "URL:" + canonica,
      "ADR;TYPE=WORK;CHARSET=UTF-8:;;;Bogotá;;;Colombia",
      "NOTE;CHARSET=UTF-8:Declaración de renta, planeación tributaria, RUT, certificados de ingresos, asesoría contable. Atención 100% virtual.",
      "REV:" + sello,
      "END:VCARD"
    ];
    const vCardData = propiedades.map(plegarVcard).join("\r\n");
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
