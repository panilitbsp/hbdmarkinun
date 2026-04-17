// Data Bingkai dan Pengaturan Alas Masing-masing
const frames = [
  {
    frame: "assets/frame-1.png",
    alas: "assets/alas-frame-1.png",
    // Atur alas frame 1 di sini:
    frameWidth: "120%",
    alasWidth: "80%",
    alasHeight: "100%",
    alasTop: "55%", // Kurangin angkanya kalau alasnya mau agak naik
    alasLeft: "50%",
  },
  {
    frame: "assets/frame-2.png",
    alas: "assets/alas-frame-2.png",
    // Frame kotak kurang kecil alasnya? Kita kecilin di sini!
    alasWidth: "85%", // Coba mainkan dari 80% sampai 90%
    alasHeight: "85%",
    alasTop: "50%",
    alasLeft: "50%",
  },
  {
    frame: "assets/frame-3.png", // Pastikan nama file frame 3 punyamu bener ini ya
    alas: "assets/alas-frame-3.png",
    frameWidth: "120%",
    alasWidth: "80%",
    alasHeight: "100%",
    alasTop: "50%",
    alasLeft: "50%",
  },
  {
    frame: "assets/frame-4.png",
    alas: "assets/alas-frame-3.png", // Memakai alas yang sama seperti frame 3
    frameWidth: "120%",
    alasWidth: "80%",
    alasHeight: "100%",
    alasTop: "50%",
    alasLeft: "50%",
  },
];

let currentFrameIndex = 0;

const frameFg = document.getElementById("frame-fg");
const alasBg = document.getElementById("alas-bg");
const clothesContainer = document.getElementById("clothes-container");

// 1. Ganti Bingkai Kiri/Kanan dan Terapkan Ukuran Alas
function gantiFrame(arah) {
  currentFrameIndex += arah;

  if (currentFrameIndex < 0) currentFrameIndex = frames.length - 1;
  if (currentFrameIndex >= frames.length) currentFrameIndex = 0;

  let currentData = frames[currentFrameIndex];

  // Ganti gambar frame dan alas
  frameFg.src = currentData.frame;
  alasBg.src = currentData.alas;

  // Terapkan ukuran & posisi alas custom dari array di atas!
  alasBg.style.width = currentData.alasWidth;
  alasBg.style.height = currentData.alasHeight;
  alasBg.style.top = currentData.alasTop;
  alasBg.style.left = currentData.alasLeft;
  alasBg.style.transform = "translate(-50%, -50%)";

  // --- NAH, INI MESIN YANG KELUPAAN BIAR FRAMENYA BISA DIGEDEIN! ---
  // Kode ini akan baca 'frameWidth' dari daftarmu. Kalau nggak ada (kayak di Frame 2), otomatis pakai "100%"
  frameFg.style.width = currentData.frameWidth || "100%";
  frameFg.style.height = "auto";
  frameFg.style.top = "50%";
  frameFg.style.left = "50%";
  frameFg.style.transform = "translate(-50%, -50%)";
}

// 2. Rakit Baju & Inisiasi Frame Pertama
window.onload = function () {
  let savedData = localStorage.getItem("wardrobeData");

  if (savedData) {
    let clothes = JSON.parse(savedData);
    clothes.forEach((item) => {
      let img = document.createElement("img");
      img.src = item.src;
      img.className = "saved-item";
      img.style.left = item.left;
      img.style.top = item.top;
      img.style.width = item.width;
      img.style.zIndex = item.zIndex;
      clothesContainer.appendChild(img);
    });
  }

  // Panggil ini biar saat web pertama dibuka, alasnya langsung pakai ukuran settingan
  gantiFrame(0);
};

// 3. Fitur Jepret Layar & Download Foto
function downloadPhoto() {
  const fullPage = document.getElementById("photobooth-body");

  // Ganti baris ini biar membidik .action-buttons
  const btns = document.querySelectorAll(".arrow-btn, .action-buttons, #back-btn");

  btns.forEach((btn) => (btn.style.opacity = "0"));

  html2canvas(fullPage, {
    scale: 2,
    backgroundColor: null,
  }).then((canvas) => {
    let link = document.createElement("a");
    link.download = "Nundz-18-Photobooth.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    btns.forEach((btn) => (btn.style.opacity = "1"));
  });
}
