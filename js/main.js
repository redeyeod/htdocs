/**
 * Hauptlogik für die GroKaGe Malsch Webseite
 * Inkl. Slide-Animation für Flyer
 */

// --- KONFIGURATION FÜR FLYER ---
const manualFlyers = [
    "narrenfahrplan_25_26.jpg",
    "prunksitzungen_2026.png",
    "generationensitzung_2026.png",
    "schmudoparty_im_narrennest_2026.png",
    "naerrisches_strassentreiben_2026.png",
    "kinderfasching_2026.png"
];

document.addEventListener("DOMContentLoaded", function() {
    const basePath = window.basePath || ''; 
    
    // Header & Footer laden
    loadComponent('header-placeholder', basePath + 'header.html', () => {
        if (basePath) adjustLinks('header-placeholder', basePath);
        highlightActiveLink();
        setupMobileMenu();
        setupScrollEffect();
    });
    
    loadComponent('footer-placeholder', basePath + 'footer.html', () => {
        if (basePath) adjustLinks('footer-placeholder', basePath);
    });

    if (document.getElementById('news-container')) {
        loadFlyersAndStartSlider();
    }
});

// --- FLYER LADE LOGIK ---
async function loadFlyersAndStartSlider() {
    const basePath = window.basePath || ''; 
    const folder = basePath + "images/flyer/";
    let validImages = [];

    if (manualFlyers.length > 0) {
        validImages = manualFlyers.map((filename, index) => ({
            src: folder + filename,
            id: index
        }));
    } else {
        // Fallback: Automatischer Scan
        const maxScan = 10; 
        const checkPromises = [];
        for (let i = 1; i <= maxScan; i++) {
            checkPromises.push(checkImageExists(folder + `flyer${i}.jpg`).then(exists => { if (exists) validImages.push({ src: folder + `flyer${i}.jpg`, id: i }); }));
            checkPromises.push(checkImageExists(folder + `flyer${i}.png`).then(exists => { if (exists) validImages.push({ src: folder + `flyer${i}.png`, id: i }); }));
            checkPromises.push(checkImageExists(folder + `flyer${i}.jpeg`).then(exists => { if (exists) validImages.push({ src: folder + `flyer${i}.jpeg`, id: i }); }));
        }
        await Promise.all(checkPromises);
        validImages.sort((a, b) => a.id - b.id);
    }

    if (validImages.length === 0) {
        validImages.push({ src: "https://images.unsplash.com/photo-1514525253440-b393452e2347?q=80&w=600&auto=format&fit=crop" });
    }
    
    initSlider(validImages);
}

function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// --- SLIDER LOGIK MIT ANIMATION ---
function initSlider(imagesList) {
    const container = document.getElementById('news-container');
    const dotsContainer = document.getElementById('dots-container');
    if(!container) return; 

    // Container vorbereiten für absolute Positionierung der Slides
    container.classList.add('relative', 'overflow-hidden');

    let currentSlide = 0;
    let isAnimating = false;
    let autoSlideInterval;

    // Hilfsfunktion: Erzeugt das HTML für einen einzelnen Slide
    function createSlideHTML(imgSrc) {
        const div = document.createElement('div');
        // slide-item Klasse wichtig für Selektion
        div.className = "absolute inset-0 w-full h-full flex items-center justify-center bg-gray-50 slide-item";
        div.innerHTML = `
            <!-- Unscharfer Background -->
            <div class="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110" 
                 style="background-image: url('${imgSrc}');">
            </div>
            
            <!-- Das Bild -->
            <img src="${imgSrc}" 
                 class="relative z-10 w-full h-full object-cover scale-[1.0] transform transition duration-700 hover:scale-[1.05]"
                 alt="Flyer">
                 
            <!-- Zoom Icon -->
            <a href="${imgSrc}" target="_blank" class="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-club p-3 rounded-full shadow-xl z-20 transition transform hover:scale-110 hover:rotate-90 pointer-events-auto" title="Vergrößern">
                <i class="fa-solid fa-expand text-xl"></i>
            </a>
        `;
        return div;
    }

    // 1. Initialisierung: Ersten Slide rendern
    function initFirstSlide() {
        container.innerHTML = '';
        const imgData = imagesList[0];
        const slide = createSlideHTML(imgData.src);
        container.appendChild(slide);
        updateDots(0);
    }

    // 2. Kernfunktion: Wechselt den Slide mit Animation
    function transitionToSlide(nextIndex, direction) {
        if (isAnimating) return;
        isAnimating = true;

        const currentSlideEl = container.querySelector('.slide-item');
        const nextImgData = imagesList[nextIndex];
        const nextSlideEl = createSlideHTML(nextImgData.src);

        // Startpositionen festlegen
        // 'next' -> Neues Bild kommt von RECHTS (translate-x-full)
        // 'prev' -> Neues Bild kommt von LINKS (-translate-x-full)
        
        const enterClass = direction === 'next' ? 'translate-x-full' : '-translate-x-full';
        const exitClass = direction === 'next' ? '-translate-x-full' : 'translate-x-full';

        // Neues Element vorbereiten (außerhalb des Sichtbereichs)
        nextSlideEl.classList.add('transform', enterClass);
        // Wir fügen Transitions-Klassen hinzu
        nextSlideEl.classList.add('transition-transform', 'duration-500', 'ease-in-out');
        
        container.appendChild(nextSlideEl);

        // Kleiner Timeout (Force Reflow), damit der Browser die Startposition kennt
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Animation starten
                
                // 1. Altes Bild rausschieben
                if (currentSlideEl) {
                    currentSlideEl.classList.add('transform', 'transition-transform', 'duration-500', 'ease-in-out');
                    currentSlideEl.classList.remove('translate-x-0');
                    currentSlideEl.classList.add(exitClass);
                }
                
                // 2. Neues Bild reinschieben
                nextSlideEl.classList.remove(enterClass);
                nextSlideEl.classList.add('translate-x-0');
            });
        });

        // Aufräumen nach der Animation (500ms entspricht duration-500)
        setTimeout(() => {
            if (currentSlideEl) currentSlideEl.remove();
            isAnimating = false;
            currentSlide = nextIndex;
            updateDots(currentSlide);
        }, 500); 
    }

    function updateDots(index) {
        if(!dotsContainer) return;
        dotsContainer.innerHTML = '';
        if(imagesList.length <= 1) return;
        
        const displayCount = Math.min(imagesList.length, 10);
        for(let i=0; i < displayCount; i++) {
            const dot = document.createElement('button');
            dot.className = `h-2 rounded-full transition-all duration-300 shadow-sm ${i === index ? 'bg-white w-8 opacity-100' : 'bg-white/40 w-2 hover:bg-white/70'}`;
            // Klick auf Dot
            dot.onclick = () => {
                if (i === currentSlide) return;
                const dir = i > currentSlide ? 'next' : 'prev';
                transitionToSlide(i, dir);
                resetTimer();
            };
            dotsContainer.appendChild(dot);
        }
    }

    // Steuerung
    function nextSlide() {
        const newIndex = (currentSlide + 1) % imagesList.length;
        transitionToSlide(newIndex, 'next');
    }

    function prevSlide() {
        // Modulo für negative Zahlen in JS etwas tricky, daher + length
        const newIndex = (currentSlide - 1 + imagesList.length) % imagesList.length;
        transitionToSlide(newIndex, 'prev');
    }
    
    function resetTimer() { 
        clearInterval(autoSlideInterval); 
        autoSlideInterval = setInterval(nextSlide, 6000); 
    }

    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    if(imagesList.length > 1) {
        if(nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
        if(prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });
        if(nextBtn && nextBtn.parentElement) nextBtn.parentElement.style.display = 'flex';
    } else {
        if(nextBtn && nextBtn.parentElement) nextBtn.parentElement.style.display = 'none';
    }

    // Start
    initFirstSlide();
    resetTimer();
}


// --- RESTLICHE HELFER (Links, Menü, Scroll etc.) ---

function adjustLinks(containerId, basePath) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const elements = container.querySelectorAll('img, a');
    elements.forEach(el => {
        const attr = el.tagName === 'IMG' ? 'src' : 'href';
        const val = el.getAttribute(attr);
        if (val && !val.startsWith('http') && !val.startsWith('//') && !val.startsWith('#') && !val.startsWith('mailto')) {
            el.setAttribute(attr, basePath + val);
        }
    });
}

function highlightActiveLink() {
    const title = document.title;
    const header = document.getElementById('navbar');
    if(!header) return;
    const links = header.querySelectorAll('a.nav-link, a.big-nav-link');
    links.forEach(link => {
        if (title.includes(link.textContent.trim()) && link.textContent.trim() !== '') {
            link.classList.add('text-clubaccent', 'font-bold');
            link.classList.remove('text-white'); 
            if (link.classList.contains('nav-link')) {
                link.style.borderBottom = "2px solid #FF8C00";
            }
        }
    });
}

async function loadComponent(elementId, filePath, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP Status: ${response.status}`);
        const text = await response.text();
        element.innerHTML = text;
        if (callback) callback();
    } catch (error) {
        console.error(`Fehler beim Laden von ${filePath}:`, error);
    }
}

window.openGroupModal = function(groupId) { /* ... */ };
window.closeGroupModal = function() { /* ... */ };

function toggleEvent(detailsId, iconId) {
    const details = document.getElementById(detailsId);
    const icon = document.getElementById(iconId);
    if (details && details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        if(icon) icon.style.transform = 'rotate(180deg)';
    } else if (details) {
        details.classList.add('hidden');
        if(icon) icon.style.transform = 'rotate(0deg)';
    }
}

function downloadCalendarEvent(title, startDate, endDate, location, description) {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GroKaGe Malsch//Webseite//DE
BEGIN:VEVENT
UID:${Date.now()}@grokage-malsch.de
DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '')}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/ /g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function setupMobileMenu() {
    const btn = document.getElementById('burger-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const menu = document.getElementById('fullscreen-menu');
    if(!btn || !closeBtn || !menu) return;

    function openMenu() {
        menu.classList.remove('closed');
        menu.classList.add('open');
        document.body.style.overflow = 'hidden'; 
    }
    function closeMenu() {
        menu.classList.remove('open');
        menu.classList.add('closed');
        document.body.style.overflow = '';
    }
    btn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
}

function setupScrollEffect() {
    const navbar = document.getElementById('navbar');
    if(navbar) {
        const updateHeader = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('nav-scrolled');
            } else {
                navbar.classList.remove('nav-scrolled');
            }
        };
        window.addEventListener('scroll', updateHeader);
        updateHeader(); 
    }
}
