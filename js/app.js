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

  function processImage(img) {
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

    drawOriginal(img, imgW, imgH, zones);
    currentSlices = generateSlices(img, zones);
    renderDownloadGrid(currentSlices);
    showInfo(
      imgW,
      imgH,
      zones.tileW,
      zones.tileH,
      zones.calculatedOverlap,
      useManual,
      zones.fitMode,
    );

    if (mainContent) {
      mainContent.style.display = "flex";
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
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        triggerDownload(slice.dataUrl, slice.filename);
      });
      card.addEventListener("click", () =>
        triggerDownload(slice.dataUrl, slice.filename),
      );
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