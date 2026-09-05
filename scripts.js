function openModal(id) { document.getElementById(id).classList.add('active'); }
        function closeModal(id) { document.getElementById(id).classList.remove('active'); }

        document.addEventListener('DOMContentLoaded', () => {
            const qrBox = document.getElementById("qrcode");
            if(qrBox) {
                new QRCode(qrBox, {
                    text: window.location.href,
                    width: 130,
                    height: 130,
                    colorDark : "#0A1F44",
                    colorLight : "#ffffff"
                });
            }

            const toast = document.getElementById('toast');
            const showToast = (msg) => {
                toast.textContent = msg;
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2200);
            };

            document.getElementById('btn-share').addEventListener('click', async () => {
                const shareData = {
                    title: 'Lizeth Lozano | Contadora Pública',
                    text: 'Tu tranquilidad, mi compromiso. Conoce mis servicios contables y tributarios.',
                    url: window.location.href
                };
                try {
                    if (navigator.share) { await navigator.share(shareData); }
                    else { await navigator.clipboard.writeText(window.location.href); showToast('Enlace copiado al portapapeles'); }
                } catch(e) {}
            });

            document.getElementById('btn-vcard').addEventListener('click', () => {
                const vCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:Lizeth Lozano\nORG:Lizeth Lozano Contadora Pública\nTITLE:Contadora Pública\nTEL;TYPE=CELL:+573125580886\nADR:;;Colombia;;;;Colombia\nNOTE:Declaración de renta, planeación tributaria, RUT, certificados de ingresos, asesoría contable.\nEND:VCARD`;
                const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Lizeth_Lozano.vcf';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Contacto guardado');
            });

            let currentSlide = 0;
            const slides = document.querySelectorAll('.carousel-item');
            if (slides.length > 0) {
                setInterval(() => {
                    slides[currentSlide].classList.remove('active');
                    currentSlide = (currentSlide + 1) % slides.length;
                    slides[currentSlide].classList.add('active');
                }, 2800);
            }
        });
