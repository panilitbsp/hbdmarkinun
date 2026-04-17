const video = document.getElementById("live-camera");
const frameOverlay = document.getElementById("bias-overlay");
const countdownText = document.getElementById("countdown-text");
const flashScreen = document.getElementById("flash-screen");
const captureBtn = document.getElementById("capture-btn");
const autoBtn = document.getElementById("auto-capture-btn");
const retakeBtn = document.getElementById("retake-btn");
const nextBtn = document.getElementById("next-btn");
const resultButtons = document.getElementById("result-buttons");
const kertas = document.getElementById("photostrip-paper");
const panelKanan = document.querySelector(".right-panel-controls");

const urutanSlotIds = [3, 2, 1];
const posisiKertas = ["-350px", "-175px", "0px"];
const posisiKamera = ["365px", "190px", "15px"];

let langkahSekarang = 0;
let isAutoMode = false; // Mode pembeda Auto vs Manual

window.onload = function () {
  let framePilihan = localStorage.getItem("framePilihan");
  if (framePilihan) {
    frameOverlay.src = framePilihan;
  }

  kertas.style.transform = `translateY(${posisiKertas[0]})`;
  video.style.top = posisiKamera[0];

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      alert("Izinin kameranya ya biar bisa fotbar!");
    });
};

// --- MODE AUTO ---
function mulaiAuto() {
  isAutoMode = true;
  sembunyikanTombolAwal();
  jalankanHitungMundur();
}

// --- MODE MANUAL ---
function mulaiManual() {
  isAutoMode = false;
  sembunyikanTombolAwal();
  jalankanHitungMundur();
}

function sembunyikanTombolAwal() {
  autoBtn.style.display = "none";
  captureBtn.style.display = "none";
  retakeBtn.style.display = "none";
  nextBtn.style.display = "none";
}

function jalankanHitungMundur() {
  let hitungan = 3;
  countdownText.style.display = "block";
  countdownText.innerText = hitungan;

  let intervalTimer = setInterval(() => {
    hitungan--;
    if (hitungan > 0) {
      countdownText.innerText = hitungan;
    } else {
      clearInterval(intervalTimer);
      countdownText.style.display = "none";
      jepretFoto();
    }
  }, 1000);
}

function jepretFoto() {
  let slotTarget = urutanSlotIds[langkahSekarang];
  jepretKeCanvas(slotTarget);
  video.style.opacity = "0"; // Sembunyikan video biar foto terlihat

  if (isAutoMode) {
    lanjutFrameAuto();
  } else {
    retakeBtn.style.display = "block";
    nextBtn.style.display = "block";
    if (langkahSekarang < 2) {
      nextBtn.innerText = `⬇️ NEXT FRAME (${langkahSekarang + 2}/3)`;
    } else {
      nextBtn.innerText = `🖨️ PRINT PHOTO!`;
    }
  }
}

// Lanjut otomatis untuk Mode Auto
function lanjutFrameAuto() {
  if (langkahSekarang >= 2) {
    mulaiPrint();
  } else {
    langkahSekarang++;
    geserKertas();
    // Beri jeda 1.5 detik buat pamer hasil foto bentar, lalu hitung mundur lagi
    setTimeout(() => {
      jalankanHitungMundur();
    }, 1500);
  }
}

// Klik Lanjut untuk Mode Manual
function lanjutFrameManual() {
  if (langkahSekarang >= 2) {
    mulaiPrint();
  } else {
    langkahSekarang++;
    geserKertas();

    retakeBtn.style.display = "none";
    nextBtn.style.display = "none";
    captureBtn.style.display = "block";
    captureBtn.innerText = `📸 CAPTURE (${langkahSekarang + 1}/3)`;
  }
}

function retakeFoto() {
  video.style.opacity = "1";
  const canvas = document.getElementById("slot-" + urutanSlotIds[langkahSekarang]);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  retakeBtn.style.display = "none";
  nextBtn.style.display = "none";
  captureBtn.style.display = "block";
}

function geserKertas() {
  video.style.opacity = "1";
  kertas.style.transform = `translateY(${posisiKertas[langkahSekarang]})`;
  video.style.top = posisiKamera[langkahSekarang];
}

function mulaiPrint() {
  panelKanan.style.display = "none";
  video.style.display = "none";

  kertas.style.transform = "translateY(-110%)";
  setTimeout(() => {
    kertas.classList.add("printing-animation");
    setTimeout(() => {
      resultButtons.style.display = "flex";
    }, 3500);
  }, 100);
}

function jepretKeCanvas(nomor) {
  flashScreen.style.opacity = "1";
  setTimeout(() => (flashScreen.style.opacity = "0"), 150);

  const canvas = document.getElementById("slot-" + nomor);
  const ctx = canvas.getContext("2d");

  // 1. Samakan ukurannya dengan CSS yang baru
  canvas.width = 242;
  canvas.height = 178;

  // 2. RUMUS ANTI GEPENG (Meniru fungsi object-fit: cover)
  const videoRatio = video.videoWidth / video.videoHeight;
  const canvasRatio = canvas.width / canvas.height;
  let sWidth = video.videoWidth;
  let sHeight = video.videoHeight;
  let sX = 0;
  let sY = 0;

  if (videoRatio > canvasRatio) {
    sWidth = sHeight * canvasRatio;
    sX = (video.videoWidth - sWidth) / 2;
  } else {
    sHeight = sWidth / canvasRatio;
    sY = (video.videoHeight - sHeight) / 2;
  }

  // --- KODE BARU UNTUK MEMBUAT CANVAS MIRROR PERMANEN ---
  ctx.save(); // Simpan kondisi canvas
  ctx.translate(canvas.width, 0); // Pindahkan titik awal ke pojok kanan
  ctx.scale(-1, 1); // Balikkan sumbu X (mirror horizontal)

  // Draw gambar dengan arah yang sudah dibalik
  ctx.drawImage(video, sX, sY, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

  ctx.restore(); // Kembalikan kondisi canvas ke semula agar aman
}

// --- FUNGSI SAVE & SHARE ---
function downloadFotbar() {
  const mesinZone = document.getElementById("mesin-print-zone");
  const slots = document.querySelectorAll(".photo-slot"); // (opsional, bisa dihapus juga)

  mesinZone.style.transform = "scale(1)";
  kertas.classList.remove("printing-animation");
  kertas.style.transition = "none";
  kertas.style.transform = "translateY(0)";
  kertas.style.filter = "none";

  // slots.forEach((slot) => (slot.style.transform = "scaleX(1)")); <--- HAPUS BARIS INI

  setTimeout(() => {
    html2canvas(kertas, { scale: 3, backgroundColor: null, useCORS: true }).then((canvas) => {
      let link = document.createElement("a");
      link.download = "Photobooth-Nundz.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      // slots.forEach((slot) => (slot.style.transform = "scaleX(-1)")); <--- HAPUS BARIS INI
      kertas.style.transition = "transform 0.8s ease-in-out";
      kertas.style.filter = "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.2))";
      mesinZone.style.transform = "scale(1.30)";
    });
  }, 150);
}

function shareFoto() {
  const mesinZone = document.getElementById("mesin-print-zone");
  const slots = document.querySelectorAll(".photo-slot");

  mesinZone.style.transform = "scale(1)";
  kertas.classList.remove("printing-animation");
  kertas.style.transition = "none";
  kertas.style.transform = "translateY(0)";
  kertas.style.filter = "none";

  // slots.forEach((slot) => (slot.style.transform = "scaleX(1)")); <--- HAPUS BARIS INI

  setTimeout(() => {
    html2canvas(kertas, { scale: 3, backgroundColor: null, useCORS: true }).then((canvas) => {
      // slots.forEach((slot) => (slot.style.transform = "scaleX(-1)")); <--- HAPUS BARIS INI
      kertas.style.transition = "transform 0.8s ease-in-out";
      kertas.style.filter = "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.2))";
      mesinZone.style.transform = "scale(1.30)";

      canvas.toBlob(async (blob) => {
        const file = new File([blob], "Fotbar-Bias.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ title: "My Photobooth Result!", files: [file] });
          } catch (err) {
            console.log(err);
          }
        } else {
          alert("Browser belum support Share bawaan. Pakai tombol Download aja ya!");
        }
      });
    });
  }, 150); // Jeda ini wajib ada!
}
