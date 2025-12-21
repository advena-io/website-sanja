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

// Read templates
const templatesDir = path.join(__dirname, 'src', 'templates');
const partialsDir = path.join(templatesDir, 'partials');

function readTemplate(name) {
  return fs.readFileSync(path.join(templatesDir, `${name}.html`), 'utf8');
}

function readPartial(name) {
  return fs.readFileSync(path.join(partialsDir, `${name}.html`), 'utf8');
}

// Extract only Latin or Cyrillic text from content
function extractScript(content, script) {
  if (script === 'latin') {
    // Remove cyrillic-text spans and their content completely
    let result = content.replace(/<span class="cyrillic-text">[\s\S]*?<\/span>/g, '');
    // Remove latin-text opening tags
    result = result.replace(/<span class="latin-text">/g, '');
    // Remove closing spans that immediately follow (were part of latin-text)
    result = result.replace(/([^<]*)<\/span>(?=\s*<[^\/]|$)/g, '$1');
    // Clean up any double closing spans
    result = result.replace(/<\/span><\/span>/g, '</span>');
    return result;
  } else {
    // Remove latin-text spans and their content completely
    let result = content.replace(/<span class="latin-text">[\s\S]*?<\/span>/g, '');
    // Remove cyrillic-text opening tags
    result = result.replace(/<span class="cyrillic-text">/g, '');
    // Remove closing spans that immediately follow (were part of cyrillic-text)
    result = result.replace(/([^<]*)<\/span>(?=\s*<[^\/]|$)/g, '$1');
    // Clean up any double closing spans
    result = result.replace(/<\/span><\/span>/g, '</span>');
    return result;
  }
}

// Update links based on script and page location
function updateLinks(content, script, isCyrillicPage) {
  // List of page URLs
  const pageUrls = ['index.html', 'o-meni.html', 'oblasti-rada.html', 'kako-radim.html', 'kontakt.html'];
  
  if (isCyrillicPage) {
    // For cyrillic pages (in cyr/ folder), ensure all internal page links are relative
    // Ensure logo link is relative
    content = content.replace(/href="index\.html" class="logo"/g, 'href="index.html" class="logo"');
    
    // Ensure all internal page links are relative (not pointing to ../lat/)
    pageUrls.forEach(pageUrl => {
      // Remove any ../lat/ prefix from internal links
      const escaped = pageUrl.replace('.', '\\.');
      content = content.replace(new RegExp(`href="../lat/${escaped}"`, 'g'), `href="${pageUrl}"`);
      // Also ensure no absolute paths to lat folder
      content = content.replace(new RegExp(`href="lat/${escaped}"`, 'g'), `href="${pageUrl}"`);
    });
  } else {
    // For latin pages (in lat/ folder), ensure all links stay relative
    // Ensure logo link is relative
    content = content.replace(/href="index\.html" class="logo"/g, 'href="index.html" class="logo"');
    
    // Ensure all internal page links are relative (not pointing to ../cyr/)
    pageUrls.forEach(pageUrl => {
      // Remove any ../cyr/ prefix from internal links
      const escaped = pageUrl.replace('.', '\\.');
      content = content.replace(new RegExp(`href="../cyr/${escaped}"`, 'g'), `href="${pageUrl}"`);
      // Also ensure no absolute paths to cyr folder
      content = content.replace(new RegExp(`href="cyr/${escaped}"`, 'g'), `href="${pageUrl}"`);
    });
  }
  
  return content;
}

function renderPage(pageName, content, script, pageUrl) {
  const header = readPartial('header');
  const footer = readPartial('footer');
  const base = readTemplate('base');
  
  const isCyrillicPage = script === 'cyrillic';
  const currentPageUrl = `${pageUrl}.html`;
  
  // Extract script-specific content
  let extractedHeader = extractScript(header, script);
  let extractedFooter = extractScript(footer, script);
  let extractedContent = extractScript(content, script);
  
  // Update links
  extractedHeader = updateLinks(extractedHeader, script, isCyrillicPage);
  extractedContent = updateLinks(extractedContent, script, isCyrillicPage);
  
  // Update base template with script-specific content
  let html = base
    .replace('{{HEADER}}', extractedHeader)
    .replace('{{CONTENT}}', extractedContent)
    .replace('{{FOOTER}}', extractedFooter)
    .replace('{{PAGE_NAME}}', pageName);
  
  // Fix script switcher links in final HTML to point to same page in other script
  if (isCyrillicPage) {
    // For cyrillic pages: "Лат" should point to ../lat/[current-page].html, "Ћир" should be active
    const latinPageUrl = `../lat/${currentPageUrl}`;
    html = html.replace(/<a href="[^"]*" class="script-btn[^"]*">Лат<\/a>/g, `<a href="${latinPageUrl}" class="script-btn">Лат</a>`);
    html = html.replace(/<a href="[^"]*" class="script-btn[^"]*">Ћир<\/a>/g, `<a href="${currentPageUrl}" class="script-btn active">Ћир</a>`);
    // Also handle case where there might be closing span tag
    html = html.replace(/<a href="[^"]*" class="script-btn[^"]*">Лат<\/span><\/a>/g, `<a href="${latinPageUrl}" class="script-btn">Лат</a>`);
    html = html.replace(/<a href="[^"]*" class="script-btn[^"]*">Ћир<\/span><\/a>/g, `<a href="${currentPageUrl}" class="script-btn active">Ћир</a>`);
  } else {
    // For latin pages: "Lat" should be active, "Ћир" should point to ../cyr/[current-page].html
    const cyrillicPageUrl = `../cyr/${currentPageUrl}`;
    html = html.replace(/<a href="[^"]*" class="script-btn[^"]*">Lat<\/a>/g, `<a href="${currentPageUrl}" class="script-btn active">Lat</a>`);
    html = html.replace(/<a href="[^"]*" class="script-btn[^"]*">Ћир<\/a>/g, `<a href="${cyrillicPageUrl}" class="script-btn">Ћир</a>`);
    // Also handle case where there might be closing span tag
    html = html.replace(/<a href="[^"]*" class="script-btn[^"]*">Lat<\/span><\/a>/g, `<a href="${currentPageUrl}" class="script-btn active">Lat</a>`);
    html = html.replace(/<a href="[^"]*" class="script-btn[^"]*">Ћир<\/span><\/a>/g, `<a href="${cyrillicPageUrl}" class="script-btn">Ћир</a>`);
  }
  
  // Update lang attribute and title based on script
  if (script === 'cyrillic') {
    html = html.replace('lang="sr"', 'lang="sr-Cyrl"');
  }
  
  return html;
}

// Generate pages
const pages = [
  { name: 'index', url: 'index', title: 'Početna', cyrillicTitle: 'Почетна' },
  { name: 'about', url: 'o-meni', title: 'O meni', cyrillicTitle: 'О мени' },
  { name: 'practice-areas', url: 'oblasti-rada', title: 'Oblasti rada', cyrillicTitle: 'Области рада' },
  { name: 'how-i-work', url: 'kako-radim', title: 'Kako radim', cyrillicTitle: 'Како радим' },
  { name: 'contact', url: 'kontakt', title: 'Kontakt', cyrillicTitle: 'Контакт' }
];

// Generate Latin pages in lat/ subdirectory
const latinDir = path.join(distDir, 'lat');
fs.ensureDirSync(latinDir);

pages.forEach(page => {
  const content = readTemplate(page.name);
  const html = renderPage(page.title, content, 'latin', page.url);
  const outputPath = path.join(latinDir, `${page.url}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');
});

// Generate Cyrillic pages in cyr/ subdirectory
const cyrillicDir = path.join(distDir, 'cyr');
fs.ensureDirSync(cyrillicDir);

pages.forEach(page => {
  const content = readTemplate(page.name);
  const html = renderPage(page.cyrillicTitle, content, 'cyrillic', page.url);
  const outputPath = path.join(cyrillicDir, `${page.url}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');
});

// Create root index.html that redirects to lat/index.html
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
console.log(`✓ Root index.html redirects to lat/index.html`);
