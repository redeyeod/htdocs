/**
 * Hauptlogik für die GroKaGe Malsch Webseite
 */

// --- KONFIGURATION FÜR FLYER ---
// Hier sind deine aktuellen Flyer eingetragen:
const manualFlyers = [
    "narrenfahrplan_25_26.jpg",
    "prunksitzungen_2026.png",
    "generationssitzung_2026.png",
    "schmudoparty_im_narrennest_2026.png",
    "naerrisches_strassentreiben_2026.png",
    "kinderfasching_2026.png"
];

document.addEventListener("DOMContentLoaded", function() {
    const basePath = window.basePath || ''; 

    // 1. Header laden
    loadComponent('header-placeholder', basePath + 'header.html', () => {
        if (basePath) adjustLinks('header-placeholder', basePath);
        highlightActiveLink();
        setupMobileMenu();
        setupScrollEffect();
    });

    // 2. Footer laden
    loadComponent('footer-placeholder', basePath + 'footer.html', () => {
        if (basePath) adjustLinks('footer-placeholder', basePath);
    });

    // 3. Slider starten (Bilder laden)
    if (document.getElementById('news-container')) {
        loadFlyersAndStartSlider();
    }
});

// --- FLYER LADE LOGIK ---
async function loadFlyersAndStartSlider() {
    const basePath = window.basePath || ''; 
    const folder = basePath + "images/flyer/";
    let validImages = [];

    // OPTION A: Manuelle Liste nutzen
    if (manualFlyers.length > 0) {
        console.log("Nutze manuelle Flyer-Liste:", manualFlyers);
        // Wir bauen die Pfade zusammen
        validImages = manualFlyers.map((filename, index) => ({
            src: folder + filename,
            id: index
        }));
    } 
    // OPTION B: Automatisch Scannen (Fallback)
    else {
        console.log("Scanne nach flyer1 bis flyer10...");
        const maxScan = 10; 
        const checkPromises = [];

        for (let i = 1; i <= maxScan; i++) {
            checkPromises.push(checkImageExists(folder + `flyer${i}.jpg`).then(exists => {
                if (exists) validImages.push({ src: folder + `flyer${i}.jpg`, id: i });
            }));
            checkPromises.push(checkImageExists(folder + `flyer${i}.png`).then(exists => {
                if (exists) validImages.push({ src: folder + `flyer${i}.png`, id: i });
            }));
             checkPromises.push(checkImageExists(folder + `flyer${i}.jpeg`).then(exists => {
                if (exists) validImages.push({ src: folder + `flyer${i}.jpeg`, id: i });
            }));
        }

        await Promise.all(checkPromises);
        validImages.sort((a, b) => a.id - b.id);
    }

    // Fallback, wenn gar nichts gefunden wurde
    if (validImages.length === 0) {
        console.warn("Keine Flyer gefunden. Zeige Demo-Bild.");
        validImages.push({ src: "https://images.unsplash.com/photo-1514525253440-b393452e2347?q=80&w=600&auto=format&fit=crop" });
    }

    // Slider starten
    initSlider(validImages);
}

// Helfer: Prüft ob ein Bild existiert
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// --- SLIDER LOGIK ---
function initSlider(imagesList) {
    const container = document.getElementById('news-container');
    const dotsContainer = document.getElementById('dots-container');
    if(!container) return; 

    let currentSlide = 0;
    let autoSlideInterval;

    function renderSlide(index) {
        container.innerHTML = '';
        
        const imgData = imagesList[index % imagesList.length];
        const imgSrc = imgData.src;

        const slideHTML = `
            <div class="absolute inset-0 w-full h-full animate-fade-in flex items-center justify-center bg-gray-100 overflow-hidden rounded-[1.5rem]">
                
                <!-- 1. Unscharfer Hintergrund -->
                <div class="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-110" 
                     style="background-image: url('${imgSrc}');">
                </div>
                
                <!-- 2. Das scharfe Bild -->
                <img src="${imgSrc}" 
                     class="relative z-10 w-full h-full object-contain p-1 transform transition duration-500 hover:scale-[1.02]"
                     alt="Flyer">
                     
                <!-- Zoom Button -->
                <a href="${imgSrc}" target="_blank" class="absolute bottom-6 right-6 bg-white/90 hover:bg-white text-club p-3 rounded-full shadow-xl z-20 transition transform hover:scale-110 hover:rotate-90" title="Vergrößern">
                    <i class="fa-solid fa-expand text-xl"></i>
                </a>
            </div>
        `;
        container.innerHTML = slideHTML;
        updateDots(index);
    }

    function updateDots(index) {
        if(!dotsContainer) return;
        dotsContainer.innerHTML = '';
        
        if(imagesList.length <= 1) return;

        const displayCount = Math.min(imagesList.length, 10);
        
        for(let i=0; i < displayCount; i++) {
            const dot = document.createElement('button');
            dot.className = `h-2 rounded-full transition-all duration-300 shadow-sm ${i === index ? 'bg-[#0E3CA0] w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'}`;
            dot.onclick = () => { currentSlide = i; renderSlide(i); resetTimer(); };
            dotsContainer.appendChild(dot);
        }
    }

    function nextSlide() { currentSlide = (currentSlide + 1) % imagesList.length; renderSlide(currentSlide); }
    function prevSlide() { currentSlide = (currentSlide - 1 + imagesList.length) % imagesList.length; renderSlide(currentSlide); }
    
    function resetTimer() { 
        clearInterval(autoSlideInterval); 
        autoSlideInterval = setInterval(nextSlide, 6000); 
    }

    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    if(imagesList.length > 1) {
        if(nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
        if(prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });
        // Pfeile sichtbar machen
        if(nextBtn && nextBtn.parentElement) nextBtn.parentElement.style.display = 'flex';
    } else {
        // Pfeile ausblenden wenn nur 1 Bild
        if(nextBtn && nextBtn.parentElement) nextBtn.parentElement.style.display = 'none';
    }

    renderSlide(0);
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

// Global functions for HTML access
window.openGroupModal = function(groupId) { /* Modal Logik wird bei Bedarf hierher kopiert oder aus HTML genutzt */ 
    // Hier nur der Stub, falls es in gruppen/index.html inline ist.
    // Wenn du es zentral willst, sag Bescheid!
};
window.closeGroupModal = function() { };

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
