# Mitropolia Târgoviștei - Website Oficial

Website modern, bilingv (RO/EN), cu calendar ortodox 2025 și galerie foto.

## Tehnologii
- HTML5 semantic
- CSS3 modular
- JavaScript vanilla (fără framework-uri)
- JSON pentru date

## Structură Proiect
```
/
├── index.html              # Homepage
├── despre.html             # Despre Mitropolia
├── stiri.html              # Lista articole
├── articol.html            # Șablon articol
├── evenimente.html         # Calendar ortodox 2025
├── parohii.html            # Parohii
├── galerie.html            # Galerie foto
├── doneaza.html            # Donații
├── contact.html            # Contact
├── politici.html           # Confidențialitate
├── sitemap.xml
├── robots.txt
├── manifest.webmanifest
├── favicon.ico
├── assets/
│   ├── css/
│   │   ├── base.css        # Reset, variabile, typography
│   │   ├── layout.css      # Grid, container, spacing
│   │   ├── components.css  # Buttons, cards, forms
│   │   └── themes.css      # Header, footer, sections
│   ├── js/
│   │   ├── main.js         # Init, navigation, menu
│   │   ├── i18n.js         # Internationalization
│   │   ├── lightbox.js     # Photo gallery
│   │   ├── calendar.js     # Calendar ortodox + .ics
│   │   └── seo.js          # Dynamic meta, breadcrumbs
│   └── img/
│       ├── hero-home.jpg
│       ├── cathedral.jpg
│       ├── gallery/        # Galerie imagini
│       └── placeholder.jpg
└── data/
    ├── orthodox-2025.json  # Sărbători ortodoxe 2025
    ├── events-local.json   # Evenimente locale
    ├── parishes.json       # Parohii
    ├── i18n-ro.json        # Traduceri RO
    └── i18n-en.json        # Traduceri EN
```

## Rulare Locală

### Python
```bash
python -m http.server 8000
# Deschide http://localhost:8000
```

### Node.js
```bash
npx serve
```

### PHP
```bash
php -S localhost:8000
```

## Editare Conținut

### Schimbarea Limbii
Textele sunt în `data/i18n-ro.json` și `data/i18n-en.json`.
Editează cheia dorită în ambele fișiere.

### Adăugare Evenimente Ortodoxe
Editează `data/orthodox-2025.json`:
```json
{
  "date": "2025-12-25",
  "title": "Nașterea Domnului",
  "type": "sărbătoare împărătească",
  "fast": "dezlegare la toate",
  "description": "Crăciunul"
}
```

### Adăugare Imagini Galerie
1. Adaugă imagini în `assets/img/gallery/`
2. Editează `galerie.html`, adaugă:
```html
<div class="gallery-item">
  <img src="assets/img/gallery/noua-imagine.jpg" 
       alt="Descriere" 
       data-caption="Caption aici"
       loading="lazy">
</div>
```

### Adăugare Parohii
Editează `data/parishes.json`:
```json
{
  "name": "Parohia Nouă",
  "address": "Str. Exemplu, Nr. 1",
  "phone": "+40 245 123456",
  "priest": "Pr. Nume Prenume"
}
```

## Caracteristici

- ✅ Bilingv RO/EN cu comutare dinamică
- ✅ Calendar ortodox 2025 complet (Paște, Florii, Rusalii, posturi)
- ✅ Export evenimente în .ics
- ✅ Galerie foto cu lightbox (navigare tastatură, swipe mobil)
- ✅ SEO optimizat (meta tags, JSON-LD, sitemap)
- ✅ Responsive (mobile-first)
- ✅ Accesibilitate WCAG 2.1 AA
- ✅ Performanță Lighthouse 90+

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Licență
© 2025 Mitropolia Târgoviștei. Toate drepturile rezervate.