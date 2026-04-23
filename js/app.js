document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("mobileToggle");
  const menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length > 0) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    revealElements.forEach((el) => io.observe(el));
  } else {
    document
      .querySelectorAll(".hero, .nav, .sidebar, .canvas-area")
      .forEach((el) => el.classList.add("is-visible"));
  }

  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");
  const fileInfo = document.getElementById("fileInfo");
  const fileName = document.getElementById("fileName");
  const mainContent = document.getElementById("mainContent");
  const errMsg = document.getElementById("errMsg");
  const infoRow = document.getElementById("infoRow");
  const origCanvas = document.getElementById("origCanvas");
  const overlaySvg = document.getElementById("overlaySvg");
  const previewWrap = document.getElementById("previewWrap");
  const mainStage = document.getElementById("mainContent");
  const canvasSub = document.getElementById("canvasSub");
  const downloadPanel = document.getElementById("downloadPanel");
  const downloadGrid = document.getElementById("downloadGrid");
  const statSlices = document.getElementById("statSlices");
  const downloadIntro = document.getElementById("downloadCopy");
  const postingNoteText = document.getElementById("postingNoteText");
  const statFormat = document.getElementById("statFormat");
  const statMode = document.getElementById("statMode");
  const manualOverlapCb = document.getElementById("manualOverlapCb");
  const manualOverlapInput = document.getElementById("manualOverlapInput");
  const manualOverlapGroup = document.getElementById("manualOverlapGroup");
  const qualityGroup = document.getElementById("qualityGroup");
  const qualitySlider = document.getElementById("qualitySlider");
  const qualityVal = document.getElementById("qualityVal");
  const gridColsInput = document.getElementById("gridColsInput");
  const gridRowsInput = document.getElementById("gridRowsInput");
  const downloadAllBtn = document.getElementById("dlAll");

  let currentLoadedImage = null;
  let currentInputFormat = "image/jpeg";
  let currentFormatMode = "same";
  let currentRatio = "4x5";
  let currentGrid = { cols: 3, rows: 1 };
  let currentSlices = [];
  let kofiShown = false;
  let tilesDownloaded = 0;
  let totalTiles = 0;

  function showKofiCard() {
      if (kofiShown) return;
      kofiShown = true;
      const card = document.getElementById('kofiCard');
      const corner = document.getElementById('kofiCorner');
      if (!card) return;
      card.style.display = 'flex';
      requestAnimationFrame(() => card.classList.add('visible'));
      const dismiss = () => {
          card.classList.remove('visible');
          setTimeout(() => { card.style.display = 'none'; }, 300);
          if (corner) corner.style.display = 'block';
      };
      document.getElementById('kofiClose').addEventListener('click', dismiss);
      setTimeout(dismiss, 7000);
  }

  // Manual overlay positioning state (in image-pixel coordinates).
  // offsetX/Y are deltas applied to the entire group of tiles.
  // scale multiplies the tile dimensions while locking the ratio.
  let overlayOffset = { x: 0, y: 0 };
  let overlayScale = 1.0;
  let overlayBaseZones = null; // zones produced by calculateZones() before offset/scale
  let overlaySelected = false;
  const resetOverlayBtn = document.getElementById("resetOverlayBtn");

  const formatPills = Array.from(document.querySelectorAll(".pill[data-fmt]"));
  const ratioPills = Array.from(document.querySelectorAll(".pill[data-ratio]"));
  const gridPresetPills = Array.from(
    document.querySelectorAll(".pill[data-grid-preset]"),
  );

  updateUiState();

  if (uploadZone && fileInput) {
    uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadZone.classList.add("drag-over");
    });
    uploadZone.addEventListener("dragleave", () =>
      uploadZone.classList.remove("drag-over"),
    );
    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadZone.classList.remove("drag-over");
      handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));
  }

  if (manualOverlapCb && manualOverlapInput) {
    manualOverlapCb.addEventListener("change", () => {
      manualOverlapInput.disabled = !manualOverlapCb.checked;
      if (currentLoadedImage) {
        processImage(currentLoadedImage);
      } else {
        updateUiState();
      }
    });
    manualOverlapInput.addEventListener("input", () => {
      if (currentLoadedImage && manualOverlapCb.checked) {
        processImage(currentLoadedImage);
      }
    });
  }

  ratioPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      ratioPills.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-checked", "false");
      });
      pill.classList.add("active");
      pill.setAttribute("aria-checked", "true");
      currentRatio = pill.dataset.ratio;
      if (currentRatio === "3x4" && manualOverlapCb) {
        manualOverlapCb.checked = false;
        manualOverlapInput.disabled = true;
      }
      updateUiState();
      if (currentLoadedImage) {
        processImage(currentLoadedImage);
      }
    });
  });

  formatPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      formatPills.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-checked", "false");
      });
      pill.classList.add("active");
      pill.setAttribute("aria-checked", "true");
      currentFormatMode = pill.dataset.fmt;
      updateUiState();
    });
  });

  gridPresetPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      setGridPreset(pill.dataset.gridPreset);
      if (currentLoadedImage) {
        processImage(currentLoadedImage);
      } else {
        updateUiState();
      }
    });
  });

  if (gridRowsInput) {
    gridRowsInput.addEventListener("input", () => {
      currentGrid.rows = clampGridRows(gridRowsInput.value);
      updateGridPresetState();
      if (currentLoadedImage) {
        processImage(currentLoadedImage);
      } else {
        updateUiState();
      }
    });
  }

  if (qualitySlider) {
    qualitySlider.addEventListener("input", () => {
      if (qualityVal) {
        qualityVal.textContent = qualitySlider.value;
      }
    });
  }

  window.addEventListener("resize", () => {
    if (currentLoadedImage) {
      fitPreviewToStage(currentLoadedImage);
    }
  });

  function clampGridRows(value) {
    const rows = parseInt(value, 10);
    return Number.isFinite(rows) ? Math.max(1, Math.min(6, rows)) : 1;
  }

  function setGridPreset(preset) {
    const [colsText, rowsText] = preset.split("x");
    currentGrid = {
      cols: parseInt(colsText, 10) || 3,
      rows: clampGridRows(rowsText),
    };
    if (gridColsInput) {
      gridColsInput.value = String(currentGrid.cols);
    }
    if (gridRowsInput) {
      gridRowsInput.value = String(currentGrid.rows);
    }
    updateGridPresetState(preset);
  }

  function updateGridPresetState(activePreset) {
    const preset = activePreset || `${currentGrid.cols}x${currentGrid.rows}`;
    gridPresetPills.forEach((btn) => {
      const isActive = btn.dataset.gridPreset === preset;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-checked", String(isActive));
    });
    if (gridRowsInput) {
      gridRowsInput.value = String(currentGrid.rows);
    }
  }

  function resolveOutputFormat() {
    if (currentFormatMode === "same") {
      return currentInputFormat || "image/png";
    }
    if (currentFormatMode === "png") {
      return "image/png";
    }
    if (currentFormatMode === "webp") {
      return "image/webp";
    }
    return "image/jpeg";
  }

  function updateUiState() {
    const resolvedFormat = resolveOutputFormat();

    if (statFormat) {
      statFormat.textContent =
        resolvedFormat === "image/png"
          ? "PNG"
          : resolvedFormat === "image/webp"
            ? "WEBP"
            : "JPG";
    }

    if (statMode) {
      statMode.textContent = getModeLabel();
    }

    if (statSlices) {
      statSlices.textContent = String(currentGrid.cols * currentGrid.rows);
    }

    if (manualOverlapGroup) {
      manualOverlapGroup.style.display =
        currentRatio === "4x5" ? "block" : "none";
    }

    if (qualityGroup && qualitySlider) {
      const isPng = resolvedFormat === "image/png";
      qualityGroup.style.opacity = isPng ? "0.4" : "1";
      qualitySlider.disabled = isPng;
    }

    updateGridPresetState();
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showErr("Please upload a JPG, PNG, or WEBP image file.");
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      currentLoadedImage = img;
      currentInputFormat = normalizeInputFormat(file.type);
      updateUiState();
      if (fileInfo) {
        fileInfo.classList.add("show");
      }
      if (fileName) {
        fileName.textContent = file.name;
      }
      processImage(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      showErr("Could not load that image.");
    };

    img.src = url;
  }

  function normalizeInputFormat(mimeType) {
    if (
      mimeType === "image/png" ||
      mimeType === "image/webp" ||
      mimeType === "image/jpeg"
    ) {
      return mimeType;
    }
    return "image/png";
  }

  function getModeLabel() {
    const gridLabel = `${currentGrid.cols}x${currentGrid.rows}`;
    if (currentRatio === "3x4") {
      return `${gridLabel} Simple`;
    }
    if (manualOverlapCb && manualOverlapCb.checked) {
      return `${gridLabel} Precision`;
    }
    return `${gridLabel} Profile`;
  }

  function showErr(message) {
    if (errMsg) {
      errMsg.textContent = message;
      errMsg.style.display = "block";
    }
  }

  function clearErr() {
    if (errMsg) {
      errMsg.textContent = "";
      errMsg.style.display = "none";
    }
  }

  function updateResetBtnVisibility() {
    if (!resetOverlayBtn) return;
    const isDefault = overlayOffset.x === 0 && overlayOffset.y === 0 && overlayScale === 1.0;
    resetOverlayBtn.style.display = "block";
    resetOverlayBtn.disabled = isDefault;
    resetOverlayBtn.style.opacity = isDefault ? "0.35" : "1";
    resetOverlayBtn.style.pointerEvents = isDefault ? "none" : "auto";
    resetOverlayBtn.style.cursor = isDefault ? "default" : "pointer";
  }

  function processImage(img, keepOverlay = false) {
    clearErr();

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const useManual =
      currentRatio === "4x5" && manualOverlapCb
        ? manualOverlapCb.checked
        : false;
    const manualVal = manualOverlapInput
      ? parseFloat(manualOverlapInput.value) || 0
      : 0;
    const zones = calculateZones(imgW, imgH, useManual ? manualVal : null);

    // Reset overlay positioning whenever settings change (not when dragging).
    if (!keepOverlay) {
      overlayOffset = { x: 0, y: 0 };
      overlayScale = 1.0;
    }
    overlayBaseZones = zones;

    const adjustedZones = applyOverlayTransform(zones, imgW, imgH);

    drawOriginal(img, imgW, imgH, adjustedZones);
    currentSlices = generateSlices(img, adjustedZones);
    renderDownloadGrid(currentSlices);
    showInfo(
      imgW,
      imgH,
      adjustedZones.tileW,
      adjustedZones.tileH,
      adjustedZones.calculatedOverlap,
      useManual,
      adjustedZones.fitMode,
    );

    if (mainContent) {
      mainContent.style.display = "flex";
      updateResetBtnVisibility();
    }
    if (previewWrap) {
      previewWrap.style.display = "block";
    }
    fitPreviewToStage(img);
    if (downloadPanel) {
      downloadPanel.style.display = "block";
    }
    if (canvasSub) {
      canvasSub.textContent = getSubtitle(useManual);
    }
    if (downloadIntro) {
      downloadIntro.textContent = getDownloadIntro();
    }
    if (postingNoteText) {
      postingNoteText.innerHTML = getPostingOrderText();
    }
    updateUiState();
  }

  function getSubtitle(useManual) {
    const gridLabel = `${currentGrid.cols}x${currentGrid.rows}`;
    if (currentRatio === "3x4") {
      return currentGrid.rows === 1
        ? `${gridLabel} simple 3:4 cuts with no overlap.`
        : `${gridLabel} simple grid cuts with no overlap.`;
    }
    if (useManual) {
      return currentGrid.rows === 1
        ? `${gridLabel} advanced preview shows the true left, center, and right 4:5 export regions.`
        : `${gridLabel} advanced preview shows the true 4:5 export regions for every tile.`;
    }
    return currentGrid.rows === 1
      ? `${gridLabel} exports are generated as left, center, and right 4:5 posts aligned for Instagram profile preview.`
      : `${gridLabel} exports are generated as 4:5 tiles aligned for Instagram profile preview.`;
  }

  function getDownloadIntro() {
    const totalTiles = currentGrid.cols * currentGrid.rows;
    return totalTiles === 3
      ? "Review each crop, then save a single tile or package all three together."
      : `Review each crop, then save individual tiles or package all ${totalTiles} together.`;
  }

  function getPostingOrderSequence() {
    return [...currentSlices]
      .sort((a, b) => b.row - a.row || b.col - a.col)
      .map((slice, index) => ({
        ...slice,
        uploadOrder: index + 1,
      }));
  }

  function getUploadOrderForSlice(slice) {
    const orderedSlices = getPostingOrderSequence();
    const match = orderedSlices.find(
      (orderedSlice) => orderedSlice.index === slice.index,
    );
    return match ? match.uploadOrder : null;
  }

  function getPostingOrderText() {
    const orderedSlices = getPostingOrderSequence();

    if (currentGrid.rows === 1) {
      const labels = ["right", "center", "left"];
      const sequenceText = labels
        .map((label, index) => `#${index + 1} ${label}`)
        .join(" → ");
      return `<strong>Posting order:</strong> Publish right first, then center, then left so the finished triptych lands correctly on your profile grid. <span>Sequence: ${sequenceText}</span>`;
    }

    const sequenceText = orderedSlices
      .map(
        (slice) =>
          `#${slice.uploadOrder} Tile ${String(slice.index).padStart(2, "0")}`,
      )
      .join(" → ");

    return `<strong>Posting order:</strong> Upload tiles from the bottom-right corner to the top-left corner so the finished multi-row grid lands correctly on your profile. <span>Sequence: ${sequenceText}</span>`;
  }

  function calculateZones(imgW, imgH, manualOverlapOverride) {
    const rows = currentGrid.rows;
    const rowHeight = imgH / rows;
    const rowZones = [];
    let tileW = 0;
    let tileH = 0;
    let overlap = 0;
    let fitMode = "Height Fit";

    // Pre-compute fittedHeight once — it is identical for every row because
    // rowHeight is equal across all rows.
    const manualOverlapNorm =
      manualOverlapOverride === null
        ? null
        : Math.max(manualOverlapOverride, 0);
    const fittedHeight =
      currentRatio === "3x4"
        ? Math.min(rowHeight, imgW / 2.25)
        : calculateFittedCropHeight(imgW, rowHeight, manualOverlapNorm);

    // Build offsetY values from the image's vertical centre outward so that
    // adjacent rows always touch with zero gap.
    const centerY = imgH / 2;
    const rowOffsets = [];

    if (rows % 2 === 0) {
      // Even: the two middle rows meet exactly at the vertical centre.
      //   row (n/2 - 1) → bottom edge at centerY
      //   row (n/2)     → top    edge at centerY
      const halfRows = rows / 2;
      for (let i = 0; i < rows; i++) {
        rowOffsets.push(centerY + (i - halfRows) * fittedHeight);
      }
    } else {
      // Odd: the centre row sits symmetrically on the vertical centre.
      // Rows above extend upward from its top edge; rows below extend
      // downward from its bottom edge.
      const middleIndex = Math.floor(rows / 2);
      const middleOffsetY = centerY - fittedHeight / 2;
      for (let i = 0; i < rows; i++) {
        rowOffsets.push(middleOffsetY + (i - middleIndex) * fittedHeight);
      }
    }

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const offsetY = rowOffsets[rowIndex];
      const zone =
        currentRatio === "3x4"
          ? calculateSimpleRowZones(imgW, rowHeight, fittedHeight, offsetY)
          : calculateFourByFiveRowZones(
              imgW,
              rowHeight,
              fittedHeight,
              offsetY,
              manualOverlapOverride,
            );
      rowZones.push(zone);
      tileW = zone.tileW;
      tileH = zone.tileH;
      overlap = zone.calculatedOverlap;
      fitMode = zone.fitMode;
    }

    return {
      rows: rowZones,
      tileW,
      tileH,
      calculatedOverlap: overlap,
      fitMode,
    };
  }

  // fittedHeight and offsetY are now pre-computed by calculateZones.
  function calculateSimpleRowZones(imgW, rowHeight, fittedHeight, offsetY) {
    const cropWidth = fittedHeight * (3 / 4);
    const totalWidth = cropWidth * 3;
    const offsetX = (imgW - totalWidth) / 2;

    return {
      tiles: [0, 1, 2].map((index) => ({
        sx: Math.round(offsetX + cropWidth * index),
        sy: Math.round(offsetY),
        sw: Math.round(cropWidth),
        sh: Math.round(fittedHeight),
      })),
      previewTiles: [0, 1, 2].map((index) => ({
        sx: Math.round(offsetX + cropWidth * index),
        sy: Math.round(offsetY),
        sw: Math.round(cropWidth),
        sh: Math.round(fittedHeight),
      })),
      tileW: Math.round(cropWidth),
      tileH: Math.round(fittedHeight),
      calculatedOverlap: 0,
      fitMode:
        Math.abs(fittedHeight - rowHeight) < 0.5 ? "Height Fit" : "Width Fit",
    };
  }

  // fittedHeight and offsetY are now pre-computed by calculateZones.
  function calculateFourByFiveRowZones(
    imgW,
    rowHeight,
    fittedHeight,
    offsetY,
    manualOverlapOverride,
  ) {
    const midX = imgW / 2;
    const manualOverlap =
      manualOverlapOverride === null
        ? null
        : Math.max(manualOverlapOverride, 0);
    const profilePreviewWidth = fittedHeight * (3 / 4);
    const postDetailWidth = fittedHeight * (4 / 5);

    const postCenterStartX = midX - postDetailWidth / 2;
    const postCenterEndX = midX + postDetailWidth / 2;

    let postLeftEndX;
    let postRightStartX;
    let displayOverlap;

    if (manualOverlap === null) {
      const previewCenterStartX = midX - profilePreviewWidth / 2;
      const previewCenterEndX = midX + profilePreviewWidth / 2;
      displayOverlap = postDetailWidth - profilePreviewWidth;
      const autoOverlapOffset = previewCenterStartX - postCenterStartX;
      postLeftEndX = previewCenterStartX + autoOverlapOffset;
      postRightStartX = previewCenterEndX - autoOverlapOffset;
    } else {
      displayOverlap = manualOverlap;
      postLeftEndX = postCenterStartX + displayOverlap;
      postRightStartX = postCenterEndX - displayOverlap;
    }

    const postLeftStartX = postLeftEndX - postDetailWidth;
    const postRightEndX = postRightStartX + postDetailWidth;
    const totalOverlayWidth = postRightEndX - postLeftStartX;

    const exportTiles = [
      {
        sx: Math.round(postLeftStartX),
        sy: Math.round(offsetY),
        sw: Math.round(postDetailWidth),
        sh: Math.round(fittedHeight),
      },
      {
        sx: Math.round(postCenterStartX),
        sy: Math.round(offsetY),
        sw: Math.round(postDetailWidth),
        sh: Math.round(fittedHeight),
      },
      {
        sx: Math.round(postRightStartX),
        sy: Math.round(offsetY),
        sw: Math.round(postDetailWidth),
        sh: Math.round(fittedHeight),
      },
    ];

    let previewTiles;
    if (manualOverlapCb && manualOverlapCb.checked) {
      // Manual overlap: preview must mirror the actual export tile positions
      // so the user sees the true overlap in the canvas preview.
      previewTiles = [
        {
          sx: Math.round(postLeftStartX),
          sy: Math.round(offsetY),
          sw: Math.round(postDetailWidth),
          sh: Math.round(fittedHeight),
        },
        {
          sx: Math.round(postCenterStartX),
          sy: Math.round(offsetY),
          sw: Math.round(postDetailWidth),
          sh: Math.round(fittedHeight),
        },
        {
          sx: Math.round(postRightStartX),
          sy: Math.round(offsetY),
          sw: Math.round(postDetailWidth),
          sh: Math.round(fittedHeight),
        },
      ];
    } else {
      // Auto overlap: show the profile-preview crop (no overlap, side-by-side)
      const previewCropWidth = Math.round(profilePreviewWidth);
      const previewOffsetX =
        postCenterStartX + postDetailWidth / 2 - (previewCropWidth * 3) / 2;
      previewTiles = [0, 1, 2].map((index) => ({
        sx: Math.round(previewOffsetX + previewCropWidth * index),
        sy: Math.round(offsetY),
        sw: previewCropWidth,
        sh: Math.round(fittedHeight),
      }));
    }

    return {
      tiles: exportTiles,
      previewTiles,
      tileW: Math.round(postDetailWidth),
      tileH: Math.round(fittedHeight),
      calculatedOverlap: displayOverlap,
      fitMode:
        Math.abs(fittedHeight - rowHeight) < 0.5 || totalOverlayWidth < imgW
          ? "Height Fit"
          : "Width Fit",
    };
  }

  function calculateFittedCropHeight(imgW, rowHeight, manualOverlap) {
    if (manualOverlap === null) {
      return Math.min(rowHeight, imgW / 2.3);
    }
    const overlap = Math.max(manualOverlap, 0);
    const maxHeightFromWidth = (imgW + 2 * overlap) / 2.4;
    return Math.min(rowHeight, maxHeightFromWidth);
  }

  // ─── Overlay transform ───────────────────────────────────────────────────
  
  function applyOverlayTransform(zones, imgW, imgH) {
    if (overlayOffset.x === 0 && overlayOffset.y === 0 && overlayScale === 1.0) {
      return zones;
    }

    const s = overlayScale;

    // Find the center of the entire base group (all tiles across all rows)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    zones.rows.forEach((row) => {
      row.tiles.forEach((t) => {
        minX = Math.min(minX, t.sx);
        minY = Math.min(minY, t.sy);
        maxX = Math.max(maxX, t.sx + t.sw);
        maxY = Math.max(maxY, t.sy + t.sh);
      });
    });
    const groupCX = (minX + maxX) / 2;
    const groupCY = (minY + maxY) / 2;

    // Scale every tile relative to the group center, then apply offset
    const transformTiles = (tiles) =>
      tiles.map((t) => {
        const newSW = Math.round(t.sw * s);
        const newSH = Math.round(t.sh * s);
        // Scale the tile's center relative to the group center
        const tileCX = t.sx + t.sw / 2;
        const tileCY = t.sy + t.sh / 2;
        const scaledCX = groupCX + (tileCX - groupCX) * s;
        const scaledCY = groupCY + (tileCY - groupCY) * s;
        const newSX = Math.round(scaledCX - newSW / 2 + overlayOffset.x);
        const newSY = Math.round(scaledCY - newSH / 2 + overlayOffset.y);
        return { sx: newSX, sy: newSY, sw: newSW, sh: newSH };
      });

    const newRows = zones.rows.map((row) => ({
      ...row,
      tiles: transformTiles(row.tiles),
      previewTiles: transformTiles(row.previewTiles),
      tileW: Math.round(row.tileW * s),
      tileH: Math.round(row.tileH * s),
    }));

    // Clamp the transformed group back inside the image
    let rMinX = Infinity, rMinY = Infinity, rMaxX = -Infinity, rMaxY = -Infinity;
    newRows.forEach((row) => {
      row.tiles.forEach((t) => {
        rMinX = Math.min(rMinX, t.sx);
        rMinY = Math.min(rMinY, t.sy);
        rMaxX = Math.max(rMaxX, t.sx + t.sw);
        rMaxY = Math.max(rMaxY, t.sy + t.sh);
      });
    });

    const clampDX = rMinX < 0 ? -rMinX : rMaxX > imgW ? imgW - rMaxX : 0;
    const clampDY = rMinY < 0 ? -rMinY : rMaxY > imgH ? imgH - rMaxY : 0;

    const clampedRows = clampDX === 0 && clampDY === 0
      ? newRows
      : newRows.map((row) => {
          const shift = (tiles) =>
            tiles.map((t) => ({ ...t, sx: t.sx + clampDX, sy: t.sy + clampDY }));
          return { ...row, tiles: shift(row.tiles), previewTiles: shift(row.previewTiles) };
        });

    overlayOffset.x += clampDX;
    overlayOffset.y += clampDY;

    return {
      ...zones,
      rows: clampedRows,
      tileW: newRows[0]?.tileW ?? zones.tileW,
      tileH: newRows[0]?.tileH ?? zones.tileH,
    };
  }

  // ─── Overlay drag + scroll-to-scale interaction ───────────────────────────
  // Drag anywhere on the SVG overlay to pan the whole group.
  // Scroll (or pinch via wheel) on the overlay to scale it (ratio-locked).

  function setupOverlayInteraction() {
    if (!overlaySvg || !origCanvas) return;

    overlaySvg.style.pointerEvents = "all";

    let isDragging = false;
    let isScaling = false;
    let activeHandle = null; // 'tl' | 'tr' | 'bl' | 'br'
    let dragStartSVG = null;
    let dragStartOffset = null;
    let scaleStartSVG = null;
    let scaleStartScale = null;
    let scaleStartOffset = null;

    // ── helpers ──────────────────────────────────────────────────────────────

    function clientToSVG(e) {
      const rect = overlaySvg.getBoundingClientRect();
      const vb = overlaySvg.viewBox.baseVal;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * vb.width,
        y: ((clientY - rect.top) / rect.height) * vb.height,
      };
    }

    function getGroupBBox(zones) {
      // Bounding box of ALL previewTiles across all rows
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      zones.rows.forEach((row) => {
        row.previewTiles.forEach((t) => {
          minX = Math.min(minX, t.sx);
          minY = Math.min(minY, t.sy);
          maxX = Math.max(maxX, t.sx + t.sw);
          maxY = Math.max(maxY, t.sy + t.sh);
        });
      });
      return { minX, minY, maxX, maxY };
    }

    function pointInGroupBBox(pt, zones) {
      const bb = getGroupBBox(zones);
      return pt.x >= bb.minX && pt.x <= bb.maxX && pt.y >= bb.minY && pt.y <= bb.maxY;
    }

    function getHandleRadius() {
      if (!overlaySvg) return 8;
      const vb = overlaySvg.viewBox.baseVal;
      return Math.max(6, Math.round(vb.width / 80));
    }

    function getHandleHitRadius() {
      return getHandleRadius() * 2.5;
    }

    function getHandlePositions(zones) {
      const bb = getGroupBBox(zones);
      return {
        tl: { x: bb.minX, y: bb.minY },
        tr: { x: bb.maxX, y: bb.minY },
        bl: { x: bb.minX, y: bb.maxY },
        br: { x: bb.maxX, y: bb.maxY },
      };
    }

    function hitTestHandle(pt, zones) {
      if (!overlaySelected) return null;
      const handles = getHandlePositions(zones);
      const r = getHandleHitRadius();
      for (const [key, pos] of Object.entries(handles)) {
        const dx = pt.x - pos.x;
        const dy = pt.y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) <= r) return key;
      }
      return null;
    }

    function getCurrentZones() {
      if (!currentLoadedImage || !overlayBaseZones) return null;
      return applyOverlayTransform(overlayBaseZones, currentLoadedImage.naturalWidth, currentLoadedImage.naturalHeight);
    }

    function setSelected(val) {
      overlaySelected = val;
      overlaySvg.style.cursor = val ? "grab" : "default";
      if (currentLoadedImage) {
        const img = currentLoadedImage;
        const zones = applyOverlayTransform(overlayBaseZones, img.naturalWidth, img.naturalHeight);
        drawOriginal(img, img.naturalWidth, img.naturalHeight, zones);
      }
      // Show reset btn only when selected AND not in default position
      updateResetBtnVisibility();
    }

    function commitSlices() {
      if (!currentLoadedImage) return;
      const img = currentLoadedImage;
      const adj = applyOverlayTransform(overlayBaseZones, img.naturalWidth, img.naturalHeight);
      currentSlices = generateSlices(img, adj);
      renderDownloadGrid(currentSlices);
      showInfo(img.naturalWidth, img.naturalHeight, adj.tileW, adj.tileH,
        adj.calculatedOverlap,
        currentRatio === "4x5" && manualOverlapCb ? manualOverlapCb.checked : false,
        adj.fitMode);
    }

    if (resetOverlayBtn) {
      resetOverlayBtn.addEventListener("click", () => {
        overlayOffset = { x: 0, y: 0 };
        overlayScale = 1.0;
        overlaySelected = false;
        if (currentLoadedImage) {
          const img = currentLoadedImage;
          const adj = applyOverlayTransform(overlayBaseZones, img.naturalWidth, img.naturalHeight);
          drawOriginal(img, img.naturalWidth, img.naturalHeight, adj);
          currentSlices = generateSlices(img, adj);
          renderDownloadGrid(currentSlices);
        }
        updateResetBtnVisibility();
      });
    }
    
    document.addEventListener("pointerdown", (e) => {
      if (!overlaySelected) return;
      if (overlaySvg.contains(e.target)) return; // let SVG handle its own clicks
      setSelected(false);
    }, { capture: true });

    // ── pointer events (desktop + touch via pointer events) ──────────────────

    overlaySvg.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType !== "touch") return;
      e.preventDefault();

      const pt = clientToSVG(e);
      const zones = getCurrentZones();
      if (!zones) return;

      // Check handle hit first (only when selected)
      const handle = hitTestHandle(pt, zones);
      if (handle) {
        isScaling = true;
        activeHandle = handle;
        scaleStartSVG = pt;
        scaleStartScale = overlayScale;
        scaleStartOffset = { ...overlayOffset };
        overlaySvg.setPointerCapture(e.pointerId);
        overlaySvg.style.cursor = "nwse-resize";
        return;
      }

      // Click inside overlay bounding box
      if (pointInGroupBBox(pt, zones)) {
        if (!overlaySelected) {
          // First click: just select, don't start drag yet
          setSelected(true);
          return;
        }
        // Already selected: start drag
        isDragging = true;
        overlaySvg.setPointerCapture(e.pointerId);
        overlaySvg.style.cursor = "grabbing";
        dragStartSVG = pt;
        dragStartOffset = { ...overlayOffset };
        return;
      }

      // Click outside: deselect
      if (overlaySelected) {
        setSelected(false);
      }
    });

    overlaySvg.addEventListener("pointermove", (e) => {
      if (!currentLoadedImage || !overlayBaseZones) return;

      const pt = clientToSVG(e);
      const img = currentLoadedImage;

      if (isDragging) {
        overlayOffset = {
          x: dragStartOffset.x + (pt.x - dragStartSVG.x),
          y: dragStartOffset.y + (pt.y - dragStartSVG.y),
        };
        const adjusted = applyOverlayTransform(overlayBaseZones, img.naturalWidth, img.naturalHeight);
        drawOriginal(img, img.naturalWidth, img.naturalHeight, adjusted);
        return;
      }

      if (isScaling && scaleStartSVG) {
        const img = currentLoadedImage;
        const zones = getCurrentZones();
        if (!zones) return;
        const bb = getGroupBBox(zones);

        const anchorX = (activeHandle === "tl" || activeHandle === "bl") ? bb.maxX : bb.minX;
        const anchorY = (activeHandle === "tl" || activeHandle === "tr") ? bb.maxY : bb.minY;

        const startDist = Math.hypot(scaleStartSVG.x - anchorX, scaleStartSVG.y - anchorY);
        const curDist = Math.hypot(pt.x - anchorX, pt.y - anchorY);

        if (startDist > 0) {
          const rawScale = Math.max(0.2, Math.min(3.0, scaleStartScale * (curDist / startDist)));

          // Compute the max scale that keeps the entire group inside the image
          // by testing what applyOverlayTransform would produce at that scale.
          const savedScale = overlayScale;
          const savedOffset = { ...overlayOffset };
          overlayScale = rawScale;
          overlayOffset = { ...scaleStartOffset };
          const testZones = applyOverlayTransform(overlayBaseZones, img.naturalWidth, img.naturalHeight);
          const testBB = getGroupBBox(testZones);

          const fitsInImage =
            testBB.minX >= 0 &&
            testBB.minY >= 0 &&
            testBB.maxX <= img.naturalWidth &&
            testBB.maxY <= img.naturalHeight;

          if (!fitsInImage) {
            // Restore — don't apply this scale step
            overlayScale = savedScale;
            overlayOffset = savedOffset;
          }
          // overlayScale + overlayOffset are now either the new valid value or the last valid one
          const adjusted = applyOverlayTransform(overlayBaseZones, img.naturalWidth, img.naturalHeight);
          drawOriginal(img, img.naturalWidth, img.naturalHeight, adjusted);
        }
        return;
      }

      // Cursor hints when selected but not dragging
      if (overlaySelected) {
        const zones = getCurrentZones();
        if (!zones) return;
        const handle = hitTestHandle(pt, zones);
        if (handle) {
          overlaySvg.style.cursor = "nwse-resize";
        } else if (pointInGroupBBox(pt, zones)) {
          overlaySvg.style.cursor = "grab";
        } else {
          overlaySvg.style.cursor = "default";
        }
      }
    });

    const commitPointer = (e) => {
      const wasScaling = isScaling;
      const wasDragging = isDragging;
      isDragging = false;
      isScaling = false;
      activeHandle = null;
      overlaySvg.style.cursor = overlaySelected ? "grab" : "default";

      if ((wasScaling || wasDragging) && currentLoadedImage) {
        commitSlices();
        updateResetBtnVisibility();
      }
    };

    overlaySvg.addEventListener("pointerup", commitPointer);
    overlaySvg.addEventListener("pointercancel", commitPointer);

    // ── wheel to scale (desktop only — mobile uses handles) ──────────────────

    // overlaySvg.addEventListener("wheel", (e) => {
    //   if (!overlaySelected || !currentLoadedImage || !overlayBaseZones) return;
    //   e.preventDefault();
    //   const delta = e.deltaY > 0 ? -0.05 : 0.05;
    //   overlayScale = Math.max(0.2, Math.min(3.0, overlayScale + delta));
    //   const img = currentLoadedImage;
    //   const adjusted = applyOverlayTransform(overlayBaseZones, img.naturalWidth, img.naturalHeight);
    //   drawOriginal(img, img.naturalWidth, img.naturalHeight, adjusted);

    //   clearTimeout(overlaySvg._scaleTimer);
    //   overlaySvg._scaleTimer = setTimeout(commitSlices, 300);
    // }, { passive: false });

    // ── touch: prevent page scroll when selected, allow pinch ────────────────

    overlaySvg.addEventListener("touchstart", (e) => {
      if (!overlaySelected) return; // don't intercept if not selected
      if (e.touches.length === 1) {
        // Single touch inside overlay: prevent scroll
        const pt = clientToSVG(e.touches[0]);
        const zones = getCurrentZones();
        if (zones && pointInGroupBBox(pt, zones)) {
          e.preventDefault();
        }
      }
      if (e.touches.length === 2) {
        e.preventDefault(); // prevent pinch-zoom on page
      }
    }, { passive: false });

    overlaySvg.addEventListener("touchend", (e) => {
      if (!overlaySelected) {
        // If not selected: check if tap was inside overlay
        const pt = clientToSVG(e.changedTouches[0]);
        const zones = getCurrentZones();
        if (zones && pointInGroupBBox(pt, zones)) {
          setSelected(true);
        }
      } else {
        // If selected: check if tap was outside
        if (e.touches.length === 0) {
          const pt = clientToSVG(e.changedTouches[0]);
          const zones = getCurrentZones();
          if (zones && !pointInGroupBBox(pt, zones)) {
            setSelected(false);
          }
        }
      }
    }, { passive: true });
  }

  // Wire up the overlay interaction once the DOM is ready
  setupOverlayInteraction();
  // updateResetBtnVisibility();

  // ─────────────────────────────────────────────────────────────────────────

  function drawOriginal(img, width, height, zones) {
    if (!origCanvas || !overlaySvg) {
      return;
    }

    const ctx = origCanvas.getContext("2d");
    origCanvas.width = width;
    origCanvas.height = height;
    ctx.drawImage(img, 0, 0);

    overlaySvg.innerHTML = "";
    overlaySvg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const colors = ["#534AB7", "#0F6E56", "#993C1D"];
    const labels = ["Left", "Center", "Right"];
    const strokeWidth = Math.max(2, Math.round(width / 400));
    const fontSize = Math.round(width / 28);

    zones.rows.forEach((row) => {
      row.previewTiles.forEach((zone, index) => {
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        rect.setAttribute("x", zone.sx);
        rect.setAttribute("y", zone.sy);
        rect.setAttribute("width", zone.sw);
        rect.setAttribute("height", zone.sh);
        rect.setAttribute("fill", `${colors[index]}22`);
        rect.setAttribute("stroke", colors[index]);
        rect.setAttribute("stroke-width", strokeWidth);
        overlaySvg.appendChild(rect);

        if (currentGrid.rows === 1) {
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text",
          );
          text.setAttribute("x", zone.sx + zone.sw / 2);
          text.setAttribute("y", zone.sy + zone.sh / 2);
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "middle");
          text.setAttribute("fill", colors[index]);
          text.setAttribute("font-size", fontSize);
          text.setAttribute("font-weight", "500");
          text.textContent = labels[index];
          overlaySvg.appendChild(text);
        }
      });
    });

    // ── Selection state visuals ───────────────────────────────────────────────
    if (overlaySelected) {
      // Thicken + whiten all overlay rect borders
      overlaySvg.querySelectorAll("rect[stroke]").forEach((r) => {
        r.setAttribute("stroke", "#ffffff");
        r.setAttribute("stroke-width", strokeWidth * 2.5);
        r.setAttribute("fill", r.getAttribute("fill").replace(/[0-9a-f]{2}\)$/, "18)"));
      });

      // Corner scale handles — only at the 4 outer corners of the full group bbox
      const allPreviewTiles = zones.rows.flatMap((r) => r.previewTiles);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      allPreviewTiles.forEach((t) => {
        minX = Math.min(minX, t.sx);
        minY = Math.min(minY, t.sy);
        maxX = Math.max(maxX, t.sx + t.sw);
        maxY = Math.max(maxY, t.sy + t.sh);
      });

      const handleR = Math.max(6, Math.round(width / 80));
      const corners = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: minX, y: maxY },
        { x: maxX, y: maxY },
      ];
      corners.forEach(({ x, y }) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", handleR);
        circle.setAttribute("fill", "#ffffff");
        circle.setAttribute("stroke", "#888888");
        circle.setAttribute("stroke-width", Math.max(1, strokeWidth * 0.8));
        circle.style.cursor = "nwse-resize";
        overlaySvg.appendChild(circle);
      });

    } else {
      // Unselected: show "tap to select" hint badge
      const isDefault = overlayOffset.x === 0 && overlayOffset.y === 0 && overlayScale === 1.0;
      const allPreviewTiles = zones.rows.flatMap((r) => r.previewTiles);
      if (allPreviewTiles.length > 0) {
        const firstTile = allPreviewTiles[0];
        const badgeFontSize = Math.max(10, Math.round(width / 60));
        const badgeText = isDefault ? "Click to select · drag & scale" : "Click to reposition";
        const badgeW = badgeText.length * badgeFontSize * 0.52;
        const badgeH = badgeFontSize + badgeFontSize;
        const badgeX = firstTile.sx;
        const badgeY = firstTile.sy - badgeH - strokeWidth;

        if (badgeY > 0) {
          const badgeBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          badgeBg.setAttribute("x", badgeX);
          badgeBg.setAttribute("y", badgeY);
          badgeBg.setAttribute("width", badgeW + badgeFontSize * 1.4);
          badgeBg.setAttribute("height", badgeH);
          badgeBg.setAttribute("rx", badgeFontSize * 0.3);
          badgeBg.setAttribute("fill", "rgba(0,0,0,0.55)");
          overlaySvg.appendChild(badgeBg);

          const badgeTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
          badgeTxt.setAttribute("x", badgeX + badgeFontSize * 0.7);
          badgeTxt.setAttribute("y", badgeY + badgeH * 0.68);
          badgeTxt.setAttribute("fill", "#ffffff");
          badgeTxt.setAttribute("font-size", badgeFontSize);
          badgeTxt.setAttribute("font-family", "Archivo, sans-serif");
          badgeTxt.setAttribute("font-weight", "500");
          badgeTxt.textContent = badgeText;
          overlaySvg.appendChild(badgeTxt);
        }
      }
    }
  }

  function fitPreviewToStage(img) {
    if (!previewWrap || !mainStage) {
      return;
    }

    const stageStyle = window.getComputedStyle(mainStage);
    const paddingX =
      parseFloat(stageStyle.paddingLeft) + parseFloat(stageStyle.paddingRight);
    const paddingY =
      parseFloat(stageStyle.paddingTop) + parseFloat(stageStyle.paddingBottom);
    const availableWidth = Math.max(mainStage.clientWidth - paddingX, 0);
    const availableHeight = Math.max(mainStage.clientHeight - paddingY, 0);
    if (!availableWidth || !availableHeight) {
      return;
    }

    const imageAspect = img.naturalWidth / img.naturalHeight;
    const stageAspect = availableWidth / availableHeight;

    let renderWidth;
    let renderHeight;
    if (imageAspect > stageAspect) {
      renderWidth = availableWidth;
      renderHeight = renderWidth / imageAspect;
    } else {
      renderHeight = availableHeight;
      renderWidth = renderHeight * imageAspect;
    }

    previewWrap.style.width = `${renderWidth}px`;
    previewWrap.style.height = `${renderHeight}px`;
  }

  function generateSlices(img, zones) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = zones.tileW;
    tempCanvas.height = zones.tileH;
    const tempCtx = tempCanvas.getContext("2d");
    const slices = [];

    zones.rows.forEach((row, rowIndex) => {
      row.tiles.forEach((tile, colIndex) => {
        tempCtx.clearRect(0, 0, zones.tileW, zones.tileH);
        tempCtx.drawImage(
          img,
          tile.sx,
          tile.sy,
          tile.sw,
          tile.sh,
          0,
          0,
          zones.tileW,
          zones.tileH,
        );
        const { format, ext, quality } = getExportOptions();
        const dataUrl = tempCanvas.toDataURL(format, quality);
        const index = rowIndex * currentGrid.cols + colIndex + 1;
        slices.push({
          index,
          row: rowIndex,
          col: colIndex,
          label: `Tile ${String(index).padStart(2, "0")}`,
          dataUrl,
          filename: `gridcutter_tile_${String(index).padStart(2, "0")}.${ext}`,
        });
      });
    });

    return slices;
  }

  function renderDownloadGrid(slices) {
    if (!downloadGrid) {
      return;
    }
    tilesDownloaded = 0;
    totalTiles = slices.length;
    downloadGrid.innerHTML = "";

    slices.forEach((slice) => {
      const uploadOrder = getUploadOrderForSlice(slice);
      const card = document.createElement("article");
      card.className = "download-thumb";
      card.innerHTML = `
                <div class="download-thumb-img"><img src="${slice.dataUrl}" alt="${slice.label}" loading="lazy"></div>
                <div class="download-thumb-foot">
                    <span class="download-thumb-num">${slice.label}${uploadOrder ? ` · Upload #${uploadOrder}` : ""}</span>
                    <button class="btn btn-ghost" type="button" style="padding:8px 12px;font-size:var(--text-xs);">Download</button>
                </div>
            `;
      const button = card.querySelector("button");
      const handleTileDownload = () => {
        triggerDownload(slice.dataUrl, slice.filename);
        tilesDownloaded++;
        if (tilesDownloaded >= totalTiles) showKofiCard();
      };
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        handleTileDownload();
      });
      card.addEventListener("click", handleTileDownload);
      downloadGrid.appendChild(card);
    });

    if (downloadAllBtn) {
      downloadAllBtn.onclick = async () => {
        const originalText = downloadAllBtn.textContent;
        downloadAllBtn.textContent = "Packaging ZIP...";
        downloadAllBtn.style.opacity = "0.7";
        downloadAllBtn.style.pointerEvents = "none";

        try {
          if (typeof JSZip === "undefined") {
            throw new Error("JSZip is not available.");
          }

          const zip = new JSZip();
          for (const slice of slices) {
            const blob = await fetch(slice.dataUrl).then((response) =>
              response.blob(),
            );
            zip.file(slice.filename, blob);
          }

          const content = await zip.generateAsync({ type: "blob" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(content);
          link.download = "GridCutter_Pack.zip";
          link.click();
          showKofiCard();
          setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        } catch (error) {
          console.error("ZIP Error:", error);
          showErr("Failed to create ZIP package.");
        } finally {
          downloadAllBtn.textContent = originalText;
          downloadAllBtn.style.opacity = "1";
          downloadAllBtn.style.pointerEvents = "auto";
        }
      };
    }
  }

  function showInfo(
    width,
    height,
    cropW,
    cropH,
    calculatedOverlap,
    isManual,
    fitMode,
  ) {
    if (!infoRow) {
      return;
    }

    const overlapLabel = isManual ? "Manual Overlap" : "Auto Overlap";
    infoRow.innerHTML = [
      `Original: <span>${width} x ${height}px</span>`,
      `Tile Output: <span>${cropW} x ${cropH}px</span>`,
      `Grid: <span>${currentGrid.cols} x ${currentGrid.rows}</span>`,
      `Ratio: <span>${currentRatio === "3x4" ? "3 : 4" : "4 : 5"}</span>`,
      `${overlapLabel}: <span>${calculatedOverlap.toFixed(1)}px</span>`,
      `Fit Mode: <span>${fitMode}</span>`,
    ]
      .map(
        (text) =>
          `<div class="panel" style="padding:14px 16px;font-size:var(--text-xs);font-family:'Archivo',sans-serif;">${text}</div>`,
      )
      .join("");
  }

  function getExportOptions() {
    const format = resolveOutputFormat();
    const ext =
      format === "image/jpeg"
        ? "jpg"
        : format === "image/webp"
          ? "webp"
          : "png";
    const quality =
      format === "image/png" || !qualitySlider
        ? undefined
        : parseInt(qualitySlider.value, 10) / 100;

    return { format, ext, quality };
  }

  function triggerDownload(dataUrl, filename) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  // Check for preset in localStorage, or default to 3x1
  const gridPreset = localStorage.getItem("gridPreset");
  const presetToUse =
    gridPreset && ["3x1", "3x2", "3x3"].includes(gridPreset)
      ? gridPreset
      : "3x1";
  setGridPreset(presetToUse);
});