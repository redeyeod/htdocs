/**
 * Hauptlogik für die GroKaGe Malsch Webseite
 * Mit erweiterter Fehlerdiagnose für GitHub Pages & Unterordner-Support
 */

console.log("Main.js wurde geladen!");

document.addEventListener("DOMContentLoaded", function() {
    
    // Basis-Pfad prüfen (wird in Unterordnern gesetzt, z.B. window.basePath = '../')
    const basePath = window.basePath || ''; 

    const headerPlaceholder = document.getElementById('header-placeholder');

    if (headerPlaceholder) {
        // FALL A: Wir nutzen das externe Header-System (index.html)
        loadComponent('header-placeholder', basePath + 'header.html', () => {
            console.log("Header erfolgreich nachgeladen.");
            // Pfade im nachgeladenen HTML anpassen, falls wir im Unterordner sind
            if (basePath) adjustPaths(headerPlaceholder, basePath);
            
            setupMobileMenu();
            setupScrollEffect();
        });

        // Footer laden
        loadComponent('footer-placeholder', basePath + 'footer.html', () => {
             const footerPlaceholder = document.getElementById('footer-placeholder');
             if (basePath && footerPlaceholder) adjustPaths(footerPlaceholder, basePath);
        });

    } else {
        // FALL B: Header ist hardcoded (gruppen/index.html)
        console.log("Kein Placeholder gefunden - nutze vorhandenen Header.");
        setupMobileMenu();
        setupScrollEffect();
    }

    // Slider nur starten, wenn Container existiert
    if (document.getElementById('news-container')) {
        initSlider();
    }
});

// --- HELFER: Pfade in nachgeladenem HTML anpassen ---
function adjustPaths(container, basePath) {
    // Links (href) und Bilder (src) anpassen
    const elements = container.querySelectorAll('[href], [src]');
    elements.forEach(el => {
        const attr = el.hasAttribute('href') ? 'href' : 'src';
        const val = el.getAttribute(attr);
        // Nur relative Pfade anpassen, die nicht mit http, // oder # beginnen
        if (val && !val.startsWith('http') && !val.startsWith('//') && !val.startsWith('#') && !val.startsWith('mailto')) {
            el.setAttribute(attr, basePath + val);
        }
    });
}

// --- HELFER: Komponente laden ---
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
        element.innerHTML = `<div style="color:red; padding:10px;">Fehler beim Laden: ${filePath}</div>`;
    }
}

// --- 1. TOGGLE EVENT DETAILS ---
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

// --- 2. KALENDER EXPORT ---
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

// --- 3. MENÜ FUNKTIONEN ---
function setupMobileMenu() {
    // Kleine Verzögerung um sicherzugehen, dass DOM ready ist
    setTimeout(() => {
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

        // Event Listener entfernen (falls doppelt) und neu setzen
        btn.onclick = openMenu;
        closeBtn.onclick = closeMenu;
    }, 50);
}

// --- 4. HEADER SCROLL EFFEKT ---
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

// --- 5. SLIDER FUNKTIONEN ---
const newsData = [
    { id: 1, title: "Ticketvorverkauf gestartet!", text: "Sichert euch jetzt die besten Plätze für unsere große Prunksitzung.", image: "https://images.unsplash.com/photo-1549615553-6a9787d5b839?q=80&w=2670&auto=format&fit=crop", date: "Heute" },
    { id: 2, title: "Rückblick Ordensball", text: "Was für ein Abend! Ein dreifach donnerndes Helau auf unsere Geehrten.", image: "https://images.unsplash.com/photo-1514525253440-b393452e2347?q=80&w=2670&auto=format&fit=crop", date: "Gestern" },
    { id: 3, title: "Die Garden sind bereit", text: "Unsere Mädels haben hart trainiert. Seid gespannt auf die neuen Tänze!", image: "https://images.unsplash.com/photo-1563529369327-023a1a3641b5?q=80&w=2670&auto=format&fit=crop", date: "20. Okt" }
];

function initSlider() {
    const container = document.getElementById('news-container');
    const dotsContainer = document.getElementById('dots-container');
    if(!container) return; 

    let currentSlide = 0;
    let autoSlideInterval;

    function renderSlide(index) {
        container.innerHTML = '';
        const news = newsData[index];
        const slideHTML = `
            <div class="absolute inset-0 p-3 flex flex-col h-full animate-slide">
                <div class="h-40 w-full rounded-lg overflow-hidden relative mb-3 shadow-md group">
                    <img src="${news.image}" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-700">
                    <span class="absolute top-2 right-2 bg-[#0E3CA0] text-white text-xs font-bold px-2 py-1 rounded shadow border border-white/20">${news.date}</span>
                </div>
                <div class="flex-1 flex flex-col justify-between">
                    <div>
                        <h4 class="font-bold text-lg leading-tight mb-2 text-gray-900">${news.title}</h4>
                        <p class="text-sm text-gray-600 line-clamp-3">${news.text}</p>
                    </div>
                    <a href="#" class="text-xs font-bold uppercase tracking-wide text-[#0E3CA0] hover:text-blue-800 mt-2 flex items-center gap-1">
                        Weiterlesen <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        container.innerHTML = slideHTML;
        updateDots(index);
    }

    function updateDots(index) {
        if(!dotsContainer) return;
        dotsContainer.innerHTML = '';
        newsData.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${i === index ? 'bg-[#0E3CA0] w-6' : 'bg-gray-300'}`;
            dot.onclick = () => { currentSlide = i; renderSlide(i); resetTimer(); };
            dotsContainer.appendChild(dot);
        });
    }

    function nextSlide() { currentSlide = (currentSlide + 1) % newsData.length; renderSlide(currentSlide); }
    function prevSlide() { currentSlide = (currentSlide - 1 + newsData.length) % newsData.length; renderSlide(currentSlide); }
    
    function resetTimer() { 
        clearInterval(autoSlideInterval); 
        autoSlideInterval = setInterval(nextSlide, 5000); 
    }

    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    if(nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
    if(prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });

    renderSlide(0);
    resetTimer();
}
