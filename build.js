const fs = require('fs-extra');
const path = require('path');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
fs.ensureDirSync(distDir);

// Copy assets
const assetsDir = path.join(__dirname, 'src', 'assets');
const distAssetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.copySync(assetsDir, distAssetsDir);
}

// Read templates from script-specific directories
function readTemplate(script, name) {
  const templatePath = path.join(__dirname, 'src', 'templates', script, `${name}.html`);
  return fs.readFileSync(templatePath, 'utf8');
}

function readPartial(script, name) {
  const partialPath = path.join(__dirname, 'src', 'templates', script, 'partials', `${name}.html`);
  return fs.readFileSync(partialPath, 'utf8');
}

function readBase() {
  const basePath = path.join(__dirname, 'src', 'templates', 'base.html');
  return fs.readFileSync(basePath, 'utf8');
}

function renderPage(pageName, content, script, pageUrl, pageData) {
  const header = readPartial(script, 'header');
  const footer = readPartial(script, 'footer');
  const base = readBase();
  
  // Get URLs for all language versions
  const latUrl = `${pageData.url}.html`;
  const cyrUrl = `${pageData.url}.html`;
  const engUrl = `${(pageData.englishUrl || pageData.url)}.html`;
  
  // Replace language-specific placeholders in header
  let headerWithPage = header
    .replace(/\{\{LAT_PAGE\}\}/g, latUrl)
    .replace(/\{\{CYR_PAGE\}\}/g, cyrUrl)
    .replace(/\{\{ENG_PAGE\}\}/g, engUrl);
  
  // Update base template with script-specific content
  let html = base
    .replace('{{HEADER}}', headerWithPage)
    .replace('{{CONTENT}}', content)
    .replace('{{FOOTER}}', footer)
    .replace('{{PAGE_NAME}}', pageName);
  
  // Update lang attribute and meta tags based on script
  if (script === 'cyr') {
    html = html.replace('lang="sr"', 'lang="sr-Cyrl"');
  } else if (script === 'eng') {
    html = html.replace('lang="sr"', 'lang="en"');
    html = html.replace(
      '<title>Advokat Sanja Mandarić | Imovinsko i porodično pravo | Pančevo</title>',
      '<title>Attorney Sanja Mandarić | Property and Family Law | Pančevo</title>'
    );
    html = html.replace(
      '<meta name="description" content="Advokat Sanja Mandarić, Pančevo. Više od 15 godina iskustva u imovinskom, porodičnom i odštetnom pravu, uz profesionalan i smiren pristup.">',
      '<meta name="description" content="Attorney Sanja Mandarić, Pančevo. Over 15 years of experience in property, family, and tort law, with a professional and calm approach.">'
    );
    html = html.replace(
      '<meta name="keywords" content="advokat Pančevo, imovinsko pravo Pančevo, porodični advokat, razvod braka advokat, naknada štete advokat">',
      '<meta name="keywords" content="attorney Pančevo, property law Pančevo, family attorney, divorce attorney, damage compensation attorney">'
    );
  }
  
  return html;
}

// Generate pages
const pages = [
  { name: 'index', url: 'index', title: 'Početna', cyrillicTitle: 'Почетна', englishTitle: 'Home' },
  { name: 'about', url: 'o-meni', title: 'O meni', cyrillicTitle: 'О мени', englishUrl: 'about', englishTitle: 'About me' },
  { name: 'practice-areas', url: 'oblasti-rada', title: 'Oblasti rada', cyrillicTitle: 'Области рада', englishUrl: 'practice-areas', englishTitle: 'Practice areas' },
  { name: 'how-i-work', url: 'kako-radim', title: 'Kako radim', cyrillicTitle: 'Како радим', englishUrl: 'how-i-work', englishTitle: 'How I work' },
  { name: 'contact', url: 'kontakt', title: 'Kontakt', cyrillicTitle: 'Контакт', englishUrl: 'contact', englishTitle: 'Contact' }
];

// Generate Latin pages in lat/ subdirectory
const latinDir = path.join(distDir, 'lat');
fs.ensureDirSync(latinDir);

pages.forEach(page => {
  const content = readTemplate('lat', page.name);
  const html = renderPage(page.title, content, 'lat', page.url, page);
  const outputPath = path.join(latinDir, `${page.url}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');
});

// Generate Cyrillic pages in cyr/ subdirectory
const cyrillicDir = path.join(distDir, 'cyr');
fs.ensureDirSync(cyrillicDir);

pages.forEach(page => {
  const content = readTemplate('cyr', page.name);
  const html = renderPage(page.cyrillicTitle, content, 'cyr', page.url, page);
  const outputPath = path.join(cyrillicDir, `${page.url}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');
});

// Generate English pages in eng/ subdirectory
const englishDir = path.join(distDir, 'eng');
fs.ensureDirSync(englishDir);

pages.forEach(page => {
  const content = readTemplate('eng', page.name);
  const pageUrl = page.englishUrl || page.url;
  const html = renderPage(page.englishTitle, content, 'eng', pageUrl, page);
  const outputPath = path.join(englishDir, `${pageUrl}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');
});

// Create root index.html that redirects to Latin version
const rootIndex = `<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=lat/index.html">
    <title>Advokat Sanja Mandarić | Imovinsko i porodično pravo | Pančevo</title>
    <script>window.location.href = 'lat/index.html';</script>
</head>
<body>
    <p>Preusmjeravanje na <a href="lat/index.html">latiničnu verziju</a>...</p>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), rootIndex, 'utf8');

console.log('✓ Website built successfully!');
console.log(`✓ Latin pages: ${latinDir}`);
console.log(`✓ Cyrillic pages: ${cyrillicDir}`);
console.log(`✓ English pages: ${englishDir}`);
console.log(`✓ Root index.html redirects to lat/index.html`);
