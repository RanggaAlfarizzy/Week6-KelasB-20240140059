// ==========================================================
// index.js — Etalase Produk (Fetch API + DOM + Event Handling)
// ==========================================================

// ===== 1. Konfigurasi & state =====
const API_URL = 'https://dummyjson.com/products?limit=0'; // limit=0 → semua produk
let semuaProduk = []; // penyimpanan data sementara hasil fetch

// ===== 2. DOM Selector =====
const productList = document.querySelector('#productList');
const searchInput = document.querySelector('#searchInput');
const categorySelect = document.querySelector('#categorySelect');
const statusText = document.querySelector('#statusText');
const retryBtn = document.querySelector('#retryBtn');

// ===== 3. Fungsi bantu =====
function setStatus(pesan, tipe = '') {
  statusText.textContent = pesan;
  statusText.className = 'status ' + tipe;
}

function formatHarga(angka) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(angka);
}

function formatKategori(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (huruf) => huruf.toUpperCase());
}

// ===== 4. Fetch API (async function) =====
async function fetchProducts() {
  setStatus('Memuat data produk...', 'loading'); // loading
  retryBtn.hidden = true;
  productList.replaceChildren();

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Gagal mengambil data (status ' + response.status + ')');

    const data = await response.json();   // olah response JSON
    semuaProduk = data.products;          // simpan sementara

    isiKategori(semuaProduk);
    tampilkanProduk();
  } catch (error) {                       // error handling
    console.error(error);
    setStatus('Gagal memuat data: ' + error.message + '. Periksa koneksi internet.', 'error-status');
    retryBtn.hidden = false;
  }
}

// ===== 5. Isi dropdown kategori dari data =====
function isiKategori(produk) {
  const kategori = [...new Set(produk.map((p) => p.category))].sort();

  kategori.forEach((slug) => {
    const option = document.createElement('option');
    option.value = slug;
    option.textContent = formatKategori(slug);
    categorySelect.appendChild(option);
  });
}

// ===== 6. Filter (search + kategori) lalu render =====
function tampilkanProduk() {
  const kataKunci = searchInput.value.trim().toLowerCase();
  const kategori = categorySelect.value;

  const hasil = semuaProduk.filter((p) => {
    const cocokNama = p.title.toLowerCase().includes(kataKunci);
    const cocokKategori = kategori === 'all' || p.category === kategori;
    return cocokNama && cocokKategori;
  });

  renderProduk(hasil);

  if (hasil.length === 0) {
    setStatus('Produk tidak ditemukan.', 'error-status');
  } else {
    setStatus('Menampilkan ' + hasil.length + ' dari ' + semuaProduk.length + ' produk.', 'success');
  }
}

function renderProduk(daftar) {
  productList.replaceChildren();

  daftar.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = p.thumbnail;
    img.alt = p.title;
    img.loading = 'lazy';

    const nama = document.createElement('h3');
    nama.textContent = p.title;

    const kategori = document.createElement('span');
    kategori.className = 'badge';
    kategori.textContent = formatKategori(p.category);

    const harga = document.createElement('p');
    harga.className = 'price';
    harga.textContent = formatHarga(p.price);

    const rating = document.createElement('p');
    rating.className = 'rating';
    rating.textContent = '⭐ ' + p.rating;

    // Tombol → kirim data produk ke form.html lewat query string
    const link = document.createElement('a');
    link.className = 'btn secondary small';
    link.textContent = 'Buat Caption';
    link.href = 'form.html?nama=' + encodeURIComponent(p.title) +
                '&harga=' + encodeURIComponent(p.price);

    card.append(img, kategori, nama, harga, rating, link);
    productList.appendChild(card);
  });
}

// ===== 7. Event Listener =====
searchInput.addEventListener('input', tampilkanProduk);
categorySelect.addEventListener('change', tampilkanProduk);
retryBtn.addEventListener('click', fetchProducts);

// ===== 8. Jalankan saat halaman dibuka =====
fetchProducts();
