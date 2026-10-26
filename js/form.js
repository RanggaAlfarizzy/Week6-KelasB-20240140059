// ==========================================================
// form.js — Asisten Caption UMKM (DOM + Event Handling + Validasi)
// ==========================================================

// ===== 1. DOM Selector =====
const form = document.querySelector('#captionForm');
const namaProduk = document.querySelector('#namaProduk');
const hargaProduk = document.querySelector('#hargaProduk');
const keunggulan = document.querySelector('#keunggulan');
const platform = document.querySelector('#platform');

const errorNama = document.querySelector('#errorNama');
const errorHarga = document.querySelector('#errorHarga');
const errorKeunggulan = document.querySelector('#errorKeunggulan');
const charCount = document.querySelector('#charCount');

const statusText = document.querySelector('#statusText');
const output = document.querySelector('#captionOutput');

const btnBuat = document.querySelector('#buatCaption');
const btnContoh = document.querySelector('#muatContoh');
const btnSalin = document.querySelector('#salinCaption');

// ===== 2. Fungsi bantu =====
function setStatus(pesan, tipe = '') {
  statusText.textContent = pesan;
  statusText.className = 'status ' + tipe;
}

function setError(input, elemenError, pesan) {
  elemenError.textContent = pesan;
  input.classList.toggle('input-invalid', pesan !== '');
}

function clearErrors() {
  setError(namaProduk, errorNama, '');
  setError(hargaProduk, errorHarga, '');
  setError(keunggulan, errorKeunggulan, '');
}

function formatRupiah(angka) {
  return 'Rp' + Number(angka).toLocaleString('id-ID');
}

// ===== 3. Validasi input =====
function validateInput() {
  let valid = true;
  clearErrors();

  if (namaProduk.value.trim().length < 3) {
    setError(namaProduk, errorNama, 'Nama produk wajib diisi, minimal 3 karakter.');
    valid = false;
  }

  if (hargaProduk.value.trim() === '' || Number(hargaProduk.value) <= 0) {
    setError(hargaProduk, errorHarga, 'Harga wajib diisi dan harus lebih dari 0.');
    valid = false;
  }

  if (keunggulan.value.trim().length < 10) {
    setError(keunggulan, errorKeunggulan, 'Keunggulan minimal 10 karakter.');
    valid = false;
  }

  return valid;
}

// ===== 4. Generate caption =====
function generateCaption(nama, harga, unggul, platformDipilih) {
  const hargaText = formatRupiah(harga);

  const templates = {
    Instagram:
      `✨ ${nama} ✨\n\nKenapa harus coba? Karena ${unggul}.\n💰 Hanya ${hargaText}\n\nYuk dukung produk lokal! Pesan lewat DM 💬\n\n#UMKM #ProdukLokal #BanggaBuatanIndonesia`,
    WhatsApp:
      `Halo Kak! 👋\n\nKenalkan *${nama}* — ${unggul}.\nHarga: *${hargaText}*\n\nTertarik? Balas pesan ini ya, kami siap melayani 🙏`,
    TikTok:
      `POV: kamu nemu ${nama} cuma ${hargaText} 😍 ${unggul}! Cek sekarang sebelum kehabisan 🔥 #fyp #UMKM #produklokal`,
    Facebook:
      `Halo sahabat! Kami bangga memperkenalkan ${nama}.\n\nKeunggulan: ${unggul}.\nHarga: ${hargaText}.\n\nHubungi kami untuk pemesanan dan dukung usaha lokal. Terima kasih! 🙌`
  };

  return templates[platformDipilih] || templates.Instagram;
}

// ===== 5. Event: submit =====
form.addEventListener('submit', function (event) {
  event.preventDefault(); // form tidak reload

  if (!validateInput()) {
    output.hidden = true;
    btnSalin.hidden = true;
    setStatus('Data belum valid. Periksa kembali isian form.', 'error-status');
    return;
  }

  output.textContent = generateCaption(
    namaProduk.value.trim(),
    hargaProduk.value,
    keunggulan.value.trim(),
    platform.value
  );
  output.hidden = false;
  btnSalin.hidden = false;

  btnBuat.classList.add('active');
  setStatus('Caption berhasil dibuat ✔', 'success');
});

// ===== 6. Event: input (validasi realtime + counter) =====
namaProduk.addEventListener('input', function () {
  if (namaProduk.value.trim().length >= 3) setError(namaProduk, errorNama, '');
});

hargaProduk.addEventListener('input', function () {
  if (Number(hargaProduk.value) > 0) setError(hargaProduk, errorHarga, '');
});

keunggulan.addEventListener('input', function () {
  charCount.textContent = keunggulan.value.length;
  if (keunggulan.value.trim().length >= 10) setError(keunggulan, errorKeunggulan, '');
});

// ===== 7. Event: reset =====
form.addEventListener('reset', function () {
  clearErrors();
  output.hidden = true;
  output.textContent = '';
  btnSalin.hidden = true;
  btnBuat.classList.remove('active');
  charCount.textContent = '0';
  setStatus('Form direset. Siap digunakan.');
});

// ===== 8. Event: muat data contoh (Fetch JSON lokal) =====
async function loadExampleData() {
  btnContoh.disabled = true;
  setStatus('Mengambil data contoh...', 'loading');

  try {
    const response = await fetch('data/contoh-produk.json');
    if (!response.ok) throw new Error('Data gagal dibaca');

    const contoh = await response.json();
    namaProduk.value = contoh.namaProduk;
    hargaProduk.value = contoh.harga;
    keunggulan.value = contoh.keunggulan;
    platform.value = contoh.platform;
    charCount.textContent = keunggulan.value.length;

    clearErrors();
    setStatus('Data contoh berhasil dimuat. Klik "Buat Caption".', 'success');
  } catch (error) {
    console.error(error);
    setStatus('Gagal mengambil data. Jalankan lewat Live Server.', 'error-status');
  } finally {
    btnContoh.disabled = false;
  }
}
btnContoh.addEventListener('click', loadExampleData);

// ===== 9. Event: salin caption =====
btnSalin.addEventListener('click', async function () {
  try {
    await navigator.clipboard.writeText(output.textContent);
    setStatus('Caption disalin ke clipboard 📋', 'success');
  } catch (error) {
    setStatus('Gagal menyalin. Salin manual dari kotak preview.', 'error-status');
  }
});

// ===== 10. Prefill dari etalase (form.html?nama=...&harga=...) =====
function prefillDariEtalase() {
  const params = new URLSearchParams(window.location.search);
  const nama = params.get('nama');
  const harga = params.get('harga');

  if (nama) namaProduk.value = nama;
  if (harga) hargaProduk.value = harga;
  if (nama || harga) {
    setStatus('Data produk dari etalase terisi. Lengkapi keunggulan produk.', 'success');
    keunggulan.focus();
  }
}
prefillDariEtalase();
