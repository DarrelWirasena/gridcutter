![Socialify Image](https://socialify.git.ci/DarrelWirasena/gridcutter/image?custom_language=JavaScript&description=1&font=Bitter&language=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2FDarrelWirasena%2Fgridcutter%2Frefs%2Fheads%2Fmain%2Ffavicon%2Fandroid-icon-192x192.png&name=1&owner=1&stargazers=1&theme=Auto)

# GridCutter — Precision Instagram Grid Splitter

A free, web-based tool for splitting photos into perfectly aligned grids for Instagram. **100% private** — your images never leave your device.

## What is GridCutter?

GridCutter helps Instagram creators post stunning multi-tile photo grids without the guess-work. Upload a single photo, choose your layout (3×1, 3×2, or 3×3), and download perfectly sliced tiles. The tool automatically handles:

- Aspect ratio matching (4:5 or 3:4 per post)
- Precise edge alignment for seamless grids
- Overlap calculations for Instagram's feed layout
- Optional manual adjustments for advanced users

## Key Features

- **No Authentication Required** — works entirely in your browser
- **100% Client-Side Processing** — images never uploaded to any server
- **Multiple Layouts** — 3×1 (panoramic), 3×2 (featured), 3×3 (full grid), plus Advanced Mode up to 3×6 (18 tiles)
- **Flexible Ratios** — Instagram feed-optimized (4:5) or profile grid-optimized (3:4)
- **Export Options** — PNG, JPG, WebP, or keep original format
- **Quality Control** — adjustable compression (1–100%)
- **Bulk Download** — all tiles packaged as a single ZIP file
- **Precision Tools** — manual overlap adjustment for advanced layouts
- **Self-Hosted Fonts** — Archivo and Source Serif 4 served locally, no Google Fonts requests
- **Fast & Responsive** — works on desktop, tablet, and mobile

## Supported Layouts

| Layout | Slices | Use Case |
|--------|--------|----------|
| **3×1** | 3 tiles | Panoramic banner, announcements, launches |
| **3×2** | 6 tiles | Product series, travel stories, before-and-after |
| **3×3** | 9 tiles | Full grid takeover, unified brand image |
| **Up to 3×6** | 18 tiles | Massive continuous feeds (via Advanced Mode) |

## Supported Formats

**Input:** JPEG, PNG, WebP  
**Output:** JPEG, PNG, WebP (plus original format option)

## Instagram Context (2026)

- Instagram's profile grid now displays in the taller **3:4 aspect ratio**
- The **4:5 aspect ratio** remains widely used and preferred for maximum feed visibility
- GridCutter is built to bridge this transition — works flawlessly with either ratio

## Getting Started

### Live Website

Visit [gridcutter.com](https://gridcutter.com) to use GridCutter directly in your browser.

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DarrelWirasena/gridcutter.git
   cd gridcutter
   ```

2. **Start a local server** (requires Python 3 or Node.js):

   **Python 3:**
   ```bash
   python -m http.server 8000
   ```

   **Node.js with http-server:**
   ```bash
   npx http-server -p 8000
   ```

3. **Open in your browser:**
   ```
   http://localhost:8000
   ```

## Project Structure

```
gridcutter/
├── index.html                 # Homepage with layout showcase
├── gridcutter.html            # Main tool interface
├── about.html                 # About page
├── contact.html               # Contact page 
├── privacy.html               # Privacy policy
├── terms.html                 # Terms of service
├── data-processing.html       # GDPR data processing rights
├── sitemap.xml                # Sitemap with lastmod dates
├── robots.txt                 # Crawler rules + LLMs-txt reference
├── llms.txt                   # LLM/AI agent context file
├── BingSiteAuth.xml           # Bing Webmaster verification
├── assets/
│   ├── css/
│   │   └── style.css          # Shared styles (includes self-hosted font declarations)
│   └── fonts/                 # Self-hosted Archivo + Source Serif 4 woff2 files
├── js/
│   └── app.js                 # Main tool logic
├── tests/
│   ├── gridcutter.spec.js     # Tool tests
│   └── fixtures/              # Test fixtures
├── package.json               # Dependencies & scripts
└── README.md                  # This file
```

## Testing

The project includes automated tests for the GridCutter tool logic.

### Run Tests

```bash
npm install
npm test
```

This runs Playwright tests that verify:
- Grid calculation accuracy
- Image slicing logic
- Export format handling
- Overlap calculations

## Privacy

GridCutter is **100% private**:
- All image processing happens in your browser
- Images are **never** uploaded to any server
- No tracking cookies, analytics, or user profiles are used

Read the full [Privacy Policy](https://gridcutter.com/privacy.html) for details.

## Development

### Key Technologies

- **HTML5/CSS3** — Responsive layout with modern CSS variables and Grid/Flexbox
- **Vanilla JavaScript** — Lightweight, high-performance logic with no external framework dependencies
- **Canvas API** — Core engine for high-precision image slicing and manipulation
- **JSZip** — For packaging all tiles into a single ZIP file for bulk download
- **Self-Hosted Fonts** — Archivo and Source Serif 4 served locally to minimize external requests and ensure privacy
- **Schema.org JSON-LD** — Structured metadata (`SoftwareApplication`) for enhanced SEO on both homepage and tool page

### Local Development Flow

1. Edit source files in `js/app.js` and `assets/css/style.css`
2. Test locally using a static server
3. Run automated tests to verify grid calculations: `npm test`

## Browser Support

GridCutter works on all modern browsers that support:
- **Canvas API** — Required for image processing
- **FileReader API** — Required for local image loading
- **LocalStorage** — Used to persist your preferred grid layout (3x1, 3x2, etc.)
- **Modern CSS** — Utilizes CSS Grid and Flexbox for responsive layout

**Tested & Verified:** Chrome (latest version)

## SEO & Discoverability

- **Structured Data**: JSON-LD `SoftwareApplication` markup for rich search results
- **Webmaster Tools**: Bing verification and IndexNow integration for instant crawling
- **Search Optimization**: Semantic HTML, sitemap at `/sitemap.xml`, and optimized `robots.txt`
- **AI-Ready**: Dedicated `llms.txt` file providing context for AI agents and LLMs

## Common Questions

**Q: Does GridCutter store my images?**  
A: No. Images are processed entirely in your browser and never sent to any server.

**Q: Can I use these tiles on Instagram?**  
A: Yes! Export your slices and upload them in order. GridCutter automatically calculates positioning for seamless grids.

**Q: What image sizes work best?**  
A: Any size. GridCutter scales and crops to match your chosen ratio. Square or landscape photos work best for full 3×3 grids.

**Q: Do I need an account?**  
A: No. GridCutter is completely free and requires no registration.

**Q: Can I make grids larger than 3×3?**  
A: Yes. Open Advanced Mode in the tool to create custom layouts up to 3×6 (18 tiles).

## License

© 2026 GridCutter. Open for personal and commercial use.

## Support

**Found a bug?** Have a feature request?  
Contact us or email **gridcuttertool@gmail.com**

---

**Made with ❤️ for Instagram creators everywhere.**