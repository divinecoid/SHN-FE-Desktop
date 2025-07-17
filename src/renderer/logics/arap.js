// Helper: generate nomor invoice
function generateNoInvoice() {
  const date = new Date();
  const ymd = date.toISOString().slice(0,10).replace(/-/g,'');
  const count = (JSON.parse(localStorage.getItem('invoiceList')||'[]').length+1).toString().padStart(3,'0');
  return `INV-${ymd}-${count}`;
}

// Populate PO select (hanya PO yang belum dibuat invoice)
function populatePOSelect() {
  const select = document.getElementById('poSelect');
  select.innerHTML = '<option value="">-- Pilih PO --</option>';
  const poList = JSON.parse(localStorage.getItem('poList')||'[]');
  const invoiceList = JSON.parse(localStorage.getItem('invoiceList')||'[]');
  const invoicedPOs = invoiceList.map(inv => inv.noPO);
  poList.forEach(po => {
    if (!invoicedPOs.includes(po.noPO)) {
      const opt = document.createElement('option');
      opt.value = po.noPO;
      opt.textContent = `${po.noPO} (${po.items ? po.items.length + ' item' : po.jenis}, Rp${po.total.toLocaleString()})`;
      select.appendChild(opt);
    }
  });
}

// Buat invoice dari PO
function buatInvoice() {
  const select = document.getElementById('poSelect');
  if (!select.value) return alert('Pilih PO!');
  const poList = JSON.parse(localStorage.getItem('poList')||'[]');
  const po = poList.find(p => p.noPO === select.value);
  const invoice = {
    noInvoice: generateNoInvoice(),
    noPO: po.noPO,
    customer: po.customer || '-', // bisa dikembangkan
    total: po.total,
    status: 'Belum Lunas',
    pembayaran: []
  };
  const invoiceList = JSON.parse(localStorage.getItem('invoiceList')||'[]');
  invoiceList.push(invoice);
  localStorage.setItem('invoiceList', JSON.stringify(invoiceList));
  populatePOSelect();
  renderInvoiceTable();
}

// Kolom yang bisa di-hide
const invoiceColumns = [
  { key: 'noInvoice', label: 'No Invoice' },
  { key: 'noPO', label: 'No PO' },
  { key: 'customer', label: 'Customer' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
  { key: 'terbayar', label: 'Terbayar' },
  { key: 'sisa', label: 'Sisa Kurang Bayar' }
];

function renderColumnToggles() {
  const container = document.getElementById('columnToggles');
  container.innerHTML = '';
  invoiceColumns.forEach(col => {
    const label = document.createElement('label');
    label.style.cursor = 'pointer';
    label.innerHTML = `<input type="checkbox" data-col="${col.key}" checked> ${col.label}`;
    container.appendChild(label);
  });
  container.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', function() {
      toggleInvoiceColumn(this.dataset.col, this.checked);
    });
  });
  applyColumnVisibility();
}

function applyColumnVisibility() {
  // Ambil status checklist
  invoiceColumns.forEach(col => {
    const checked = document.querySelector(`#columnToggles input[data-col='${col.key}']`)?.checked;
    // th
    document.querySelectorAll(`#invoiceTable th[data-col='${col.key}']`).forEach(th => {
      if (checked) th.removeAttribute('data-hide');
      else th.setAttribute('data-hide', '1');
    });
    // td
    document.querySelectorAll(`#invoiceTable td[data-col='${col.key}']`).forEach(td => {
      if (checked) td.removeAttribute('data-hide');
      else td.setAttribute('data-hide', '1');
    });
  });
}

function toggleInvoiceColumn(colKey, show) {
  // th
  document.querySelectorAll(`#invoiceTable th[data-col='${colKey}']`).forEach(th => {
    if (show) th.removeAttribute('data-hide');
    else th.setAttribute('data-hide', '1');
  });
  // td
  document.querySelectorAll(`#invoiceTable td[data-col='${colKey}']`).forEach(td => {
    if (show) td.removeAttribute('data-hide');
    else td.setAttribute('data-hide', '1');
  });
  renderInvoiceTable();
  applyColumnVisibility();
}

// Update renderInvoiceTable untuk menambah data-col pada setiap td
function renderInvoiceTable() {
  const tbody = document.querySelector('#invoiceTable tbody');
  tbody.innerHTML = '';
  const invoiceList = JSON.parse(localStorage.getItem('invoiceList')||'[]');
  invoiceList.forEach((inv, idx) => {
    const pembayaran = inv.pembayaran.reduce((a,b)=>a+b,0);
    const sisa = inv.total - pembayaran;
    const status = sisa <= 0 ? 'Lunas' : 'Belum Lunas';
    // Buat array kolom sesuai urutan header
    const rowCells = [
      `<td data-col="noInvoice">${inv.noInvoice}</td>`,
      `<td data-col="noPO">${inv.noPO}</td>`,
      `<td data-col="customer">${inv.customer}</td>`,
      `<td data-col="total">Rp${inv.total.toLocaleString()}</td>`,
      `<td data-col="status">${status}</td>`,
      `<td data-col="terbayar">Rp${pembayaran.toLocaleString()}</td>`,
      `<td data-col="sisa">Rp${sisa.toLocaleString()}</td>`,
      `<td><input type="number" min="1" max="${sisa}" placeholder="Nominal" id="pay${idx}" style="width:90px;"> <button onclick="bayarInvoice(${idx})">Bayar</button></td>`
    ];
    const tr = document.createElement('tr');
    tr.innerHTML = rowCells.join('');
    tbody.appendChild(tr);
  });
  applyColumnVisibility();
}

// Fungsi pembayaran invoice (DP/termin)
window.bayarInvoice = function(idx) {
  const invoiceList = JSON.parse(localStorage.getItem('invoiceList')||'[]');
  const inv = invoiceList[idx];
  const input = document.getElementById('pay'+idx);
  const nominal = parseInt(input.value);
  if (!nominal || nominal <= 0) return alert('Nominal tidak valid');
  inv.pembayaran.push(nominal);
  localStorage.setItem('invoiceList', JSON.stringify(invoiceList));
  renderInvoiceTable();
}

// AP: Catat pembayaran ke vendor
function saveAP(e) {
  e.preventDefault();
  const vendor = document.getElementById('vendor').value;
  const nominal = parseInt(document.getElementById('apNominal').value);
  const tanggal = new Date().toLocaleDateString();
  const apList = JSON.parse(localStorage.getItem('apList')||'[]');
  apList.push({ vendor, nominal, tanggal });
  localStorage.setItem('apList', JSON.stringify(apList));
  renderAPTable();
  document.getElementById('apForm').reset();
}

// Render tabel AP
function renderAPTable() {
  const tbody = document.querySelector('#apTable tbody');
  tbody.innerHTML = '';
  const apList = JSON.parse(localStorage.getItem('apList')||'[]');
  apList.forEach((ap, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${ap.vendor}</td><td>Rp${(ap.total||ap.nominal).toLocaleString()}</td><td>${ap.tanggal||'-'}</td><td><button class="apDetailBtn" data-idx="${idx}">Detail</button></td>`;
    tbody.appendChild(tr);
  });
}

// Panggil renderColumnToggles di DOMContentLoaded
const origDOMContentLoaded = document.addEventListener;
document.addEventListener('DOMContentLoaded', function(e) {
  populatePOSelect();
  renderInvoiceTable();
  renderAPTable();
  renderColumnToggles();
  applyColumnVisibility();
  document.getElementById('buatInvoice').addEventListener('click', buatInvoice);
  document.getElementById('apForm').addEventListener('submit', saveAP);
  document.getElementById('apTable').addEventListener('click', function(e) {
    if (e.target.classList.contains('apDetailBtn')) {
      const idx = e.target.getAttribute('data-idx');
      showApDetail(idx);
    }
  });
  const closeBtn = document.getElementById('closeApDetail');
  if (closeBtn) closeBtn.addEventListener('click', function() {
    document.getElementById('apDetailModal').style.display = 'none';
  });
});

function showApDetail(idx) {
  const apList = JSON.parse(localStorage.getItem('apList')||'[]');
  const ap = apList[idx];
  document.getElementById('apDetailModal').style.display = 'block';
  document.getElementById('apDetailInfo').innerHTML = `<b>Supplier:</b> ${ap.vendor}<br><b>Jatuh Tempo:</b> ${ap.dueDate||'-'}<br><b>Tanggal:</b> ${ap.tanggal||'-'}<br><b>Total:</b> Rp${(ap.total||ap.nominal).toLocaleString()}`;
  const tbody = document.querySelector('#apDetailTable tbody');
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