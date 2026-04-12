// --- DOM ELEMENTS ---
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const mainContent = document.getElementById('mainContent');
const errMsg = document.getElementById('errMsg');
const infoRow = document.getElementById('infoRow');
const origCanvas = document.getElementById('origCanvas');
const overlaySvg = document.getElementById('overlaySvg');
const cropCanvases = {
  left: document.getElementById('cropLeft'),
  mid:  document.getElementById('cropMid'),
  right: document.getElementById('cropRight')
};

// DOM Settings Baru
const manualOverlapCb = document.getElementById('manualOverlapCb');
const manualOverlapInput = document.getElementById('manualOverlapInput');
const formatSelect = document.getElementById('formatSelect');
const qualityGroup = document.getElementById('qualityGroup');
const qualitySlider = document.getElementById('qualitySlider');
const qualityVal = document.getElementById('qualityVal');

let currentLoadedImage = null; // Menyimpan gambar global untuk real-time update

// --- EVENT LISTENERS ---
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0]); });
fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

// Event Listeners Settings (Real-time update)
manualOverlapCb.addEventListener('change', () => {
  manualOverlapInput.disabled = !manualOverlapCb.checked;
  if(currentLoadedImage) processImage(currentLoadedImage);
});

manualOverlapInput.addEventListener('input', () => {
  if(currentLoadedImage && manualOverlapCb.checked) processImage(currentLoadedImage);
});

formatSelect.addEventListener('change', () => {
  // Format PNG bersifat lossless, jadi kita matikan slider quality jika PNG dipilih
  const isPng = formatSelect.value === 'image/png';
  qualityGroup.style.opacity = isPng ? '0.4' : '1';
  qualitySlider.disabled = isPng;
});

qualitySlider.addEventListener('input', () => {
  qualityVal.textContent = qualitySlider.value;
});

// --- CORE FUNCTIONS ---
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return showErr('Please upload an image file.');
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => { 
    URL.revokeObjectURL(url); 
    currentLoadedImage = img; // Simpan ke global
    processImage(img); 
  };
  img.onerror = () => showErr('Could not load image.');
  img.src = url;
}

function showErr(msg) { 
  errMsg.textContent = msg; 
  errMsg.style.display = 'block'; 
}

function processImage(img) {
  errMsg.style.display = 'none';
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  // Cek apakah user mengaktifkan manual overlap
  const useManual = manualOverlapCb.checked;
  const manualVal = parseFloat(manualOverlapInput.value) || 0;

  const zones = calculateZones(imgW, imgH, useManual ? manualVal : null);

  // Validasi Boundary (Mencegah layar hitam)
  if (zones.left.sx < 0 || zones.right.endX > imgW) {
    const requiredWidth = Math.ceil(zones.right.endX - zones.left.sx);
    return showErr(`Gambar kurang lebar. Butuh lebar minimal ${requiredWidth}px berdasarkan pengaturan overlap saat ini.`);
  }

  const cropW = zones.mid.sw;
  const cropH = zones.mid.sh;

  drawOriginal(img, imgW, imgH, zones);
  drawCrops(img, zones, cropW, cropH);
  showInfo(imgW, imgH, cropW, cropH, zones.calculatedOverlap, useManual);
  
  mainContent.style.display = 'block';
  setupDownloadButtons();
}

function calculateZones(imgW, imgH, manualOverlapOverride) {
  const midX = imgW / 2;

  // Lebar berdasarkan rasio
  const profilePreviewWidth = imgH * (3 / 4); // Sebelumnya: w34
  const postDetailWidth = imgH * (4 / 5);     // Sebelumnya: w45

  // --- TITIK KOORDINAT FOTO TENGAH ---
  const previewCenterStartX = midX - (profilePreviewWidth / 2); // Titik 'a'
  const previewCenterEndX = midX + (profilePreviewWidth / 2);   // Titik 'b'
  
  const postCenterStartX = midX - (postDetailWidth / 2);        // Titik 'c'
  const postCenterEndX = midX + (postDetailWidth / 2);          // Titik 'd'

  // Variabel untuk menampung titik foto Kiri dan Kanan
  let postLeftStartX, postLeftEndX;       // Titik 'e' dan 'f'
  let postRightStartX, postRightEndX;     // Titik 'g' dan 'h'
  let displayOverlap;

  // --- IMPLEMENTASI IF/ELSE JANGKAR (ANCHOR) ---
  if (manualOverlapOverride === null) {
    // MODE AUTO: Berpatokan pada preview 3:4 agar sejajar sempurna di IG Profile
    
    // Overlap sejati adalah selisih lebar post (4:5) dan preview (3:4)
    displayOverlap = postDetailWidth - profilePreviewWidth; 
    
    const autoOverlapOffset = previewCenterStartX - postCenterStartX; // Setengah overlap
    
    postLeftEndX = previewCenterStartX + autoOverlapOffset;     // f = a + Offset
    postRightStartX = previewCenterEndX - autoOverlapOffset;    // g = b - Offset

  } else {
    // MODE MANUAL: Berpatokan pada post 4:5 agar input user mutlak tanpa kompensasi
    
    displayOverlap = manualOverlapOverride;

    postLeftEndX = postCenterStartX + displayOverlap;           // f = c + Input
    postRightStartX = postCenterEndX - displayOverlap;          // g = d - Input
  }

  // --- KALKULASI TITIK LUAR ---
  // Lebar mutlak selalu 4:5, jadi tinggal dikurang/ditambah dari titik dalamnya
  postLeftStartX = postLeftEndX - postDetailWidth;              // e = f - w45
  postRightEndX = postRightStartX + postDetailWidth;            // h = g + w45

  return {
    left:  { sx: Math.round(postLeftStartX), sy: 0, sw: Math.round(postDetailWidth), sh: Math.round(imgH), endX: Math.round(postLeftEndX) },
    mid:   { sx: Math.round(postCenterStartX), sy: 0, sw: Math.round(postDetailWidth), sh: Math.round(imgH) },
    right: { sx: Math.round(postRightStartX), sy: 0, sw: Math.round(postDetailWidth), sh: Math.round(imgH), endX: Math.round(postRightEndX) },
    calculatedOverlap: displayOverlap
  };
}

// --- RENDER FUNCTIONS ---
function drawOriginal(img, W, H, zones) {
  const ctx = origCanvas.getContext('2d');
  origCanvas.width = W;
  origCanvas.height = H;
  ctx.drawImage(img, 0, 0);

  const svg = overlaySvg;
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const colors  = { left: '#534AB7', mid: '#0F6E56', right: '#993C1D' };
  const fills   = { left: '#534AB722', mid: '#0F6E5622', right: '#993C1D22' };
  const labels  = { left: 'Left', mid: 'Center', right: 'Right' };
  const sw = Math.max(2, Math.round(W / 400));
  const fs = Math.round(W / 28);

  Object.entries(zones).forEach(([key, z]) => {
    // Abaikan parameter ekstra seperti 'calculatedOverlap' saat looping objek
    if(key === 'calculatedOverlap') return;

    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', z.sx); rect.setAttribute('y', z.sy);
    rect.setAttribute('width', z.sw); rect.setAttribute('height', z.sh);
    rect.setAttribute('fill', fills[key]);
    rect.setAttribute('stroke', colors[key]);
    rect.setAttribute('stroke-width', sw);
    svg.appendChild(rect);

    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('x', z.sx + z.sw / 2);
    text.setAttribute('y', z.sy + z.sh / 2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', colors[key]);
    text.setAttribute('font-size', fs);
    text.setAttribute('font-weight', '500');
    text.textContent = labels[key];
    svg.appendChild(text);
  });
}

function drawCrops(img, zones, cropW, cropH) {
  const keys = ['left', 'mid', 'right'];
  const previewCanvases = { left: document.getElementById('prevLeft'), mid: document.getElementById('prevMid'), right: document.getElementById('prevRight') };

  keys.forEach(key => {
    const z = zones[key];
    // Download Canvas
    const c = cropCanvases[key];
    c.width  = cropW;
    c.height = cropH;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, z.sx, z.sy, z.sw, z.sh, 0, 0, cropW, cropH);

    // Preview Canvas
    const pC = previewCanvases[key];
    pC.width = cropW;
    pC.height = cropH;
    const pCtx = pC.getContext('2d');
    pCtx.drawImage(img, z.sx, z.sy, z.sw, z.sh, 0, 0, cropW, cropH);
  });
}

function showInfo(W, H, cropW, cropH, calculatedOverlap, isManual) {
  const overlapLabel = isManual ? 'Manual Overlap' : 'Auto Overlap';
  infoRow.innerHTML = [
    `Original: <span>${W} × ${H}px</span>`,
    `Output: <span>${cropW} × ${cropH}px</span>`,
    `Ratio: <span>4 : 5</span>`,
    `${overlapLabel}: <span>${calculatedOverlap.toFixed(1)}px</span>`
  ].map(t => `<div class="info-pill">${t}</div>`).join('');
}

// --- DOWNLOAD INTEGRATION (Format & Quality Fix) ---
function setupDownloadButtons() {
  const keys = ['left', 'mid', 'right'];
  
  // Setup tombol individual
  ['dlLeft', 'dlMid', 'dlRight'].forEach((id, i) => {
    document.getElementById(id).onclick = () => {
      // 1. PINDAHKAN KE SINI: Baca nilai secara dinamis saat tombol diklik
      const format = formatSelect.value;
      const ext = format === 'image/jpeg' ? 'jpg' : format.split('/')[1];
      const quality = format === 'image/png' ? undefined : parseInt(qualitySlider.value) / 100;
      
      const canvas = cropCanvases[keys[i]];
      const a = document.createElement('a');
      a.download = `gridcutter_${keys[i]}.${ext}`;
      a.href = canvas.toDataURL(format, quality);
      a.click();
    };
  });

  // Setup tombol JSZip
  document.getElementById('dlAll').onclick = async function() {
    const originalText = this.textContent;
    this.textContent = "Packaging ZIP...";
    this.style.opacity = "0.7";
    this.style.pointerEvents = "none";

    // 2. PINDAHKAN KE SINI: Baca nilai secara dinamis saat tombol ZIP diklik
    const format = formatSelect.value;
    const ext = format === 'image/jpeg' ? 'jpg' : format.split('/')[1];
    const quality = format === 'image/png' ? undefined : parseInt(qualitySlider.value) / 100;

    try {
      const zip = new JSZip();
      
      await Promise.all(keys.map(async (key) => {
        const canvas = cropCanvases[key];
        const blob = await new Promise(resolve => canvas.toBlob(resolve, format, quality));
        zip.file(`gridcutter_${key}.${ext}`, blob);
      }));

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "GridCutter_Pack.zip";
      link.click();
      
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (error) {
      console.error("ZIP Error:", error);
      showErr("Failed to create ZIP.");
    } finally {
      this.textContent = originalText;
      this.style.opacity = "1";
      this.style.pointerEvents = "auto";
    }
  };
}