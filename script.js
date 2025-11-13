// === InkTerra Paint – basic MS Paint style drawing ===

const canvas = document.getElementById("brandCanvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("itp-overlay");
const skipBtn = document.getElementById("skipBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");
const toolButtons = document.querySelectorAll(".tool-btn[data-tool]");
const swatches = document.querySelectorAll(".swatch");
const brushSizeInput = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");

let currentTool = "pen";
let currentColor = "#000000";
let brushSize = parseInt(brushSizeInput.value, 10);
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Resize canvas to fit its wrapper
function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  // Fill background white so eraser works nicely
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", () => {
  // NOTE: Resizing clears the drawing – fine for this prototype.
  resizeCanvas();
});

// Drawing helpers
function getPos(evt) {
  const rect = canvas.getBoundingClientRect();
  if (evt.touches && evt.touches[0]) {
    return {
      x: evt.touches[0].clientX - rect.left,
      y: evt.touches[0].clientY - rect.top
    };
  }
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function startDrawing(evt) {
  evt.preventDefault();
  isDrawing = true;
  const pos = getPos(evt);
  lastX = pos.x;
  lastY = pos.y;
}

function draw(evt) {
  if (!isDrawing) return;
  evt.preventDefault();

  const pos = getPos(evt);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = brushSize;

  if (currentTool === "eraser") {
    ctx.strokeStyle = "#ffffff";
  } else {
    ctx.strokeStyle = currentColor;
  }

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
}

function stopDrawing(evt) {
  if (!isDrawing) return;
  evt && evt.preventDefault();
  isDrawing = false;
}

// Mouse events
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

// Touch events
canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing, { passive: false });
canvas.addEventListener("touchcancel", stopDrawing, { passive: false });

// Tools
toolButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tool = btn.dataset.tool;
    if (!tool) return;

    currentTool = tool;

    toolButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Palette
swatches.forEach((sw) => {
  sw.addEventListener("click", () => {
    const color = sw.dataset.color;
    currentColor = color;

    swatches.forEach((s) => s.classList.remove("active"));
    sw.classList.add("active");
  });
});

// Brush size
brushSizeInput.addEventListener("input", () => {
  brushSize = parseInt(brushSizeInput.value, 10);
  brushSizeValue.textContent = `${brushSize}px`;
});

// Clear
clearBtn.addEventListener("click", () => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Save PNG
saveBtn.addEventListener("click", () => {
  const dataUrl = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "inkterra-brand-snapshot.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Skip / Not now
skipBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
});
