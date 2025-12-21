# Website for Advokat Sanja Mandarić

Professional website for lawyer Sanja Mandarić, built with Node.js and generating static HTML output.

## Features

- ✅ All required sections: Početna, O meni, Oblasti rada, Kako radim, Kontakt
- ✅ SEO optimized with specified title and meta description
- ✅ Keywords naturally embedded in content
- ✅ Professional color palette (dark olive/petrol green, warm beige, gold accents)
- ✅ Responsive design following lawyer website best practices
- ✅ Support for both Latin and Cyrillic scripts
- ✅ Mobile-friendly navigation
- ✅ Clean, professional design

## Installation

```bash
npm install
```

## Build

To build the static website:

```bash
npm run build
```

The output will be in the `dist` directory.

## Development

To build and serve locally:

```bash
npm run dev
```

This will build the site and serve it on a local server.

## Project Structure

```
website_sanja/
├── src/
│   ├── templates/
│   │   ├── base.html          # Base template
│   │   ├── index.html         # Home page
│   │   ├── about.html         # About page
│   │   ├── practice-areas.html # Practice areas page
│   │   ├── how-i-work.html    # How I work page
│   │   ├── contact.html       # Contact page
│   │   └── partials/
│   │       ├── header.html    # Header partial
│   │       └── footer.html    # Footer partial
│   └── assets/
│       ├── css/
│       │   └── style.css      # Main stylesheet
│       └── js/
│           └── script.js      # JavaScript functionality
├── dist/                       # Generated static site (after build)
├── build.js                    # Build script
└── package.json
```

## Color Palette

- **Primary**: Dark olive/petrol green (#2d5a4a) - Trust, stability
- **Secondary**: Warm beige (#f5f1e8) - Calmness
- **Accent**: Gold/bronze (#c9a961) - Authority (very discrete)

## SEO

- **Title**: Advokat Sanja Mandarić | Imovinsko i porodično pravo | Pančevo
- **Description**: Advokat Sanja Mandarić, Pančevo. Više od 15 godina iskustva u imovinskom, porodičnom i odštetnom pravu, uz profesionalan i smiren pristup.
- **Keywords**: advokat Pančevo, imovinsko pravo Pančevo, porodični advokat, razvod braka advokat, naknada štete advokat

## Deployment

The `dist` directory contains the static website that can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any web server

Simply upload the contents of the `dist` directory to your hosting provider.
