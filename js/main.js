/**
 * Hauptlogik für die GroKaGe Malsch Webseite
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

        // CLEAN DESIGN: Jetzt mit object-cover und STARKEM scale für Zoom-Effekt
        const slideHTML = `
            <div class="absolute inset-0 w-full h-full animate-fade-in flex items-center justify-center bg-gray-50">
                <!-- Unscharfer Background -->
                <div class="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110" 
                     style="background-image: url('${imgSrc}');">
                </div>
                
                <!-- Das Bild: object-cover füllt alles aus, scale-115 zoomt stark rein -->
                <img src="${imgSrc}" 
                     class="relative z-10 w-full h-full object-cover scale-[1.05] transform transition duration-700 hover:scale-[1.15]"
                     alt="Flyer">
                     
                <!-- Zoom Icon -->
                <a href="${imgSrc}" target="_blank" class="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-club p-3 rounded-full shadow-xl z-20 transition transform hover:scale-110 hover:rotate-90 pointer-events-auto" title="Vergrößern">
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
            dot.className = `h-2 rounded-full transition-all duration-300 shadow-sm ${i === index ? 'bg-white w-8 opacity-100' : 'bg-white/40 w-2 hover:bg-white/70'}`;
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
        if(nextBtn && nextBtn.parentElement) nextBtn.parentElement.style.display = 'flex';
    } else {
        if(nextBtn && nextBtn.parentElement) nextBtn.parentElement.style.display = 'none';
    }

    renderSlide(0);
    resetTimer();
}

// --- HELFER & REST (Unverändert) ---
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
    function openMenu() { menu.classList.remove('closed'); menu.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeMenu() { menu.classList.remove('open'); menu.classList.add('closed'); document.body.style.overflow = ''; }
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

