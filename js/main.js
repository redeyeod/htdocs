/**
 * Hauptlogik für die GroKaGe Malsch Webseite
 */

document.addEventListener("DOMContentLoaded", function() {
    
    // Basis-Pfad bestimmen
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

    // 3. Slider starten
    if (document.getElementById('news-container')) {
        initSlider();
    }
});

// --- HELFER: Links anpassen ---
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

// --- HELFER: Aktiven Link markieren ---
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
    }
}

// --- GRUPPEN DATEN (unverändert) ---
const groupsData = {
    'storchengarde': { title: 'Storchengarde', subtitle: 'Das Aushängeschild', img: 'images/storchengarde.png', desc: 'Unsere Storchengarde repräsentiert den Verein auf zahlreichen Turnieren und Veranstaltungen. Mit Disziplin und Leidenschaft trainieren sie das ganze Jahr für den perfekten Marsch.', betreuer: 'Anna Müller, Lisa Schmidt', trainer: 'Julia Wagner', contact: 'storchengarde@grokage-malsch.de' },
    'jugendgarde': { title: 'Jugendgarde', subtitle: 'Die Nachwuchstalente', img: 'images/jugendgarde.png', desc: 'In der Jugendgarde werden die Schritte anspruchsvoller. Hier wachsen die Talente von morgen heran und begeistern mit ihrem Können.', betreuer: 'Sarah Weber', trainer: 'Marie Klein', contact: 'jugendgarde@grokage-malsch.de' },
    'kindergarde': { title: 'Kindergarde', subtitle: 'Mit Spaß dabei', img: 'images/kindergarde.png', desc: 'Für unsere Kindergarde steht der Spaß am Tanzen im Vordergrund. Spielerisch werden erste Marschschritte und Formationen gelernt.', betreuer: 'Tanja Richter', trainer: 'Vanessa Wolf', contact: 'kindergarde@grokage-malsch.de' },
    'narrensamen': { title: 'Narrensamen', subtitle: 'Die aller Kleinsten', img: 'images/narrensamen.png', desc: 'Unsere jüngsten Aktiven auf der Bühne. Mit viel Freude und Eifer zeigen sie ihren ersten Showtanz.', betreuer: 'Sabine Neumann', trainer: 'Lara Schwarz', contact: 'narrensamen@grokage-malsch.de' },
    'storchenkeuken': { title: 'Storchenküken', subtitle: 'Unsere Jüngsten', img: 'images/storchenkueken.png', desc: 'Die Vorstufe zur Garde. Hier werden spielerisch Rhythmusgefühl und Bewegung zur Musik gefördert.', betreuer: 'Jessica Zimmermann', trainer: 'Nina Krüger', contact: 'kueken@grokage-malsch.de' },
    'maennerballett': { title: 'Männerballett', subtitle: 'Anmut & Eleganz', img: 'images/maennerballett.png', desc: 'Wenn diese Herren die Bühne betreten, bleibt kein Auge trocken. Akrobatik, Humor und eine Prise Selbstironie.', betreuer: 'Markus Braun', trainer: 'Stefanie Hofmann', contact: 'maennerballett@grokage-malsch.de' },
    'oldstars': { title: 'Old-Stars', subtitle: 'Erfahrung trifft Rhythmus', img: 'images/oldstars.png', desc: 'Ehemalige Gardetänzerinnen und tanzbegeisterte Damen, die es noch einmal wissen wollen. Showtanz vom Feinsten.', betreuer: 'Monika Schmitt', trainer: 'Sandra Lange', contact: 'oldstars@grokage-malsch.de' },
    'fahnenschwinger': { title: 'Fahnenschwinger', subtitle: 'Tradition in Bewegung', img: 'images/fahnenschwinger.png', desc: 'Mit Präzision und Kraft lassen sie die Fahnen der GroKaGe fliegen. Ein optisches Highlight bei jedem Einmarsch.', betreuer: 'Peter Werner', trainer: 'Klaus Krause', contact: 'fahnen@grokage-malsch.de' },
    'dominos': { title: 'Mälscher Dominos', subtitle: 'Laufgruppe', img: 'images/maelscherdominos.png', desc: 'Eine feste Größe im Mälscher Fasching. Mit ihren kreativen Kostümen bereichern sie jeden Umzug.', betreuer: 'Familie Meier', trainer: '-', contact: 'dominos@grokage-malsch.de' },
    'nachtkrabb': { title: 'Mälscher Nachtkrabb', subtitle: 'Laufgruppe', img: 'images/maelschernachtkrabb.png', desc: 'Die mystische Seite der Fasnacht. Mit ihren handgefertigten Masken sorgen sie für Staunen.', betreuer: 'Bernd Lehmann', trainer: '-', contact: 'nachtkrabb@grokage-malsch.de' },
    'bollehohlchor': { title: 'Bollehohlchor', subtitle: 'Gesang & Stimmung', img: 'images/bollehohlchor.png', desc: 'Lokalkolorit und Stimmungslieder sind ihr Metier. Der Chor sorgt live für beste Unterhaltung.', betreuer: 'Dirk Sommer', trainer: 'Musikalischer Leiter: Hans Durst', contact: 'chor@grokage-malsch.de' },
    'buettenredner': { title: 'Büttenredner', subtitle: 'Wortakrobaten', img: 'images/buettenredner.png', desc: 'Ob politisch oder gesellschaftskritisch, unsere Redner nehmen kein Blatt vor den Mund.', betreuer: 'Sitzungspräsident', trainer: '-', contact: 'info@grokage-malsch.de' },
    'elferrat': { title: 'Elferrat', subtitle: 'Das Parlament', img: 'images/elferrat.png', desc: 'Das organisatorische Rückgrat der Sitzungen.', betreuer: 'Präsident', trainer: '-', contact: 'elferrat@grokage-malsch.de' },
    'dekoteam': { title: 'Dekoteam', subtitle: 'Kreativabteilung', img: 'images/dekoteam.png', desc: 'Sie verwandeln Hallen in Narrentempel.', betreuer: 'Kreativ-Leitung', trainer: '-', contact: 'deko@grokage-malsch.de' },
    'dekoordenteam': { title: 'Dekoordenteam', subtitle: 'Die Bastler', img: 'images/dekoordenteam.png', desc: 'Zuständig für die Orden und Auszeichnungen.', betreuer: 'Ordensmeister', trainer: '-', contact: 'orden@grokage-malsch.de' },
    'technikteam': { title: 'Technikteam', subtitle: 'Licht & Ton', img: 'images/technikteam.png', desc: 'Sorgen für den guten Ton und das rechte Licht.', betreuer: 'Technik-Chef', trainer: '-', contact: 'technik@grokage-malsch.de' },
    'buehnenbau': { title: 'Bühnenbauteam', subtitle: 'Die Handwerker', img: 'images/buehnenbauteam.png', desc: 'Bauen die Kulissen für unsere Shows.', betreuer: 'Bauleiter', trainer: '-', contact: 'bau@grokage-malsch.de' },
    'socialmedia': { title: 'Social Media Team', subtitle: 'Online Präsenz', img: 'images/socialmediateam.png', desc: 'Halten euch auf Facebook und Instagram auf dem Laufenden.', betreuer: 'Pressewart', trainer: '-', contact: 'social@grokage-malsch.de' },
    'kuechenteam': { title: 'Küchenteam', subtitle: 'Verpflegung', img: 'images/kuechenteam.png', desc: 'Sorgen dafür, dass niemand hungrig bleibt.', betreuer: 'Küchenchef', trainer: '-', contact: 'kueche@grokage-malsch.de' }
};

// Global für HTML onclicks
window.openGroupModal = function(groupId) {
    const modal = document.getElementById('group-modal');
    const content = document.getElementById('group-modal-content');
    const data = groupsData[groupId];
    if(!data || !modal) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-subtitle').textContent = data.subtitle;
    document.getElementById('modal-desc').textContent = data.desc;
    document.getElementById('modal-betreuer').textContent = data.betreuer;
    document.getElementById('modal-trainer').textContent = data.trainer;
    
    const basePath = window.basePath || '';
    const imgEl = document.getElementById('modal-img');
    imgEl.onerror = function() {
        this.onerror = null; 
        this.src = 'https://images.unsplash.com/photo-1514525253440-b393452e2347?q=80&w=600&auto=format&fit=crop';
    };
    imgEl.src = basePath + data.img;
    
    const contactLink = document.getElementById('modal-contact');
    contactLink.textContent = data.contact;
    contactLink.href = 'mailto:' + data.contact;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
};

window.closeGroupModal = function() {
    const modal = document.getElementById('group-modal');
    const content = document.getElementById('group-modal-content');
    if(!modal || !content) return;
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
};

// --- FUNKTIONEN ---
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

// --- NEUER FLYER SLIDER (HOCHKANT) ---
const newsData = [
    { 
        id: 1, 
        title: "Prunksitzung 2025", 
        text: "Der offizielle Flyer zur Prunksitzung.", 
        image: "images/flyer/flyer1.png", 
        date: "Neu" 
    },
    { 
        id: 2, 
        title: "Kinderfasching", 
        text: "Alle Infos für unsere kleinen Narren.", 
        image: "images/flyer/flyer2.png", 
        date: "Info" 
    },
    { 
        id: 3, 
        title: "Großer Umzug", 
        text: "Streckenverlauf und Aufstellung.", 
        image: "images/flyer/flyer3.png", 
        date: "Wichtig" 
    }
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
        const basePath = window.basePath || ''; 

        // ANGEPASST FÜR HOCHKANT (Flyer-Format)
        const slideHTML = `
            <div class="absolute inset-0 p-2 flex flex-col h-full animate-slide">
                <!-- Bild Container: Hochkant (75% Höhe) -->
                <div class="h-3/4 w-full rounded-xl overflow-hidden relative mb-3 shadow-md group border border-gray-100 bg-gray-100">
                    <img src="${basePath + news.image}" 
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1549615553-6a9787d5b839?q=80&w=600&auto=format&fit=crop'"
                         class="w-full h-full object-cover object-top transform group-hover:scale-105 transition duration-700"
                         alt="${news.title}">
                    <span class="absolute top-2 right-2 bg-[#0E3CA0] text-white text-xs font-bold px-2 py-1 rounded shadow border border-white/20">${news.date}</span>
                </div>
                
                <!-- Text Bereich: Kompakt unten -->
                <div class="flex-1 flex flex-col justify-start">
                    <h4 class="font-bold text-lg leading-tight mb-1 text-gray-900 line-clamp-1">${news.title}</h4>
                    <p class="text-sm text-gray-600 line-clamp-2 leading-snug mb-2">${news.text}</p>
                    <a href="#" class="text-xs font-bold uppercase tracking-wide text-[#0E3CA0] hover:text-blue-800 flex items-center gap-1 mt-auto">
                        Flyer öffnen <i class="fa-solid fa-expand"></i>
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
