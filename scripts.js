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

  /* Guardar contacto: compartir archivo con el selector nativo cuando sea compatible.
     No forzar descargas ni afirmar que el contacto se guardó sin confirmación del sistema. */
  const plegarVcard = (linea) => {
    const encoder = new TextEncoder();
    const partes = [];
    let actual = "", octetos = 0;
    for (const caracter of linea) {
      const bytes = encoder.encode(caracter).length;
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

  const btnVcard = document.getElementById('btn-vcard');
  if (btnVcard) btnVcard.addEventListener('click', async () => {
    if (btnVcard.disabled) return;
    btnVcard.disabled = true;
    try {
      const canonica = (document.querySelector('link[rel="canonical"]') || {}).href || window.location.href;
      const propiedades = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Lozano;Lizeth;;;",
        "FN:Lizeth Lozano",
        "ORG:Lizeth Lozano Contadora Pública",
        "TITLE:Contadora Pública",
        "TEL;TYPE=CELL:+573125580886",
        "TEL;TYPE=WORK:+573123442562",
        "EMAIL;TYPE=WORK:dlozanor@ucentral.edu.co",
        "URL:" + canonica,
        "ADR;TYPE=WORK:;;;Bogotá;;;Colombia",
        "NOTE:Declaración de renta\\, planeación tributaria\\, RUT\\, certificados de ingresos\\, asesoría contable. Atención 100% virtual.",
        "END:VCARD"
      ];
      const contenido = propiedades.map(plegarVcard).join("\r\n") + "\r\n";
      const archivo = new File([contenido], "Lizeth_Lozano.vcf", { type: "text/vcard" });

      /* Algunos Android permiten compartir el archivo con Contactos; otros solo muestran
         apps de mensajería. El selector lo controla el sistema operativo. */
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo], title: "Contacto de Lizeth Lozano" });
          showToast("Elige Contactos para importar; confirma el guardado en tu teléfono");
          return;
        } catch (error) {
          if (error && error.name === "AbortError") return;
        }
      }

      /* Alternativa explícita: no descargar sin consentimiento del visitante. */
      const deseaDescargar = window.confirm(
        "Tu navegador no permite abrir directamente Contactos desde esta tarjeta. " +
        "¿Deseas descargar el archivo de contacto (.vcf)? Después ábrelo desde la app Contactos y selecciona Importar."
      );
      if (!deseaDescargar) return;
      const url = URL.createObjectURL(archivo);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "Lizeth_Lozano.vcf";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      showToast("Archivo .vcf descargado; impórtalo desde Contactos");
    } catch (error) {
      showToast("No fue posible preparar el contacto. Intenta nuevamente.");
    } finally {
      btnVcard.disabled = false;
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
