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
let posisiKamera = ["365px", "190px", "15px"];
let tinggiSlot = 178;
let lebarSlot = 242; // <-- Tambahan: buat ngatur lebar default
let geserKiri = "0px"; // <-- Tambahan: buat ngatur posisi X (kiri/kanan)

let langkahSekarang = 0;
let isAutoMode = false;

window.onload = function () {
  let framePilihan = localStorage.getItem("framePilihan");

  // --- KODE BARU KHUSUS JEYUK ---
  if (framePilihan && framePilihan.includes("jeyuk")) {
    tinggiSlot = 145; // Tinggi dikecilin lagi biar gak tumpah atas-bawah
    lebarSlot = 220; // Lebar dikecilin biar gak tumpah kiri-kanan
    geserKiri = "11px"; // Digeser sedikit ke tengah (atur angkanya kalau kurang pas)

    posisiKamera = ["370px", "215px", "60px"]; // Posisi Y kamera (atas-bawah)

    // Geser posisi slot kanvas ke bawah
    document.getElementById("slot-1").style.top = "60px";
    document.getElementById("slot-2").style.top = "215px";
    document.getElementById("slot-3").style.top = "370px";

    // Ubah tinggi, lebar, dan posisi semua elemen kamera
    document.querySelectorAll(".photo-slot, #live-camera").forEach((el) => {
      el.style.height = tinggiSlot + "px";
      el.style.width = lebarSlot + "px";
      el.style.left = geserKiri;
    });
  }
  // -----------------------------

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
  canvas.height = tinggiSlot; // <--- UBAH ANGKA 178 JADI tinggiSlot

  // 2. RUMUS ANTI GEPENG (Meniru fungsi object-fit: cover)
  const videoRatio = video.videoWidth / video.videoHeight;
  const canvasRatio = canvas.width / canvas.height;
  let sWidth = video.videoWidth;
  let sHeight = video.videoHeight;
  let sX = 0;
  let sY = 0;

  if (videoRatio > canvasRatio) {
    // Jika rasio video lebih lebar dari kanvas, crop bagian kiri & kanan
    sWidth = sHeight * canvasRatio;
    sX = (video.videoWidth - sWidth) / 2;
  } else {
    // Jika rasio video lebih tinggi dari kanvas, crop bagian atas & bawah
    // Ini memastikan mukamu tetap proporsional, tidak ditarik jadi lebar!
    sHeight = sWidth / canvasRatio;
    sY = (video.videoHeight - sHeight) / 2;
  }

  // Draw gambar dengan cropping yang proporsional
  ctx.drawImage(video, sX, sY, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
}

// --- FUNGSI SAVE & SHARE ---
function downloadFotbar() {
  const mesinZone = document.getElementById("mesin-print-zone");
  const slots = document.querySelectorAll(".photo-slot");

  // 1. Reset posisi dan matikan bayangan (shadow bikin bug layar hitam)
  mesinZone.style.transform = "scale(1)";
  kertas.classList.remove("printing-animation"); // Pastikan sisa animasi print dihapus
  kertas.style.transition = "none";
  kertas.style.transform = "translateY(0)";
  kertas.style.filter = "none"; // PENTING: Matikan bayangan sesaat!
  slots.forEach((slot) => (slot.style.transform = "scaleX(1)"));

  // 2. Beri jeda 150ms biar browser selesai merender posisi baru sebelum difoto
  setTimeout(() => {
    html2canvas(kertas, { scale: 3, backgroundColor: null, useCORS: true }).then((canvas) => {
      let link = document.createElement("a");
      link.download = "Photobooth-Nundz.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      // 3. Kembalikan semuanya ke semula
      slots.forEach((slot) => (slot.style.transform = "scaleX(-1)"));
      kertas.style.transition = "transform 0.8s ease-in-out";
      kertas.style.filter = "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.2))"; // Nyalakan bayangan lagi
      mesinZone.style.transform = "scale(1.30)";
    });
  }, 150); // Jeda ini yang menyelamatkan hasil fotomu!
}

function shareFoto() {
  const mesinZone = document.getElementById("mesin-print-zone");
  const slots = document.querySelectorAll(".photo-slot");

  mesinZone.style.transform = "scale(1)";
  kertas.classList.remove("printing-animation");
  kertas.style.transition = "none";
  kertas.style.transform = "translateY(0)";
  kertas.style.filter = "none"; // PENTING: Matikan bayangan
  slots.forEach((slot) => (slot.style.transform = "scaleX(1)"));

  setTimeout(() => {
    html2canvas(kertas, { scale: 3, backgroundColor: null, useCORS: true }).then((canvas) => {
      slots.forEach((slot) => (slot.style.transform = "scaleX(-1)"));
      kertas.style.transition = "transform 0.8s ease-in-out";
      kertas.style.filter = "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.2))"; // Nyalakan bayangan lagi
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
