// ====== CONFIG ======
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwdAk3E0e4VM00o0gQvGyRXtyKW94a9_nZoFjCTRFkan3t0PWJ8-DoxRsn9qfpQ-gtN/exec";

// ====== DOM ELEMENTS ======
const overlay = document.getElementById("itp-overlay");
const canvas = document.getElementById("brandCanvas");
const skipBtn = document.getElementById("skipBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");
const brushSizeInput = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");
const emailInput = document.getElementById("emailInput");
const statusMsg = document.getElementById("statusMsg");

const toolButtons = document.querySelectorAll(".tool-btn[data-tool]");
const swatches = document.querySelectorAll(".swatch");

const ctx = canvas.getContext("2d");
const CANVAS_BG = "#ffffff";

let currentTool = "pen";
let currentColor = "#000000";
let brushSize = parseInt(brushSizeInput.value, 10);
let isDrawing = false;
let lastPoint = { x: 0, y: 0 };

// ====== CANVAS SETUP ======
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;

  // fill background
  ctx.fillStyle = CANVAS_BG;
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.beginPath();
}

function clearCanvas() {
  const rect = canvas.getBoundingClientRect();
  ctx.fillStyle = CANVAS_BG;
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.beginPath();
}

// ====== DRAWING HELPERS ======
function getCanvasCoordinates(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY;

  if (clientX == null || clientY == null) return lastPoint;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startDrawing(event) {
  event.preventDefault();
  isDrawing = true;
  lastPoint = getCanvasCoordinates(event);
}

function draw(event) {
  if (!isDrawing) return;
  event.preventDefault();

  const point = getCanvasCoordinates(event);

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = brushSize;

  if (currentTool === "eraser") {
    ctx.strokeStyle = CANVAS_BG;
  } else {
    ctx.strokeStyle = currentColor;
  }

  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();

  lastPoint = point;
}

function stopDrawing(event) {
  if (!isDrawing) return;
  event?.preventDefault();
  isDrawing = false;
}

// ====== UI HELPERS ======
function setStatus(message, isError = false) {
  if (!statusMsg) return;
  statusMsg.textContent = message || "";
  statusMsg.style.color = isError ? "#b91c1c" : "#166534";
}

function hideOverlay() {
  if (overlay) {
    overlay.style.display = "none";
  }
}

// ====== SAVE: PNG + GOOGLE SHEET ======
async function saveSnapshot() {
  const email = emailInput.value.trim();

  if (!email) {
    setStatus("Please enter an email so we can send your snapshot.", true);
    emailInput.focus();
    return;
  }

  // Get PNG data
  const dataUrl = canvas.toDataURL("image/png");
  const timestamp = new Date().toISOString();

  setStatus("Saving your brand snapshot…");

  // Fire-and-forget to Google Apps Script
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        email,
        imageData: dataUrl,
        timestamp
      })
    });
  } catch (err) {
    console.error("Error sending to Google Script:", err);
    // We still let them download locally even if this fails
  }

  // Trigger local download
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `inkterra-brand-snapshot-${safeTimestamp}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Follow-up message + close overlay
  setStatus("Snapshot saved! Check your email soon for Day 1 of your brand with InkTerra Prints.");
  hideOverlay();
}

// ====== EVENT BINDINGS ======
window.addEventListener("load", () => {
  resizeCanvas();
  brushSizeValue.textContent = `${brushSize}px`;
});

window.addEventListener("resize", () => {
  const wasDrawing = isDrawing;
  isDrawing = false;
  resizeCanvas();
  isDrawing = wasDrawing;
});

// Drawing events
canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);

// Touch prevent scrolling while drawing
canvas.addEventListener(
  "touchstart",
  (e) => e.preventDefault(),
  { passive: false }
);
canvas.addEventListener(
  "touchmove",
  (e) => e.preventDefault(),
  { passive: false }
);

// Tools
toolButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    toolButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentTool = btn.getAttribute("data-tool") || "pen";
  });
});

// Color swatches
swatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    swatches.forEach((s) => s.classList.remove("active"));
    swatch.classList.add("active");
    currentColor = swatch.dataset.color || "#000000";
  });
});

// Brush size
brushSizeInput.addEventListener("input", () => {
  brushSize = parseInt(brushSizeInput.value, 10);
  brushSizeValue.textContent = `${brushSize}px`;
});

// Clear
clearBtn.addEventListener("click", () => {
  clearCanvas();
  setStatus("");
});

// Save
saveBtn.addEventListener("click", () => {
  saveSnapshot();
});

// Skip
skipBtn.addEventListener("click", () => {
  hideOverlay();
  setStatus("");
});
