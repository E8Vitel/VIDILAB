const wrapper = document.getElementById('indicator-wrapper');
const indicatorImg = document.getElementById('nav-indicator');
const links = document.querySelectorAll('.nav-link');

let currentSection = null; // <-- guarda la sección activa

function moveIndicatorTo(link) {
    indicatorImg.style.transform = 'rotate(90deg)';

    setTimeout(() => {
        const targetX = link.offsetLeft + link.offsetWidth / 2 - indicatorImg.offsetWidth / 2;
        wrapper.style.transform = `translateX(${targetX}px)`;

        setTimeout(() => {
            indicatorImg.style.transform = 'rotate(0deg)';
        }, 500);
    }, 300);
}

function setIndicatorInstant(link) {
    const targetX = link.offsetLeft + link.offsetWidth / 2 - indicatorImg.offsetWidth / 2;
    wrapper.style.transition = 'none';
    wrapper.style.transform = `translateX(${targetX}px)`;
    void wrapper.offsetWidth; // fuerza reflow
    wrapper.style.transition = '';
}

const sections = document.querySelectorAll('section[id]');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;

            // Si es la misma sección activa, no hace nada
            if (sectionId === currentSection) return;

            const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
            if (!activeLink) return;

            // Si todavía no hay sección activa (primera carga), posiciona sin animar
            if (currentSection === null) {
                setIndicatorInstant(activeLink);
            } else {
                moveIndicatorTo(activeLink);
            }

            currentSection = sectionId; // actualiza la sección activa
        }
    });
}, { threshold: 0.5 });

sections.forEach(sec => observer.observe(sec));