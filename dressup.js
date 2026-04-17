// dressup.js

// --- 1. FITUR DRAG AND DROP + MAGNET ---
function makeDraggable(element) {
  let xOffset = 0,
    yOffset = 0;
  let originalZIndex = element.style.zIndex || 10;
  const baseCharacter = document.getElementById("base-character");

  element.onpointerdown = function (e) {
    e.preventDefault();
    element.style.zIndex = 1000; // Pindah ke depan
    element.classList.remove("magnet-snap"); // Matikan transisi saat ditarik manual

    let startX = e.clientX;
    let startY = e.clientY;

    document.onpointermove = function (e) {
      e.preventDefault();
      xOffset = startX - e.clientX;
      yOffset = startY - e.clientY;
      startX = e.clientX;
      startY = e.clientY;

      element.style.top = element.offsetTop - yOffset + "px";
      element.style.left = element.offsetLeft - xOffset + "px";
    };

    document.onpointerup = function () {
      document.onpointermove = null;
      document.onpointerup = null;
      element.style.zIndex = originalZIndex;

      // -- LOGIKA MAGNET --
      let snapTop = element.getAttribute("data-snap-top");
      let snapLeft = element.getAttribute("data-snap-left");

      if (snapTop && snapLeft) {
        let charRect = baseCharacter.getBoundingClientRect();
        let itemRect = element.getBoundingClientRect();

        // Cek apakah item dilepas di area sekitar karakter
        if (itemRect.left < charRect.right && itemRect.right > charRect.left && itemRect.top < charRect.bottom && itemRect.bottom > charRect.top) {
          // Kalau masuk area, aktifkan transisi dan sedot ke titik pas-nya!
          element.classList.add("magnet-snap");
          element.style.top = snapTop;
          element.style.left = snapLeft;

          // Supaya kalau elemen pakai % sebagai titik tengahnya, kita pakai transform translate
          element.style.transform = "translate(-50%, -50%)";
        } else {
          // Kalau di luar area, kembalikan transform normal
          element.style.transform = "none";
        }
      }
    };
  };
}

// Aktifkan drag untuk semua baju
document.querySelectorAll(".draggable-item").forEach((item) => {
  makeDraggable(item);
});

// --- 2. FITUR GRAVITASI HURUF (PANTULAN) ---
const letters = document.querySelectorAll(".falling-letter");
const charImg = document.getElementById("base-character"); // Ambil data karakter di tengah

letters.forEach((letter) => {
  letter.onclick = function () {
    if (this.classList.contains("fallen")) return;
    this.classList.add("fallen");

    // Ambil posisi asli huruf di layar
    let rect = this.getBoundingClientRect();

    // Pindahkan elemen ini langsung ke <body> agar posisinya mutlak dan tidak lari ke kanan
    document.body.appendChild(this);

    this.style.position = "absolute";
    this.style.left = rect.left + "px";
    this.style.top = rect.top + "px";
    this.style.margin = "0";

    // Variabel Fisika
    let x = rect.left;
    let y = rect.top;
    let vy = 0; // Kecepatan vertikal (jatuh)
    let vx = (Math.random() - 0.5) * 2; // Sedikit gerakan horizontal acak biar nggak kaku
    let gravity = 0.6; // Gaya tarik bumi
    let bounce = 0.5; // Kekuatan memantul
    let ground = window.innerHeight - rect.height - 10;

    let dropInterval = setInterval(() => {
      vy += gravity;
      y += vy;
      x += vx;

      // Ambil area kotak si karakter
      let charRect = charImg.getBoundingClientRect();
      let letterRect = this.getBoundingClientRect();

      // --- CUSTOM HITBOX (Kunci Rahasianya di Sini!) ---
      // Kita potong area gaib di kiri dan kanan karakter (misal: potong 30% dari kiri dan kanan)
      let hitboxLeft = charRect.left + charRect.width * 0.3;
      let hitboxRight = charRect.right - charRect.width * 0.3;
      let hitboxTop = charRect.top + 40; // Titik kepala teratas

      // DETEKSI TABRAKAN DENGAN HITBOX BARU
      // Sekarang huruf cuma mantul kalau nabrak area 'hitbox' yang udah disempitkan
      if (y + letterRect.height > hitboxTop && y < charRect.bottom && x + letterRect.width > hitboxLeft && x < hitboxRight) {
        // Set posisi huruf agar tidak tembus ke dalam karakter
        y = hitboxTop - letterRect.height;
        vy = -vy * bounce; // Pantulkan ke atas!

        // Lempar ke samping (kiri/kanan) agar jatuh dari bahu karakter
        if (x + letterRect.width / 2 < charRect.left + charRect.width / 2) {
          vx = -3 - Math.random() * 2; // Terpelanting ke kiri
        } else {
          vx = 3 + Math.random() * 2; // Terpelanting ke kanan
        }
      }

      // DETEKSI TABRAKAN DENGAN LANTAI
      if (y >= ground) {
        y = ground;
        vy = -vy * bounce; // Pantulan lantai
        vx *= 0.8; // Gesekan lantai (hurufnya makin pelan menggelinding)

        // Pantulan dinding kiri/kanan
        if (x <= 0) {
          x = 0;
          vx = -vx * bounce;
        }
        if (x >= window.innerWidth - letterRect.width) {
          x = window.innerWidth - letterRect.width;
          vx = -vx * bounce;
        }

        // Kalau sudah berhenti memantul
        if (Math.abs(vy) < 1.5 && Math.abs(vx) < 0.5) {
          clearInterval(dropInterval);
          makeDraggable(this); // Jadikan hurufnya bisa di drag-and-drop!
        }
      }

      // Mencegah tembus dinding saat jatuh
      if (x <= 0) x = 0;
      if (x >= window.innerWidth - letterRect.width) x = window.innerWidth - letterRect.width;

      // Terapkan perubahan posisi ke layar
      this.style.top = y + "px";
      this.style.left = x + "px";
    }, 1000 / 60); // Animasi halus 60 FPS
  };
});

// --- 3. FITUR SIMPAN & LANJUT FOTO ---
document.getElementById("next-photo-btn").addEventListener("click", function (e) {
  e.preventDefault();

  const charImg = document.getElementById("base-character");
  let charRect = charImg.getBoundingClientRect(); // Ambil ukuran asli badan karakter
  let savedClothes = [];

  document.querySelectorAll(".draggable-item").forEach((item) => {
    let itemRect = item.getBoundingClientRect();

    if (itemRect.left < charRect.right && itemRect.right > charRect.left && itemRect.top < charRect.bottom && itemRect.bottom > charRect.top) {
      // KUNCI PERBAIKAN: Hitung posisi relatif terhadap badan karakter, BUKAN layar!
      let relativeLeft = ((itemRect.left - charRect.left) / charRect.width) * 100;
      let relativeTop = ((itemRect.top - charRect.top) / charRect.height) * 100;
      let relativeWidth = (itemRect.width / charRect.width) * 100;

      savedClothes.push({
        src: item.getAttribute("src"),
        left: relativeLeft + "%",
        top: relativeTop + "%",
        width: relativeWidth + "%",
        zIndex: item.style.zIndex,
      });
    }
  });

  localStorage.setItem("wardrobeData", JSON.stringify(savedClothes));
  window.location.href = this.getAttribute("href");
});
