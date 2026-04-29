/* ── Inject carousel-specific styles ────────────────────────────────────── */
(function () {
  const style = document.createElement("style");
  style.textContent = `
    /* Stepper */
    .slide-stepper {
      display:inline-grid;
      grid-template-columns:auto auto;
      column-gap:var(--sp-3);
      row-gap:10px;
      align-items:center;
      width:fit-content;
      max-width:100%;
      min-width:0;
    }
    .slide-stepper-main {
      display:flex;
      align-items:center;
      gap:var(--sp-3);
      width:max-content;
      min-width:0;
    }
    .slide-count-controls {
      display:flex;
      flex-direction:column;
      gap:6px;
      width:clamp(84px, 20vw, 132px);
      flex:0 0 auto;
      min-width:0;
    }
    .slide-count-input-wrap {
      display:block;
    }
    .slide-count-input {
      width:100%;
      min-width:0;
      padding:10px 12px;
      border:1px solid var(--border-mid);
      border-radius:10px;
      background:var(--surface-1);
      color:var(--text-primary);
      font-family:'Archivo',sans-serif;
      font-size:var(--text-lg);
      font-weight:800;
      line-height:1.2;
      box-sizing:border-box;
    }
    .slide-count-input:focus,
    .slide-count-input:focus-visible {
      outline:none;
      box-shadow:none;
      border-color:var(--border-mid);
    }
    .slide-presets {
      display:grid;
      grid-template-columns:repeat(4, minmax(0, 1fr));
      gap:6px;
      width:100%;
      grid-column:1 / -1;
      min-width:0;
    }
    .slide-preset-btn {
      width:100%;
      padding:6px 10px;
      border:1px solid var(--border-mid);
      border-radius:999px;
      background:var(--surface-1);
      color:var(--text-secondary);
      font-family:'Archivo',sans-serif;
      font-size:var(--text-xs);
      font-weight:700;
      cursor:pointer;
      transition:background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
    }
    .slide-preset-btn:hover {
      background:var(--surface-2);
      border-color:var(--brand);
      color:var(--text-primary);
    }
    .slide-preset-btn:focus,
    .slide-preset-btn:focus-visible {
      outline:none;
      box-shadow:none;
      border-color:var(--border-mid);
    }
    .slide-preset-btn:active { transform:scale(0.97); }
    .slide-preset-btn.active {
      background:var(--brand);
      border-color:var(--brand);
      color:var(--bg);
    }
    .stepper-btn {
      width:36px; height:36px; border-radius:8px;
      border:1px solid var(--border-mid); background:var(--surface-1);
      color:var(--text-primary); font-size:1.2rem; font-weight:700;
      font-family:'Archivo',sans-serif; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:background 0.15s, border-color 0.15s, transform 0.1s;
      flex-shrink:0;
    }
    .stepper-btn:hover { background:var(--surface-2); border-color:var(--brand); }
    .stepper-btn:focus,
    .stepper-btn:focus-visible {
      outline:none;
      box-shadow:none;
      border-color:var(--border-mid);
    }
    .stepper-btn:active { transform:scale(0.94); }
    .stepper-btn:disabled { opacity:0.35; cursor:not-allowed; pointer-events:none; }
    .stepper-label {
      font-family:'Archivo',sans-serif; font-size:var(--text-xs);
      color:var(--text-tertiary); margin-left:2px;
    }

    /* Warning */
    .slide-warning {
      display:none; padding:10px 14px;
      background:var(--warning-bg); border:1px solid var(--warning-border);
      border-radius:8px; font-family:'Archivo',sans-serif;
      font-size:var(--text-xs); color:var(--warning-text);
      line-height:1.5; gap:8px; align-items:flex-start;
    }
    .slide-warning.visible { display:flex; }

    /* Scrubber layout wrapper */
    .scrubber-wrap {
      display:flex;
      gap:10px;
      width:100%;
      box-sizing:border-box;
      align-items:flex-start;
    }
    .scrubber-wrap.layout-column { flex-direction:column; align-items:stretch; }
    .scrubber-wrap.layout-row    { flex-direction:row; align-items:stretch; }

    /* Tile scroll area */
    .preview-scroll-wrap {
      overflow-x:auto;
      overflow-y:hidden;
      flex-shrink:0;
      max-width:100%;
      box-sizing:border-box;
      scrollbar-width:thin;
      scrollbar-color:var(--border-mid) transparent;
    }
    .preview-scroll-wrap::-webkit-scrollbar { height:4px; }
    .preview-scroll-wrap::-webkit-scrollbar-track { background:transparent; }
    .preview-scroll-wrap::-webkit-scrollbar-thumb { background:var(--border-mid); border-radius:2px; }

    .preview-tiles-inner {
      display:flex;
      gap:3px;
    }
    .preview-tiles-inner.centered {
      justify-content:center;
    }

    .preview-tile-item {
      flex-shrink:0;
      position:relative;
      overflow:hidden;
      border-radius:6px;
      border:1px solid var(--border-subtle);
      background:var(--surface-2);
    }
    .preview-tile-item canvas { display:block; width:100%; height:100%; }
    .preview-tile-label {
      position:absolute; bottom:0; left:0; right:0;
      padding:4px 6px;
      background:oklch(18% 0.015 264 / 0.65);
      color:#fff;
      font-family:'Archivo',sans-serif; font-weight:700; font-size:10px;
      text-align:center; backdrop-filter:blur(4px);
    }

    /* Scrubber canvas container */
    .scrubber-canvas-wrap {
      position:relative;
      flex-shrink:0;
      border-radius:6px;
      overflow:hidden;
      border:1px solid var(--border-subtle);
      background:var(--surface-2);
      cursor:crosshair;
    }
    .scrubber-canvas-wrap canvas { display:block; }

    /* Override canvas-stage overflow clipping and centering for our layout */
    #previewStage {
      overflow:visible;
      align-items:flex-start;
      justify-content:flex-start;
    }

    .carousel-preview-shell {
      background:transparent;
      border:none;
      box-shadow:none;
      width:100%;
      max-width:430px;
      position:relative;
      overflow:visible;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:20px;
    }
    .carousel-preview-ribbon {
      display:none;
    }
    .carousel-preview-tabs {
      z-index:100;
      display:flex;
      gap:4px;
      padding:4px;
      background:oklch(100% 0 0 / 0.75);
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
      border-radius:999px;
      border:1px solid oklch(100% 0 0 / 0.15);
      box-shadow:0 8px 32px oklch(0% 0 0 / 0.12);
      width:max-content;
      flex-shrink:0;
    }
    .carousel-preview-tab {
      padding:8px 16px;
      border-radius:999px;
      border:none;
      background:transparent;
      color:var(--text-secondary);
      font-family:'Archivo',sans-serif;
      font-size:12px;
      font-weight:700;
      cursor:pointer;
      transition:all 0.2s var(--ease-out-quart);
      white-space:nowrap;
    }
    .carousel-preview-tab.active {
      background:var(--text-primary);
      color:var(--surface-0);
      box-shadow:0 4px 12px oklch(0% 0 0 / 0.1);
    }
    .carousel-preview-close {
      position:absolute;
      top:20px;
      right:20px;
      z-index:110;
      width:36px;
      height:36px;
      border-radius:50%;
      border:1px solid oklch(100% 0 0 / 0.15);
      background:oklch(100% 0 0 / 0.75);
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
      color:var(--text-primary);
      font-size:14px;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 8px 32px oklch(0% 0 0 / 0.12);
      transition:transform 0.2s var(--ease-out-quart);
    }
    .carousel-preview-close:hover { transform:scale(1.1); }
    .carousel-preview-panel { padding:0; }
    .carousel-phone,
    .carousel-grid-phone {
      background:var(--surface-0);
      border-radius:20px;
      overflow:hidden;
      border:0.5px solid var(--border-subtle);
      box-shadow:0 8px 24px oklch(18% 0.015 264 / 0.08);
    }
    .carousel-phone-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:14px 16px 10px;
      border-bottom:0.5px solid var(--border-subtle);
    }
    .carousel-phone-user {
      display:flex;
      align-items:center;
      gap:10px;
    }
    .carousel-phone-avatar {
      width:34px;
      height:34px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:'Archivo',sans-serif;
      font-weight:900;
      font-size:10px;
      color:var(--brand);
      background:var(--surface-3);
      border:2px solid color-mix(in oklab, var(--brand) 35%, white);
    }
    .carousel-phone-name {
      font-family:'Archivo',sans-serif;
      font-weight:700;
      font-size:13px;
      color:var(--text-primary);
      line-height:1.2;
    }
    .carousel-phone-sub {
      font-family:'Archivo',sans-serif;
      font-size:10px;
      color:var(--text-tertiary);
      margin-top:1px;
    }
    .carousel-phone-menu,
    .carousel-icon-btn {
      background:none;
      border:none;
      cursor:pointer;
      padding:0;
      display:flex;
      align-items:center;
      justify-content:center;
      color:var(--text-secondary);
    }
    .carousel-phone-menu {
      font-size:20px;
      width:28px;
      height:28px;
    }
    .carousel-post-stage {
      position:relative;
      background:var(--surface-2);
    }
    .carousel-post-scroller {
      overflow:hidden;
      scrollbar-width:none;
      -ms-overflow-style:none;
      cursor:grab;
    }
    .carousel-post-scroller::-webkit-scrollbar { display:none; }
    .carousel-post-scroller.dragging { cursor:grabbing; }
    .carousel-post-track {
      display:flex;
      transform:translateX(0%);
    }
    .carousel-post-slide {
      flex:0 0 100%;
      position:relative;
      aspect-ratio:4 / 5;
      background:var(--surface-2);
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .carousel-post-slide img {
      width:100%;
      height:100%;
      object-fit:contain;
      display:block;
      user-select:none;
      -webkit-user-drag:none;
    }
    .carousel-slide-nav {
      position:absolute;
      top:50%;
      transform:translateY(-50%);
      width:36px;
      height:36px;
      border:none;
      border-radius:50%;
      background:oklch(18% 0.015 264 / 0.42);
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      z-index:2;
      backdrop-filter:blur(6px);
    }
    .carousel-slide-nav.prev { left:12px; }
    .carousel-slide-nav.next { right:12px; }
    .carousel-slide-nav[hidden] { display:none; }
    .carousel-post-meta { padding:10px 16px 16px; }
    .carousel-post-actions {
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:10px;
    }
    .carousel-post-icons { display:flex; align-items:center; gap:16px; }
    .carousel-post-pagination {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-bottom:10px;
    }
    .carousel-post-dots {
      display:flex;
      align-items:center;
      gap:6px;
      min-height:8px;
    }
    .carousel-post-dot {
      width:6px;
      height:6px;
      border-radius:50%;
      background:var(--border-mid);
    }
    .carousel-post-dot.active { background:var(--brand); }
    .carousel-post-count,
    .carousel-post-time {
      font-family:'Archivo',sans-serif;
      font-size:11px;
      color:var(--text-tertiary);
    }
    .carousel-post-caption {
      font-size:13px;
      line-height:1.5;
      color:var(--text-secondary);
    }
    .carousel-post-caption strong,
    .carousel-post-likes {
      font-family:'Archivo',sans-serif;
      color:var(--text-primary);
    }
    .carousel-post-likes {
      font-weight:800;
      font-size:13px;
      margin-bottom:4px;
    }
    .carousel-grid-preview-item {
      position:relative;
      background:var(--surface-2);
      aspect-ratio:3 / 4;
      overflow:hidden;
      cursor:pointer;
    }
    .carousel-grid-preview-item img {
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }
    .carousel-grid-preview-badge {
      position:absolute;
      top:8px;
      right:8px;
      width:28px;
      height:28px;
      border-radius:999px;
      background:oklch(18% 0.015 264 / 0.5);
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      backdrop-filter:blur(6px);
    }

    /* Quality slider disabled state */
    .quality-row.disabled { opacity:0.4; pointer-events:none; }
  `;
  document.head.appendChild(style);
})();

document.addEventListener("DOMContentLoaded", () => {

  /* ── Nav: mobile toggle ──────────────────────────────────────────────── */
  const toggle = document.getElementById("mobileToggle");
  const menu   = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ── Nav: dropdown ───────────────────────────────────────────────────── */
  document.querySelectorAll(".nav-dropdown-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const dd     = btn.closest(".nav-dropdown");
      const ddMenu = dd && dd.querySelector(".nav-dropdown-menu");
      if (!ddMenu) return;
      const isOpen = ddMenu.classList.toggle("force-open");
      btn.setAttribute("aria-expanded", String(isOpen));
      e.stopPropagation();
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-dropdown-menu.force-open").forEach((m) => {
      m.classList.remove("force-open");
      const btn = m.closest(".nav-dropdown")?.querySelector(".nav-dropdown-toggle");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  });

  /* ── Reveal animation ────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length > 0) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ── DOM refs ────────────────────────────────────────────────────────── */
  const uploadZone        = document.getElementById("uploadZone");
  const fileInput         = document.getElementById("fileInput");
  const fileInfo          = document.getElementById("fileInfo");
  const fileName          = document.getElementById("fileName");
  const uploadText        = document.getElementById("uploadText");
  const errMsg            = document.getElementById("errMsg");
  const infoRow           = document.getElementById("infoRow");
  const canvasSub         = document.getElementById("canvasSub");
  const previewStage      = document.getElementById("previewStage");
  const carouselPreviewBtn = document.getElementById("carouselPreviewBtn");
  const scrubberWrap      = document.getElementById("scrubberWrap");
  const previewScrollWrap = document.getElementById("previewScrollWrap");
  const previewTilesInner = document.getElementById("previewTilesInner");
  const scrubberCanvasWrap= document.getElementById("scrubberCanvasWrap");
  const downloadPanel     = document.getElementById("downloadPanel");
  const downloadGrid      = document.getElementById("downloadGrid");
  const dlAllBtn          = document.getElementById("dlAll");
  const statSlides        = document.getElementById("statSlides");
  const statFormat        = document.getElementById("statFormat");
  const statRatio         = document.getElementById("statRatio");
  const stepDown          = document.getElementById("stepDown");
  const stepUp            = document.getElementById("stepUp");
  const slideCountInput   = document.getElementById("slideCountInput");
  const slidePresetBtns   = document.querySelectorAll(".slide-preset-btn");
  const slideWarning      = document.getElementById("slideWarning");
  const bgFillColor       = document.getElementById("bgFillColor");
  const qualitySlider     = document.getElementById("qualitySlider");
  const qualityVal        = document.getElementById("qualityVal");
  const qualityRow        = qualitySlider?.closest(".quality-row") ?? null;
  const carouselPreviewModal = document.getElementById("carouselPreviewModal");
  const carouselPreviewClose = document.getElementById("carouselPreviewClose");
  const carouselPostTab = document.getElementById("carouselPostTab");
  const carouselGridTab = document.getElementById("carouselGridTab");
  const carouselPostPanel = document.getElementById("carouselPostPanel");
  const carouselGridPanel = document.getElementById("carouselGridPanel");
  const carouselPostScroller = document.getElementById("carouselPostScroller");
  const carouselPostTrack = document.getElementById("carouselPostTrack");
  const carouselPostDots = document.getElementById("carouselPostDots");
  const carouselPostCount = document.getElementById("carouselPostCount");
  const carouselPrevSlide = document.getElementById("carouselPrevSlide");
  const carouselNextSlide = document.getElementById("carouselNextSlide");
  const carouselGridPreviewGrid = document.getElementById("carouselGridPreviewGrid");
  const carouselGridPostCount = document.getElementById("carouselGridPostCount");

  /* ── Mutable scrubber canvas ref (replaced on each initScrubber) ─────── */
  let scrubCanvas = document.getElementById("scrubberCanvas");

  /* ── Document-level drag listener refs for clean removal ────────────── */
  let _onMove = null;
  let _onEnd  = null;

  /* ── State ───────────────────────────────────────────────────────────── */
  let loadedImage     = null;
  let inputMimeType   = "image/jpeg";
  let currentRatio    = "4x5";
  let currentFmt      = "same";
  let slideCount      = 3;
  let currentSlices   = [];
  let kofiShown       = false;
  let slidesDownloaded = 0;
  let totalSlides      = 0;
  let previewModalIndex = 0;
  let previewDragState = null;

  let winNX = 0;
  let winNY = 0;

  let imageOrientation = "landscape";
  let isDragging       = false;
  let dragStartX       = 0;
  let dragStartY       = 0;
  let dragStartWinNX   = 0;
  let dragStartWinNY   = 0;
  let rafPending       = false;

  const MIN_SLIDES     = 2;
  const MAX_SLIDES     = 999;
  const WARN_SLIDES    = 20;
  const TILE_PREVIEW_H = 220;

  /* ── Ko-fi ───────────────────────────────────────────────────────────── */
  function showKofiCard() {
    if (kofiShown) return;
    kofiShown = true;
    const card   = document.getElementById("kofiCard");
    const corner = document.getElementById("kofiCorner");
    if (!card) return;
    card.style.display = "flex";
    requestAnimationFrame(() => card.classList.add("visible"));
    const dismiss = () => {
      card.classList.remove("visible");
      setTimeout(() => { card.style.display = "none"; }, 300);
      if (corner) corner.style.display = "block";
    };
    document.getElementById("kofiClose").addEventListener("click", dismiss);
    setTimeout(dismiss, 7000);
  }

  function setPreviewTab(mode) {
    const isPost = mode === "post";
    carouselPostPanel.style.display = isPost ? "block" : "none";
    carouselGridPanel.style.display = isPost ? "none" : "block";
    carouselPostTab.classList.toggle("active", isPost);
    carouselGridTab.classList.toggle("active", !isPost);
    carouselPostTab.setAttribute("aria-selected", String(isPost));
    carouselGridTab.setAttribute("aria-selected", String(!isPost));
  }

  function updatePostPreviewNav() {
    const atStart = previewModalIndex <= 0;
    const atEnd = previewModalIndex >= Math.max(0, currentSlices.length - 1);
    carouselPrevSlide.hidden = atStart;
    carouselNextSlide.hidden = atEnd;
    carouselPostCount.textContent = `${Math.min(previewModalIndex + 1, Math.max(currentSlices.length, 1))} / ${Math.max(currentSlices.length, 1)}`;
    Array.from(carouselPostDots.children).forEach((dot, index) => {
      dot.classList.toggle("active", index === previewModalIndex);
    });
  }

  function scrollPostPreviewTo(index, behavior = "smooth") {
    if (!currentSlices.length) return;
    previewModalIndex = Math.max(0, Math.min(index, currentSlices.length - 1));
    const offset = -previewModalIndex * 100;
    if (behavior === "smooth") {
      carouselPostTrack.style.transition = "transform 0.3s ease-out";
    } else {
      carouselPostTrack.style.transition = "none";
    }
    carouselPostTrack.style.transform = `translateX(${offset}%)`;
    updatePostPreviewNav();
  }

  function buildPostPreview() {
    if (!carouselPostTrack) return;
    carouselPostTrack.innerHTML = "";
    carouselPostDots.innerHTML = "";

    currentSlices.forEach(({ canvas }, index) => {
      const slide = document.createElement("div");
      slide.className = "carousel-post-slide";
      const img = document.createElement("img");
      img.src = canvas.toDataURL(getOutputMime(), Number(qualitySlider.value) / 100);
      img.alt = `Carousel slide ${index + 1}`;
      slide.appendChild(img);
      carouselPostTrack.appendChild(slide);

      const dot = document.createElement("div");
      dot.className = "carousel-post-dot";
      carouselPostDots.appendChild(dot);
    });

    previewModalIndex = Math.min(previewModalIndex, Math.max(currentSlices.length - 1, 0));
    requestAnimationFrame(() => scrollPostPreviewTo(previewModalIndex, "auto"));
  }

  function buildGridPreview() {
    if (!carouselGridPreviewGrid) return;
    carouselGridPreviewGrid.innerHTML = "";
    carouselGridPostCount.textContent = currentSlices.length;

    // Only show the first image in grid preview
    if (currentSlices.length > 0) {
      const { canvas } = currentSlices[0];
      const srcW = canvas.width;
      const srcH = canvas.height;
      const targetRatio = 3 / 4;
      const cropW = Math.min(srcW, srcH * targetRatio);
      const cropX = Math.max(0, (srcW - cropW) / 2);

      const previewCanvas = document.createElement("canvas");
      previewCanvas.width = Math.round(cropW);
      previewCanvas.height = srcH;
      const ctx = previewCanvas.getContext("2d");
      ctx.drawImage(canvas, cropX, 0, cropW, srcH, 0, 0, previewCanvas.width, previewCanvas.height);

      const item = document.createElement("div");
      item.className = "carousel-grid-preview-item";
      const img = document.createElement("img");
      img.src = previewCanvas.toDataURL();
      img.alt = "Grid preview";
      item.appendChild(img);

      const badge = document.createElement("div");
      badge.className = "carousel-grid-preview-badge";
      badge.innerHTML = `<svg aria-label="Carousel" fill="currentColor" height="16" role="img" viewBox="0 0 48 48" width="16"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>`;
      item.appendChild(badge);
      item.addEventListener("click", () => {
        setPreviewTab("post");
        scrollPostPreviewTo(0, "smooth");
      });
      carouselGridPreviewGrid.appendChild(item);
    }
  }

  function openCarouselPreview() {
    if (!currentSlices.length) return;
    buildPostPreview();
    buildGridPreview();
    setPreviewTab("post");
    carouselPreviewModal.style.display = "block";
    document.body.style.overflow = "hidden";
    history.pushState({ modal: "carousel" }, "");
  }

  function closeCarouselPreview() {
    carouselPreviewModal.style.display = "none";
    document.body.style.overflow = "";
    if (history.state?.modal === "carousel") {
      history.back();
    }
  }

  /* ── Ratio helpers ───────────────────────────────────────────────────── */
  function getRatioDimensions() {
    return currentRatio === "4x5" ? { wRatio: 4, hRatio: 5 } : { wRatio: 3, hRatio: 4 };
  }

  function getCropWindowSize(imgW, imgH) {
    const { wRatio, hRatio } = getRatioDimensions();
    const combinedW_byH = (imgH * wRatio * slideCount) / hRatio;
    if (combinedW_byH <= imgW) {
      return { cropW: Math.round(combinedW_byH), cropH: imgH };
    } else {
      const combinedH_byW = (imgW * hRatio) / (wRatio * slideCount);
      return { cropW: imgW, cropH: Math.round(combinedH_byW) };
    }
  }

  function clampWindowPos(nx, ny, imgW, imgH) {
    const { cropW, cropH } = getCropWindowSize(imgW, imgH);
    const maxNX = imgW > cropW ? (imgW - cropW) / imgW : 0;
    const maxNY = imgH > cropH ? (imgH - cropH) / imgH : 0;
    return {
      nx: Math.max(0, Math.min(nx, maxNX)),
      ny: Math.max(0, Math.min(ny, maxNY)),
    };
  }

  /* ── Quality slider state ────────────────────────────────────────────── */
  function updateQualityState() {
    if (!qualityRow) return;
    const mime = getOutputMime();
    // Quality enabled for lossy formats: JPG and WEBP
    const isLossy = mime === "image/jpeg" || mime === "image/webp";
    qualityRow.classList.toggle("disabled", !isLossy);
  }

  /* ── Stepper ─────────────────────────────────────────────────────────── */
  function normalizeSlideCount(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return MIN_SLIDES;
    return Math.min(MAX_SLIDES, Math.max(MIN_SLIDES, parsed));
  }

  function setSlideCount(nextCount) {
    const normalized = normalizeSlideCount(nextCount);
    if (normalized === slideCount) {
      if (slideCountInput) slideCountInput.value = String(slideCount);
      return;
    }
    slideCount = normalized;
    updateStepperUI();
  }

  function updateStepperUI() {
    if (slideCountInput) slideCountInput.value = String(slideCount);
    stepDown.disabled = slideCount <= MIN_SLIDES;
    stepUp.disabled   = slideCount >= MAX_SLIDES;
    slideWarning.classList.toggle("visible", slideCount > WARN_SLIDES);
    statSlides.textContent = slideCount;
    slidePresetBtns.forEach((btn) => {
      const presetValue = Number.parseInt(btn.dataset.slides || "", 10);
      const isActive = presetValue === slideCount;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
    if (loadedImage) initAfterLoad(loadedImage);
  }

  stepDown.addEventListener("click", () => {
    if (slideCount > MIN_SLIDES) setSlideCount(slideCount - 1);
  });
  stepUp.addEventListener("click", () => {
    setSlideCount(slideCount + 1);
  });
  slideCountInput?.addEventListener("input", () => {
    const raw = slideCountInput.value.trim();
    if (!raw) return;
    setSlideCount(raw);
  });
  slideCountInput?.addEventListener("blur", () => {
    setSlideCount(slideCountInput.value);
  });
  slidePresetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setSlideCount(btn.dataset.slides);
    });
  });

  /* ── Ratio pills ─────────────────────────────────────────────────────── */
  document.getElementById("ratioPills").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill[data-ratio]");
    if (!btn) return;
    document.querySelectorAll("#ratioPills .pill").forEach((p) => {
      p.classList.remove("active"); p.setAttribute("aria-checked", "false");
    });
    btn.classList.add("active"); btn.setAttribute("aria-checked", "true");
    currentRatio = btn.dataset.ratio;
    statRatio.textContent = currentRatio === "4x5" ? "4:5" : "3:4";
    if (loadedImage) initAfterLoad(loadedImage);
  });

  /* ── Format pills ────────────────────────────────────────────────────── */
  document.getElementById("formatPills").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill[data-fmt]");
    if (!btn) return;
    document.querySelectorAll("#formatPills .pill").forEach((p) => {
      p.classList.remove("active"); p.setAttribute("aria-checked", "false");
    });
    btn.classList.add("active"); btn.setAttribute("aria-checked", "true");
    currentFmt = btn.dataset.fmt;
    updateFormatStat();
    updateQualityState();
    if (loadedImage) buildDownloadGrid();
  });

  function updateFormatStat() {
    if (currentFmt === "same") {
      const ext = inputMimeType === "image/png" ? "PNG"
                : inputMimeType === "image/webp" ? "WEBP" : "JPG";
      statFormat.textContent = ext;
    } else {
      statFormat.textContent = currentFmt.toUpperCase();
    }
  }

  /* ── Quality slider ──────────────────────────────────────────────────── */
  qualitySlider.addEventListener("input", () => {
    qualityVal.textContent = qualitySlider.value;
    if (loadedImage) buildDownloadGrid();
  });

  bgFillColor?.addEventListener("input", () => {
    if (!loadedImage) return;
    renderPreviewTiles();
    buildFullResSlices();
    buildDownloadGrid();
  });

  carouselPreviewBtn?.addEventListener("click", openCarouselPreview);
  carouselPreviewClose?.addEventListener("click", closeCarouselPreview);
  carouselPostTab?.addEventListener("click", () => setPreviewTab("post"));
  carouselGridTab?.addEventListener("click", () => setPreviewTab("grid"));
  carouselPrevSlide?.addEventListener("click", () => scrollPostPreviewTo(previewModalIndex - 1));
  carouselNextSlide?.addEventListener("click", () => scrollPostPreviewTo(previewModalIndex + 1));

  carouselPreviewModal?.addEventListener("click", (event) => {
    if (event.target === carouselPreviewModal) closeCarouselPreview();
  });

  carouselPostScroller?.addEventListener("pointerdown", (event) => {
    previewDragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
    };
  });

  const endPreviewDrag = (event) => {
    if (!previewDragState || previewDragState.pointerId !== event.pointerId) return;
    const delta = event.clientX - previewDragState.startX;
    previewDragState = null;
    
    // Simple swipe: threshold of 30px to trigger slide change
    if (Math.abs(delta) > 30) {
      if (delta > 0) {
        // Swiped right - go to previous slide
        scrollPostPreviewTo(previewModalIndex - 1);
      } else {
        // Swiped left - go to next slide
        scrollPostPreviewTo(previewModalIndex + 1);
      }
    } else {
      // Small swipe - just snap to current slide
      scrollPostPreviewTo(previewModalIndex);
    }
  };

  carouselPostScroller?.addEventListener("pointerup", endPreviewDrag);
  carouselPostScroller?.addEventListener("pointercancel", endPreviewDrag);

  document.addEventListener("keydown", (event) => {
    if (carouselPreviewModal?.style.display !== "block") return;
    if (event.key === "Escape") closeCarouselPreview();
    if (event.key === "ArrowLeft") scrollPostPreviewTo(previewModalIndex - 1);
    if (event.key === "ArrowRight") scrollPostPreviewTo(previewModalIndex + 1);
  });

  window.addEventListener("popstate", () => {
    if (carouselPreviewModal.style.display === "block") {
      closeCarouselPreview();
    }
  });

  /* ── Upload ──────────────────────────────────────────────────────────── */
  // uploadZone is a <label> wrapping fileInput — browser opens picker natively on click.
  // No JS click listener needed; adding one would cause double-trigger.
  // Keydown only for keyboard users since labels don't respond to Space/Enter by default.
  uploadZone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault(); uploadZone.classList.add("drag-over");
  });
  uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-over"));
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault(); uploadZone.classList.remove("drag-over");
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files?.[0]) handleFile(fileInput.files[0]);
    fileInput.value = ""; // allow re-selecting same file
  });

  function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      showError("Please upload an image file (JPG, PNG, WEBP, etc.)");
      return;
    }
    clearError();
    inputMimeType = file.type || "image/jpeg";
    updateFormatStat();
    updateQualityState();
    fileName.textContent = file.name;
    fileInfo.classList.add("show");
    uploadText.textContent = "Change photo";

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        imageOrientation = img.naturalWidth >= img.naturalHeight ? "landscape" : "portrait";

        // Reset to leftmost, vertically centered
        winNX = 0;
        const { cropH } = getCropWindowSize(img.naturalWidth, img.naturalHeight);
        winNY = img.naturalHeight > cropH
          ? ((img.naturalHeight - cropH) / 2) / img.naturalHeight
          : 0;

        initAfterLoad(img);
      };
      img.onerror = () => showError("Could not load the image.");
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ── Main init ───────────────────────────────────────────────────────── */
  function initAfterLoad(img) {
    const clamped = clampWindowPos(winNX, winNY, img.naturalWidth, img.naturalHeight);
    winNX = clamped.nx;
    winNY = clamped.ny;

    // Show stage first so clientWidth is readable inside initScrubber
    previewStage.style.display  = "block";
    downloadPanel.style.display = "block";
    if (carouselPreviewBtn) carouselPreviewBtn.style.display = "inline-flex";
    canvasSub.textContent = `${slideCount} slides · ${currentRatio === "4x5" ? "4:5" : "3:4"} ratio`;
    statSlides.textContent = slideCount;
    updateFormatStat();
    updateQualityState();
    updateInfoRow();

    setScrubberLayout();
    buildPreviewTiles();
    initScrubber();
    renderPreviewTiles();
    updatePreviewStageHeight();

    // Defer expensive full-res work so preview paints first
    setTimeout(() => {
      buildFullResSlices();
      buildDownloadGrid();
    }, 0);
  }

  /* ── Layout ──────────────────────────────────────────────────────────── */
  function setScrubberLayout() {
    scrubberWrap.classList.remove("layout-column", "layout-row");
    scrubberWrap.classList.add(imageOrientation === "portrait" ? "layout-row" : "layout-column");
  }
  function getPreviewStageInnerWidth() {

    const stageW = previewStage.clientWidth || 710;
    const stageStyle = window.getComputedStyle(previewStage);
    const padL = parseFloat(stageStyle.paddingLeft) || 0;
    const padR = parseFloat(stageStyle.paddingRight) || 0;
    return Math.max(0, stageW - padL - padR);
  }

  /* ── Calculate portrait sizing (for portrait layout only) ──────────────── */
  function calculatePortraitSizing() {
    if (imageOrientation !== "portrait") return null;
    
    const stageInner = getPreviewStageInnerWidth();
    
    const gap = 10;
    const { wRatio, hRatio } = getRatioDimensions();
    const img = loadedImage;
    
    // Calculate max tile height to fill available space perfectly
    // tileH * (imgW/imgH + 2.5 * wRatio/hRatio) + gap = stageInner
    const aspectSum = (img.naturalWidth / img.naturalHeight) + (2.5 * wRatio / hRatio);
    const maxTileH = Math.round((stageInner - gap) / aspectSum);
    
    // Canvas and tile dimensions
    const tileH = maxTileH;
    const tileW = Math.round(tileH * wRatio / hRatio);
    const scrubberCanvasW = Math.round(tileH * img.naturalWidth / img.naturalHeight);
    const scrubberCanvasH = tileH;
    
    // Let the preview viewport consume the real leftover width after rounding.
    const scrollAllocW = Math.max(tileW, stageInner - scrubberCanvasW - gap);
    
    return { tileH, tileW, scrollAllocW, scrubberCanvasW, scrubberCanvasH, gap };
  }

  /* ── Build preview tile DOM ──────────────────────────────────────────── */
  function buildPreviewTiles() {
    previewTilesInner.innerHTML = "";
    const { wRatio, hRatio } = getRatioDimensions();
    let portraitSizing = null;
    
    // In portrait mode, use pre-calculated dimensions; otherwise use default
    let tileH = TILE_PREVIEW_H;
    let tileW = Math.round((tileH * wRatio) / hRatio);
    let scrollAllocW = "100%";
    
    if (imageOrientation === "portrait") {
      portraitSizing = calculatePortraitSizing();
      if (portraitSizing) {
        tileH = portraitSizing.tileH;
        tileW = portraitSizing.tileW;
        scrollAllocW = portraitSizing.scrollAllocW + "px";
      }
    }

    // Set scroll wrap dimensions
    previewScrollWrap.style.width = scrollAllocW;
    previewScrollWrap.style.height = tileH + "px";
    previewTilesInner.style.height = tileH + "px";
    previewScrollWrap.scrollLeft = 0;

    const tileGap = parseFloat(window.getComputedStyle(previewTilesInner).columnGap) || 0;
    const contentW = (slideCount * tileW) + (Math.max(0, slideCount - 1) * tileGap);
    const viewportW = portraitSizing?.scrollAllocW || previewScrollWrap.clientWidth || contentW;
    previewTilesInner.style.width = Math.max(contentW, viewportW) + "px";

    // Center only when the full strip fits in the viewport.
    previewTilesInner.classList.toggle("centered", contentW <= viewportW);

    for (let i = 0; i < slideCount; i++) {
      const item = document.createElement("div");
      item.className = "preview-tile-item";
      item.style.width  = tileW + "px";
      item.style.height = tileH + "px";

      const c = document.createElement("canvas");
      c.width  = tileW;
      c.height = tileH;

      const label = document.createElement("div");
      label.className = "preview-tile-label";
      label.textContent = `Slide ${i + 1}`;

      item.appendChild(c);
      item.appendChild(label);
      previewTilesInner.appendChild(item);
    }
  }

  /* ── Render preview tiles only (cheap — called every RAF frame) ─────── */
  function renderPreviewTiles() {
    if (!loadedImage) return;
    const imgW = loadedImage.naturalWidth;
    const imgH = loadedImage.naturalHeight;
    const { wRatio, hRatio } = getRatioDimensions();
    const { cropW, cropH }   = getCropWindowSize(imgW, imgH);

    const srcX      = Math.round(winNX * imgW);
    const srcY      = Math.round(winNY * imgH);
    const tileItems = previewTilesInner.querySelectorAll(".preview-tile-item");
    const sliceSrcW = cropW / slideCount;

    for (let i = 0; i < slideCount; i++) {
      const item = tileItems[i];
      if (!item) continue;
      const pc = item.querySelector("canvas");
      if (!pc) continue;
      const tileW = pc.width;
      const tileH = pc.height;
      const pcCtx = pc.getContext("2d");
      pcCtx.clearRect(0, 0, tileW, tileH);
      if (bgFillColor?.value) {
        pcCtx.fillStyle = bgFillColor.value;
        pcCtx.fillRect(0, 0, tileW, tileH);
      }
      // Browser's canvas rendering handles downsampling efficiently
      pcCtx.drawImage(
        loadedImage,
        srcX + i * sliceSrcW, srcY, sliceSrcW, cropH,
        0, 0, tileW, tileH
      );
    }

    rafPending = false;
  }

  /* ── Build full-res slices (expensive — called only on mouseup + init) ── */
  function buildFullResSlices() {
    if (!loadedImage) return;
    const img  = loadedImage;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const { cropW, cropH } = getCropWindowSize(imgW, imgH);

    const srcX       = Math.round(winNX * imgW);
    const srcY       = Math.round(winNY * imgH);
    const sliceSrcW  = cropW / slideCount;
    const fullSliceW = Math.round(sliceSrcW);

    currentSlices = [];
    for (let i = 0; i < slideCount; i++) {
      const fc = document.createElement("canvas");
      fc.width  = fullSliceW;
      fc.height = cropH;
      const fcCtx = fc.getContext("2d");
      if (bgFillColor?.value) {
        fcCtx.fillStyle = bgFillColor.value;
        fcCtx.fillRect(0, 0, fullSliceW, cropH);
      }
      fcCtx.drawImage(
        img,
        srcX + i * sliceSrcW, srcY, sliceSrcW, cropH,
        0, 0, fullSliceW, cropH
      );
      currentSlices.push({ canvas: fc });
    }
  }

  /* ── Scrubber init ───────────────────────────────────────────────────── */
  function initScrubber() {
    // Remove previous document-level listeners before attaching new ones
    removeScrubberDocListeners();

    // Replace the canvas element inside the wrap — avoids cloneNode/replaceChild issues
    // and guarantees a clean grey-free canvas on every re-init
    const newCanvas  = document.createElement("canvas");
    newCanvas.id     = "scrubberCanvas";
    scrubberCanvasWrap.innerHTML = "";
    scrubberCanvasWrap.appendChild(newCanvas);
    scrubCanvas = newCanvas;

    const img  = loadedImage;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    let scrubW, scrubH;

    if (imageOrientation === "portrait") {
      // Use pre-calculated portrait sizing
      const portraitSizing = calculatePortraitSizing();
      if (portraitSizing) {
        scrubW = portraitSizing.scrubberCanvasW;
        scrubH = portraitSizing.scrubberCanvasH;
        
        // Set wrapper to match canvas dimensions
        scrubberCanvasWrap.style.width = scrubW + "px";
        scrubberCanvasWrap.style.height = scrubH + "px";
      }
    } else {
      // Column layout: scrubber below, fixed width, cap height
      const stageInner = getPreviewStageInnerWidth();
      
      scrubW = Math.min(stageInner, 600);
      scrubH = Math.round(scrubW * imgH / imgW);
      if (scrubH > 160) {
        scrubH = 160;
        scrubW = Math.round(scrubH * imgW / imgH);
      }
    }

    scrubCanvas.width  = scrubW;
    scrubCanvas.height = scrubH;
    
    // For landscape, set canvas wrap dimensions here; for portrait, already set above
    if (imageOrientation !== "portrait") {
      scrubberCanvasWrap.style.width  = scrubW + "px";
      scrubberCanvasWrap.style.height = scrubH + "px";
    }

    drawScrubber();
    attachScrubberEvents();
  }

  /* ── Draw scrubber overlay ───────────────────────────────────────────── */
  function drawScrubber() {
    if (!loadedImage || !scrubCanvas) return;
    const imgW   = loadedImage.naturalWidth;
    const imgH   = loadedImage.naturalHeight;
    const sW     = scrubCanvas.width;
    const sH     = scrubCanvas.height;
    const ctx    = scrubCanvas.getContext("2d");

    // Browser's canvas rendering handles downsampling efficiently
    ctx.drawImage(loadedImage, 0, 0, sW, sH);

    const { cropW, cropH } = getCropWindowSize(imgW, imgH);
    const winSX = Math.round(winNX * sW);
    const winSY = Math.round(winNY * sH);
    const winSW = Math.round((cropW / imgW) * sW);
    const winSH = Math.round((cropH / imgH) * sH);

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    if (winSY > 0)           ctx.fillRect(0, 0, sW, winSY);
    if (winSY + winSH < sH)  ctx.fillRect(0, winSY + winSH, sW, sH - (winSY + winSH));
    ctx.fillRect(0, winSY, winSX, winSH);
    if (winSX + winSW < sW)  ctx.fillRect(winSX + winSW, winSY, sW - (winSX + winSW), winSH);

    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth   = 1;
    for (let i = 1; i < slideCount; i++) {
      const dx = winSX + Math.round((winSW / slideCount) * i);
      ctx.beginPath(); ctx.moveTo(dx, winSY); ctx.lineTo(dx, winSY + winSH); ctx.stroke();
    }

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(winSX + 0.75, winSY + 0.75, winSW - 1.5, winSH - 1.5);
  }

  /* ── Scrubber event management ───────────────────────────────────────── */
  function removeScrubberDocListeners() {
    if (_onMove) {
      document.removeEventListener("mousemove", _onMove);
      document.removeEventListener("touchmove",  _onMove);
      _onMove = null;
    }
    if (_onEnd) {
      document.removeEventListener("mouseup",  _onEnd);
      document.removeEventListener("touchend", _onEnd);
      _onEnd = null;
    }
  }

  function attachScrubberEvents() {
    const wrap = scrubberCanvasWrap;

    function getPos(e) {
      const rect    = wrap.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top)  / rect.height,
      };
    }

    function onStart(e) {
      e.preventDefault();
      isDragging     = true;
      const pos      = getPos(e);
      dragStartX     = pos.x;
      dragStartY     = pos.y;
      dragStartWinNX = winNX;
      dragStartWinNY = winNY;
    }

    _onMove = function (e) {
      if (!isDragging) return;
      e.preventDefault();
      const pos     = getPos(e);
      const raw     = {
        nx: dragStartWinNX + (pos.x - dragStartX),
        ny: dragStartWinNY + (pos.y - dragStartY),
      };
      const clamped = clampWindowPos(raw.nx, raw.ny, loadedImage.naturalWidth, loadedImage.naturalHeight);
      winNX = clamped.nx;
      winNY = clamped.ny;
      drawScrubber();
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => renderPreviewTiles());
      }
    };

    _onEnd = function () {
      if (!isDragging) return;
      isDragging = false;
      renderPreviewTiles();
      buildFullResSlices();
      buildDownloadGrid();
    };

    wrap.addEventListener("mousedown",  onStart);
    wrap.addEventListener("touchstart", onStart, { passive: false });
    document.addEventListener("mousemove", _onMove);
    document.addEventListener("touchmove",  _onMove, { passive: false });
    document.addEventListener("mouseup",   _onEnd);
    document.addEventListener("touchend",  _onEnd);
  }

  /* ── Build download grid ─────────────────────────────────────────────── */
  function buildDownloadGrid() {
    if (!loadedImage || currentSlices.length === 0) return;
    slidesDownloaded = 0;
    totalSlides = currentSlices.length;
    downloadGrid.innerHTML = "";
    const mime    = getOutputMime();
    const quality = Number(qualitySlider.value) / 100;
    const ext     = getFileExt(mime);
    const { wRatio, hRatio } = getRatioDimensions();

    currentSlices.forEach(({ canvas }, i) => {
      const num = i + 1;

      const thumb    = document.createElement("article");
      thumb.className = "download-thumb";

      const thumbImg = document.createElement("div");
      thumbImg.className      = "download-thumb-img";
      thumbImg.style.aspectRatio = `${wRatio}/${hRatio}`;

      const dataUrl = canvas.toDataURL(mime, quality);
      const filename = `carousel-slide-${num}.${ext}`;

      const imgEl   = document.createElement("img");
      imgEl.src     = dataUrl;
      imgEl.alt     = `Slide ${num}`;
      imgEl.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
      thumbImg.appendChild(imgEl);

      const foot    = document.createElement("div");
      foot.className = "download-thumb-foot";

      const numLabel = document.createElement("div");
      numLabel.className   = "download-thumb-num";
      numLabel.textContent = `Slide ${num}`;

      const dlBtn   = document.createElement("button");
      dlBtn.className   = "btn btn-ghost";
      dlBtn.type = "button";
      dlBtn.style.cssText = "padding:8px 12px;font-size:var(--text-xs);";
      dlBtn.textContent = "↓ Save";
      dlBtn.addEventListener("click", () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            triggerDownload(blob, filename);
            slidesDownloaded++;
            if (slidesDownloaded >= totalSlides) showKofiCard();
          },
          mime, quality
        );
      });

      foot.appendChild(numLabel);
      foot.appendChild(dlBtn);
      thumb.appendChild(thumbImg);
      thumb.appendChild(foot);
      dlBtn.textContent = "Download";
      thumb.addEventListener("click", () => {
        triggerDownload(dataUrl, filename);
        slidesDownloaded++;
        if (slidesDownloaded >= totalSlides) showKofiCard();
      });
      dlBtn.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      downloadGrid.appendChild(thumb);
    });
  }

  /* ── Download all ZIP ────────────────────────────────────────────────── */
  dlAllBtn.addEventListener("click", async () => {
    const mime    = getOutputMime();
    const quality = Number(qualitySlider.value) / 100;
    const ext     = getFileExt(mime);

    dlAllBtn.disabled    = true;
    dlAllBtn.textContent = "Preparing…";

    try {
      const zip      = new JSZip();
      const promises = currentSlices.map(({ canvas }, i) =>
        new Promise((res, rej) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) { rej(new Error("Blob failed")); return; }
              blob.arrayBuffer().then((ab) => {
                zip.file(`carousel-slide-${i + 1}.${ext}`, ab);
                res();
              });
            },
            mime, quality
          );
        })
      );
      await Promise.all(promises);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      triggerDownload(zipBlob, "carousel-slides.zip");
      showKofiCard();
    } catch (err) {
      showError("Download failed. Please try again.");
      console.error(err);
    } finally {
      dlAllBtn.disabled = false;
      dlAllBtn.innerHTML = `Download All <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 2v7M4 7l3 3 3-3M2 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
  });

  /* ── Info row ────────────────────────────────────────────────────────── */
  function updateInfoRow() {
    if (!loadedImage) return;
    const imgW = loadedImage.naturalWidth;
    const imgH = loadedImage.naturalHeight;
    const { cropW, cropH } = getCropWindowSize(imgW, imgH);
    const sliceW = Math.round(cropW / slideCount);

    infoRow.innerHTML = [
      { label: "Source",     value: `${imgW} × ${imgH}px` },
      { label: "Slide size", value: `${sliceW} × ${cropH}px` },
      { label: "Slides",     value: slideCount },
    ].map(
      ({ label, value }) =>
        `<div class="panel" style="padding:14px 16px;font-size:var(--text-xs);font-family:'Archivo',sans-serif;">${label}: <span>${value}</span></div>`
    ).join("");

    const minW = 1080;
    const minH = currentRatio === "3x4" ? 1440 : 1350;
    if (sliceW < minW || cropH < minH) {
      const warn = document.createElement("div");
      warn.style.cssText = `
        grid-column: 1 / -1;
        padding: 12px 16px;
        font-size: var(--text-xs);
        font-family: 'Archivo', sans-serif;
        background: var(--warning-bg);
        border: 1px solid var(--warning-border);
        border-radius: var(--radius);
        color: var(--warning-text);
      `;
      warn.textContent = `Slides will export at ${sliceW}x${cropH}px. For best Instagram quality, use a larger source image (${minW}x${minH}px recommended per slide).`;
      infoRow.appendChild(warn);
    }
  }

  /* ── Format helpers ──────────────────────────────────────────────────── */
  function getOutputMime() {
    if (currentFmt === "jpg")  return "image/jpeg";
    if (currentFmt === "png")  return "image/png";
    if (currentFmt === "webp") return "image/webp";
    return inputMimeType || "image/jpeg";
  }

  function getFileExt(mime) {
    if (mime === "image/png")  return "png";
    if (mime === "image/webp") return "webp";
    return "jpg";
  }

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function triggerDownload(source, filename) {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const a   = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    if (typeof source !== "string") {
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
  }

  function showError(msg) {
    errMsg.textContent   = msg;
    errMsg.style.display = "block";
  }

  function clearError() {
    errMsg.textContent   = "";
    errMsg.style.display = "none";
  }

  /* ── Responsive layout updates ───────────────────────────────────────────── */
  function updateLayoutForResize() {
    if (!loadedImage) return;
    
    // Recalculate and re-initialize layout for portrait mode
    if (imageOrientation === "portrait") {
      buildPreviewTiles();
      initScrubber();
      renderPreviewTiles();
    } else {
      // For landscape, just reinitialize scrubber in case stage width changed
      initScrubber();
      renderPreviewTiles();
    }
    
    updatePreviewStageHeight();
  }

  function updatePreviewStageHeight() {
    if (!loadedImage || !scrubberWrap) return;
    
    // Set preview stage min-height to fit scrubber wrap content
    const scrubWrapHeight = scrubberWrap.offsetHeight;
    previewStage.style.minHeight = scrubWrapHeight + "px";
  }

  // Debounced resize listener for responsive layout
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateLayoutForResize();
    }, 100);
  });

  /* ── Boot ────────────────────────────────────────────────────────────── */
  updateStepperUI();
  updateQualityState();
});
