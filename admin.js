const SAMPLE_CONFIG = {
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
  familyNotes: ["Garder la tablette branchée.", "Le bouton WhatsApp ouvre l\'application."]
};

const $ = (id) => document.getElementById(id);
let config = structuredClone(SAMPLE_CONFIG);

function splitLines(value) {
  return String(value || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

function parseLinks(text) {
  return splitLines(text).map(line => {
    const [label, url] = line.split('|').map(s => (s || '').trim());
    return { label: label || url, url };
  }).filter(item => item.label && item.url);
}

function fillForm() {
  $('title').value = config.title || '';
  $('subtitle').value = config.subtitle || '';
  $('city').value = config.city || '';
  $('whatsappPhone').value = config.whatsappPhone || '';
  $('whatsappLabel').value = config.whatsappLabel || '';
  $('message').value = config.message || '';
  $('ephemeride').value = config.ephemeride || '';
  $('photoUrls').value = (config.photoUrls || []).join('\n');
  $('links').value = (config.links || []).map(l => `${l.label} | ${l.url}`).join('\n');
  $('photoIntervalMs').value = config.photoIntervalMs || 12000;
  $('accent').value = config.theme?.accent || '#4f8cff';
  $('familyNotes').value = (config.familyNotes || []).join('\n');
}

function readForm() {
  config = {
    title: $('title').value.trim(),
    subtitle: $('subtitle').value.trim(),
    homeGreeting: 'Bienvenue',
    city: $('city').value.trim(),
    whatsappPhone: $('whatsappPhone').value.trim(),
    whatsappLabel: $('whatsappLabel').value.trim(),
    message: $('message').value.trim(),
    ephemeride: $('ephemeride').value.trim(),
    photoUrls: splitLines($('photoUrls').value),
    links: parseLinks($('links').value),
    photoIntervalMs: Number($('photoIntervalMs').value || 12000),
    theme: { accent: $('accent').value.trim() || '#4f8cff' },
    familyNotes: splitLines($('familyNotes').value)
  };
}

async function loadConfig() {
  try {
    const response = await fetch('config.json?ts=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    config = { ...SAMPLE_CONFIG, ...(await response.json()) };
  } catch (_) {
    config = structuredClone(SAMPLE_CONFIG);
  }
  fillForm();
}

function downloadJson() {
  readForm();
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

async function copyJson() {
  readForm();
  await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  alert('JSON copié dans le presse-papiers.');
}

$('loadBtn').addEventListener('click', loadConfig);
$('sampleBtn').addEventListener('click', () => {
  config = structuredClone(SAMPLE_CONFIG);
  fillForm();
});
$('downloadBtn').addEventListener('click', downloadJson);
$('copyBtn').addEventListener('click', copyJson);
loadConfig();
