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
- **Multiple Layouts** — 3×1 (panoramic), 3×2 (featured), 3×3 (full grid)
- **Flexible Ratios** — Instagram-style (4:5) or simple triptych (3:4)
- **Export Options** — PNG, JPG, WebP, or keep original format
- **Quality Control** — adjustable compression (1–100%)
- **Precision Tools** — manual overlap adjustment for advanced layouts
- **Fast & Responsive** — works on desktop, tablet, and mobile

## Supported Layouts

| Layout | Slices | Use Case |
|--------|--------|----------|
| **3×1** | 3 tiles | Panoramic banner, announcements, launches |
| **3×2** | 6 tiles | Product series, travel stories, before-and-after |
| **3×3** | 9 tiles | Full grid takeover, unified brand image |

## Supported Formats

**Input:** JPEG, PNG, WebP  
**Output:** JPEG, PNG, WebP (plus original format option)

## Getting Started

### Live Website

Visit [gridcutter.io](https://gridcutter.io) to use GridCutter directly in your browser.

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/InstagramGridCutter.git
   cd InstagramGridCutter
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
InstagramGridCutter/
├── index.html                 # Homepage with layout showcase
├── gridcutter.html            # Main tool interface
├── about.html                 # About page
├── contact.html               # Contact page
├── privacy.html               # Privacy policy
├── terms.html                 # Terms of service
├── assets/
│   └── css/
│       └── style.css          # Shared styles
├── js/
│   ├── app.js                 # Main tool logic
│   └── app.min.js             # Minified version
├── tests/
│   ├── gridcutter.spec.js     # Tool tests
│   └── fixtures/              # Test fixtures
├── playwright.config.js       # E2E test config
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
- No tracking or analytics on the image itself
- No cookies or user profiles
- Only analytics: Google Analytics on traffic patterns

Read the full [Privacy Policy](https://gridcutter.io/privacy.html) for details.

## Development

### Key Technologies

- **HTML/CSS** — Responsive layout framework
- **Vanilla JavaScript** — No frameworks, lightweight & fast
- **Canvas API** — Image slicing and manipulation
- **Google Analytics** — Traffic insights only

### Build & Minify

```bash
npm install
npm run build  # Minifies app.js to app.min.js
```

### Making Changes

1. Edit source files in `js/app.js` and `assets/css/style.css`
2. Test locally at `http://localhost:8000`
3. Run automated tests: `npm test`
4. Minify before deployment: `npm run build`

## Browser Support

GridCutter works on all modern browsers that support:
- Canvas API
- FileReader API
- LocalStorage (optional)
- Modern CSS Grid/Flexbox

**Tested:** Chrome, Firefox, Safari, Edge (latest versions)

## Common Questions

**Q: Does GridCutter store my images?**  
A: No. Images are processed entirely in your browser and never sent to any server.

**Q: Can I use these tiles on Instagram?**  
A: Yes! Export your slices and upload them in order. GridCutter automatically calculates positioning for seamless grids.

**Q: What image sizes work best?**  
A: Any size. GridCutter scales and crops to match your chosen ratio. Square or landscape photos work best for full 3×3 grids.

**Q: Do I need an account?**  
A: No. GridCutter is completely free and requires no registration.

## License

© 2024 GridCutter. Open for personal and commercial use.

## Support

**Found a bug?** Have a feature request?  
[Contact us](https://gridcutter.io/contact.html) or email **gridcuttertool@gmail.com**

---

**Made with ❤️ for Instagram creators everywhere.**