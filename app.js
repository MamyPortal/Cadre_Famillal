const DEFAULT_CONFIG = {
  title: 'Bonjour Mamie',
  subtitle: 'Cadre familial simple',
  homeGreeting: 'Bienvenue',
  city: 'Paris',
  message: 'Nous venons dimanche midi. Gros bisous de toute la famille.',
  ephemeride: 'Saint du jour, anniversaire, rappel familial.',
  whatsappPhone: '33600000000',
  whatsappLabel: 'Appeler WhatsApp',
  photoIntervalMs: 12000,
  photoUrls: ['photos/sample-1.svg', 'photos/sample-2.svg', 'photos/sample-3.svg'],
  links: [{ label: 'Photos', url: 'https://photos.google.com/' }],
  theme: { accent: '#4f8cff' },
  familyNotes: [
    'Garder la tablette branchée.',
    "Le bouton WhatsApp ouvre l\'application.",
    'Les proches modifient config.json à distance.'
  ]
};

const $ = (id) => document.getElementById(id);
let config = { ...DEFAULT_CONFIG };
let photoIndex = 0;
let photoTimer = null;

function sanitizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function applyTheme(theme) {
  if (theme && theme.accent) {
    document.documentElement.style.setProperty('--accent', theme.accent);
  }
}

function formatDateTime() {
  const now = new Date();
  return {
    date: new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).format(now),
    time: new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    }).format(now)
  };
}

async function loadConfig() {
  try {
    const response = await fetch('config.json?ts=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return { ...DEFAULT_CONFIG, ...(await response.json()) };
  } catch (error) {
    console.warn('Chargement de config.json impossible, valeurs par défaut utilisées.', error);
    return { ...DEFAULT_CONFIG };
  }
}

function setText(id, value) {
  const node = $(id);
  if (node) node.textContent = value ?? '';
}

function renderHeader() {
  setText('title', config.title);
  setText('subtitle', config.subtitle);
  setText('messageBox', config.message);
  setText('familyNotes', (config.familyNotes || []).join(' • '));
  const phone = sanitizePhone(config.whatsappPhone);
  const whatsapp = $('whatsappLink');
  whatsapp.href = phone ? `https://wa.me/${phone}` : '#';
  whatsapp.textContent = config.whatsappLabel || 'Appeler WhatsApp';
  const photoLink = $('photoLink');
  const firstPhoto = (config.photoUrls || [])[0] || '#';
  photoLink.href = firstPhoto;
  photoLink.textContent = 'Ouvrir les photos';
  const linkList = $('linkList');
  linkList.innerHTML = '';
  (config.links || []).forEach(link => {
    const a = document.createElement('a');
    a.href = link.url;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    a.className = 'link-pill';
    a.textContent = link.label;
    linkList.appendChild(a);
  });
}

function weatherEmoji(code) {
  const map = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '❄️', 73: '❄️', 75: '❄️', 80: '🌧️', 81: '🌧️', 82: '🌧️', 95: '⛈️'
  };
  return map[code] || '🌡️';
}

async function geocodeCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=fr&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Geocoding failed');
  const data = await response.json();
  return data.results?.[0] || null;
}

async function loadWeather() {
  try {
    const city = config.city || 'Paris';
    const place = await geocodeCity(city);
    if (!place) throw new Error('City not found');
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&timezone=auto`;
    const response = await fetch(forecastUrl);
    if (!response.ok) throw new Error('Forecast failed');
    const data = await response.json();
    const current = data.current;
    $('weatherMain').textContent = `${weatherEmoji(current.weather_code)} ${Math.round(current.temperature_2m)} °C`;
    setText('weatherDetails', `${place.name}${place.admin1 ? ', ' + place.admin1 : ''}`);
  } catch (error) {
    $('weatherMain').textContent = 'Météo';
    setText('weatherDetails', 'Vérifier la ville dans config.json');
    console.warn(error);
  }
}

function showPhoto(index) {
  const photos = config.photoUrls || [];
  const img = $('photoImg');
  const label = $('photoLabel');
  if (!photos.length) {
    img.removeAttribute('src');
    label.textContent = 'Ajoute des photos dans config.json';
    return;
  }
  const src = photos[index % photos.length];
  img.src = src;
  label.textContent = `Photo ${index % photos.length + 1} / ${photos.length}`;
}

function startSlideshow() {
  const interval = Math.max(4000, Number(config.photoIntervalMs) || 12000);
  const photos = config.photoUrls || [];
  photoIndex = 0;
  showPhoto(photoIndex);
  if (photoTimer) clearInterval(photoTimer);
  if (photos.length > 1) {
    photoTimer = setInterval(() => {
      photoIndex = (photoIndex + 1) % photos.length;
      showPhoto(photoIndex);
    }, interval);
  }
}

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('sw.js');
    } catch (error) {
      console.warn('Service worker non installé', error);
    }
  }
}

async function requestFullscreenHint() {
  document.addEventListener('click', async () => {
    if (document.fullscreenElement) return;
    try {
      await document.documentElement.requestFullscreen();
    } catch (_) {}
  }, { once: true });
}

async function init() {
  config = await loadConfig();
  applyTheme(config.theme);
  renderHeader();
  const clock = () => {
    const { date, time } = formatDateTime();
    setText('dateLine', date);
    setText('timeLine', time);
  };
  clock();
  setInterval(clock, 1000);
  await loadWeather();
  startSlideshow();
  await registerServiceWorker();
  await requestFullscreenHint();
  $('refreshBtn').addEventListener('click', async () => {
    config = await loadConfig();
    applyTheme(config.theme);
    renderHeader();
    await loadWeather();
    startSlideshow();
  });
}

init();
