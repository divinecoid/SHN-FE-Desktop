// Jenis plat options
const jenisPlatOptions = ["A1100", "A5052", "A6061", "A2024", "A7075", "A3003"];
const hargaPerM2 = {
  A1100: 90000,
  A5052: 120000,
  A6061: 150000,
  A2024: 200000,
  A7075: 250000,
  A3003: 100000
};

function populateJenisPlat() {
  const select = document.getElementById('jenisPlat');
  select.innerHTML = '';
  jenisPlatOptions.forEach(jenis => {
    const opt = document.createElement('option');
    opt.value = jenis;
    opt.textContent = jenis;
    select.appendChild(opt);
  });
}

function formatRupiah(num) {
  return num.toLocaleString('id-ID');
}

function calcSubtotal() {
  const panjang = parseFloat(document.getElementById('panjang').value) || 0;
  const lebar = parseFloat(document.getElementById('lebar').value) || 0;
  const qty = parseInt(document.getElementById('qty').value) || 0;
  const jenis = document.getElementById('jenisPlat').value;
  const harga = hargaPerM2[jenis] || 0;
  const luas = panjang * lebar;
  const subtotal = Math.round(luas * harga * qty);
  document.getElementById('subtotal').textContent = formatRupiah(subtotal);
  return subtotal;
}

document.addEventListener('DOMContentLoaded', function() {
  populateJenisPlat();
  ['panjang','lebar','qty','jenisPlat'].forEach(id => {
    document.getElementById(id).addEventListener('input', calcSubtotal);
    document.getElementById(id).addEventListener('change', calcSubtotal);
  });
  calcSubtotal();
  const showBtn = document.getElementById('showFuiModal');
  const modal = document.getElementById('fuiModal');
  const overlay = document.getElementById('fuiOverlay');
  const closeBtn = document.getElementById('closeFuiModal');

  function openModal() {
    modal.style.display = 'block';
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    detailList = [];
    renderTable();
    document.getElementById('fuiHeaderForm').reset();
    document.getElementById('fuiDetailForm').reset();
    document.getElementById('subtotal').textContent = '0';
    document.getElementById('totalFUI').textContent = '0';
  }
  function closeModal() {
    modal.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    detailList = [];
    renderTable();
    document.getElementById('fuiHeaderForm').reset();
    document.getElementById('fuiDetailForm').reset();
    document.getElementById('subtotal').textContent = '0';
    document.getElementById('totalFUI').textContent = '0';
  }
  if (showBtn) showBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);

  // After submit, close modal
  const origSubmit = document.getElementById('submitFUI').onclick;
  document.getElementById('submitFUI').onclick = function(e) {
    if (origSubmit) origSubmit.call(this, e);
    setTimeout(closeModal, 100); // close after submit
  };

  renderHeaderTable();
  document.getElementById('fuiHeaderTable').addEventListener('click', function(e) {
    if (e.target.classList.contains('fuiDetailBtn')) {
      const idx = e.target.getAttribute('data-idx');
      showFuiDetail(idx);
    }
  });
  const closeBtnDetail = document.getElementById('closeFuiDetail');
  if (closeBtnDetail) closeBtnDetail.addEventListener('click', function() {
    document.getElementById('fuiDetailModal').style.display = 'none';
  });
});

let detailList = [];

function renderTable() {
  const tbody = document.querySelector('#itemTable tbody');
  tbody.innerHTML = '';
  let total = 0;
  detailList.forEach((item, idx) => {
    total += item.subtotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx+1}</td><td>${item.jenis}</td><td>${item.panjang}x${item.lebar} m</td><td>${item.tebal} mm</td><td>${item.qty}</td><td>Rp ${formatRupiah(item.subtotal)}</td><td><button data-idx="${idx}" class="delBtn">Hapus</button></td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('totalFUI').textContent = formatRupiah(total);
}

document.getElementById('tambahItem').addEventListener('click', function() {
  const panjang = parseFloat(document.getElementById('panjang').value);
  const lebar = parseFloat(document.getElementById('lebar').value);
  const tebal = parseFloat(document.getElementById('tebal').value);
  const jenis = document.getElementById('jenisPlat').value;
  const qty = parseInt(document.getElementById('qty').value);
  if (!panjang || !lebar || !tebal || !jenis || !qty) {
    alert('Lengkapi semua field detail!');
    return;
  }
  const harga = hargaPerM2[jenis] || 0;
  const luas = panjang * lebar;
  const subtotal = Math.round(luas * harga * qty);
  detailList.push({panjang, lebar, tebal, jenis, qty, subtotal});
  renderTable();
  document.getElementById('fuiDetailForm').reset();
  document.getElementById('subtotal').textContent = '0';
});

document.querySelector('#itemTable tbody').addEventListener('click', function(e) {
  if (e.target.classList.contains('delBtn')) {
    const idx = parseInt(e.target.getAttribute('data-idx'));
    detailList.splice(idx, 1);
    renderTable();
  }
});

document.getElementById('submitFUI').addEventListener('click', function() {
  const supplier = document.getElementById('supplier').value.trim();
  const dueDate = document.getElementById('dueDate').value;
  if (!supplier || !dueDate) {
    alert('Lengkapi data header!');
    return;
  }
  if (detailList.length === 0) {
    alert('Tambah minimal 1 item detail!');
    return;
  }
  let apList = JSON.parse(localStorage.getItem('apList')||'[]');
  const total = detailList.reduce((sum, d) => sum + d.subtotal, 0);
  const apId = 'AP' + Date.now();
  apList.push({
    id: apId,
    vendor: supplier,
    dueDate,
    tanggal: new Date().toISOString().slice(0,10),
    total,
    details: JSON.parse(JSON.stringify(detailList))
  });
  localStorage.setItem('apList', JSON.stringify(apList));
  alert('Pembelian berhasil disimpan dan masuk ke Account Payable!');
  detailList = [];
  renderTable();
  document.getElementById('fuiHeaderForm').reset();
  document.getElementById('fuiDetailForm').reset();
  document.getElementById('subtotal').textContent = '0';
  document.getElementById('totalFUI').textContent = '0';
  setTimeout(renderHeaderTable, 120);
});

function renderHeaderTable() {
  const tbody = document.querySelector('#fuiHeaderTable tbody');
  tbody.innerHTML = '';
  const apList = JSON.parse(localStorage.getItem('apList')||'[]');
  apList.forEach((ap, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${ap.vendor}</td><td>${ap.dueDate||'-'}</td><td>${ap.tanggal||'-'}</td><td>Rp${(ap.total||ap.nominal).toLocaleString()}</td><td><button class="fuiDetailBtn" data-idx="${idx}">Detail</button></td>`;
    tbody.appendChild(tr);
  });
}

function showFuiDetail(idx) {
  const apList = JSON.parse(localStorage.getItem('apList')||'[]');
  const ap = apList[idx];
  document.getElementById('fuiDetailModal').style.display = 'block';
  document.getElementById('fuiDetailInfo').innerHTML = `<b>Supplier:</b> ${ap.vendor}<br><b>Jatuh Tempo:</b> ${ap.dueDate||'-'}<br><b>Tanggal:</b> ${ap.tanggal||'-'}<br><b>Total:</b> Rp${(ap.total||ap.nominal).toLocaleString()}`;
  const tbody = document.querySelector('#fuiDetailTable tbody');
  tbody.innerHTML = '';
  if (ap.details && ap.details.length) {
    ap.details.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${item.jenis}</td><td>${item.panjang}x${item.lebar} m</td><td>${item.tebal} mm</td><td>${item.qty}</td><td>Rp ${item.subtotal.toLocaleString()}</td>`;
      tbody.appendChild(tr);
    });
  } else {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5">Tidak ada detail</td>';
    tbody.appendChild(tr);
  }
} 