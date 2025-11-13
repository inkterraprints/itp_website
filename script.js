const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseleave", () => drawing = false);

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.fillStyle = "#000";
    ctx.fillRect(x, y, 4, 4);
});

// Skip button hides the overlay
document.getElementById("skipBtn").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
});

// Save button will later send email or store data
document.getElementById("saveBtn").addEventListener("click", () => {
    alert("Saved! (We'll connect this later)");
});

