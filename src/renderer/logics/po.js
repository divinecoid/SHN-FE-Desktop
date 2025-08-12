// Data dummy jenis plat & harga
const platTypes = [
  { kode: "A1100", ketebalan: 1.2, harga: 500000 },
  { kode: "A5052", ketebalan: 1.5, harga: 650000 },
  { kode: "A6061", ketebalan: 2.0, harga: 700000 },
  { kode: "A2024", ketebalan: 2.5, harga: 900000 },
  { kode: "A7075", ketebalan: 3.0, harga: 1200000 },
  { kode: "A3003", ketebalan: 1.0, harga: 550000 }
];

let currentItems = [];

function populateJenisPlat() {
  const select = document.getElementById('jenisPlat');
  select.innerHTML = '';
  platTypes.forEach(pt => {
    const opt = document.createElement('option');
    opt.value = pt.kode;
    opt.textContent = pt.kode;
    select.appendChild(opt);
  });
}

function getPlatData(kode) {
  return platTypes.find(pt => pt.kode === kode);
}

function generateNoPO() {
  const date = new Date();
  const ymd = date.toISOString().slice(0,10).replace(/-/g,'');
  const count = (JSON.parse(localStorage.getItem('poList')||'[]').length+1).toString().padStart(3,'0');
  return `PO-ALU-${ymd}-${count}`;
}

function updateItemForm() {
  const panjang = parseFloat(document.getElementById('panjang').value) || 0;
  const lebar = parseFloat(document.getElementById('lebar').value) || 0;
  const qty = parseInt(document.getElementById('qty').value) || 1;
  const jenis = document.getElementById('jenisPlat').value;
  const customPrice = parseFloat(document.getElementById('customPrice').value);
  const units = document.getElementById('units').value;
  const plat = getPlatData(jenis);
  const luas = panjang * lebar;
  
  // Update ketebalan and luas
  document.getElementById('ketebalan').textContent = plat ? plat.ketebalan : '';
  document.getElementById('luas').textContent = luas.toFixed(2);
  
  // Determine price to use (custom or from plat data)
  const harga = customPrice || (plat ? plat.harga : 0);
  
  // Update unit display
  const unitDisplay = document.getElementById('unitDisplay');
  switch(units) {
    case 'per_lembar':
      unitDisplay.textContent = '/lembar';
      break;
    case 'per_kg':
      unitDisplay.textContent = '/kg';
      break;
    case 'per_m2':
    default:
      unitDisplay.textContent = '/m²';
      break;
  }
  
  // Display price
  document.getElementById('harga').textContent = harga.toLocaleString();
  
  // Calculate total based on unit type
  let total = 0;
  if (harga > 0) {
    switch(units) {
      case 'per_lembar':
        total = harga * qty;
        break;
      case 'per_kg':
        // For per_kg calculation, we need weight. Using a rough estimate of aluminum density
        // Aluminum density ≈ 2.7 g/cm³ = 2700 kg/m³
        const volume = luas * (plat ? plat.ketebalan / 1000 : 0.002); // ketebalan in meters
        const weight = volume * 2700; // kg
        total = harga * weight * qty;
        break;
      case 'per_m2':
      default:
        total = harga * luas * qty;
        break;
    }
  }
  
  document.getElementById('total').textContent = total.toLocaleString();
}

function tambahItem() {
  const panjang = parseFloat(document.getElementById('panjang').value);
  const lebar = parseFloat(document.getElementById('lebar').value);
  const qty = parseInt(document.getElementById('qty').value);
  const jenis = document.getElementById('jenisPlat').value;
  const customPrice = parseFloat(document.getElementById('customPrice').value);
  const units = document.getElementById('units').value;
  const plat = getPlatData(jenis);
  
  if (!panjang || !lebar || !qty || !plat) {
    alert('Lengkapi data item!');
    return;
  }
  
  const luas = panjang * lebar;
  const harga = customPrice || plat.harga;
  
  // Calculate total based on unit type
  let total = 0;
  let weight = 0;
  
  switch(units) {
    case 'per_lembar':
      total = harga * qty;
      break;
    case 'per_kg':
      // Calculate weight for aluminum
      const volume = luas * (plat.ketebalan / 1000); // ketebalan in meters
      weight = volume * 2700; // kg (aluminum density)
      total = harga * weight * qty;
      break;
    case 'per_m2':
    default:
      total = harga * luas * qty;
      break;
  }
  
  currentItems.push({
    jenis,
    panjang,
    lebar,
    ketebalan: plat.ketebalan,
    qty,
    luas,
    harga,
    units,
    weight: weight || null,
    total
  });
  renderItemTable();
  document.getElementById('itemForm').reset();
  // Reset units to default
  document.getElementById('units').value = 'per_m2';
  updateItemForm();
}

function hapusItem(idx) {
  currentItems.splice(idx, 1);
  renderItemTable();
}

function renderItemTable() {
  const tbody = document.querySelector('#itemTable tbody');
  tbody.innerHTML = '';
  let totalPO = 0;
  currentItems.forEach((item, idx) => {
    totalPO += item.total;
    
    // Format unit display
    let unitText = '';
    switch(item.units) {
      case 'per_lembar':
        unitText = 'per lembar';
        break;
      case 'per_kg':
        unitText = 'per kg';
        break;
      case 'per_m2':
      default:
        unitText = 'per m²';
        break;
    }
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx+1}</td>
      <td>${item.jenis}</td>
      <td>${item.panjang}x${item.lebar}x${item.ketebalan}</td>
      <td>${item.qty}</td>
      <td>${item.luas.toFixed(2)} m²</td>
      <td>Rp ${item.harga.toLocaleString()}</td>
      <td>${unitText}</td>
      <td>Rp ${item.total.toLocaleString()}</td>
      <td><button onclick="hapusItem(${idx})">Hapus</button></td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('totalPO').textContent = totalPO.toLocaleString();
}

function simpanPO() {
  if (currentItems.length === 0) {
    alert('Tambahkan minimal 1 item ke PO!');
    return;
  }
  const total = currentItems.reduce((a, b) => a + b.total, 0);
  const noPO = generateNoPO();
  const po = {
    noPO,
    items: currentItems,
    total,
    status: "Menunggu Workshop"
  };
  const poList = JSON.parse(localStorage.getItem('poList')||'[]');
  poList.push(po);
  localStorage.setItem('poList', JSON.stringify(poList));
  currentItems = [];
  renderItemTable();
  renderPO();
  alert('PO berhasil disimpan!');
}

function renderPO() {
  const tbody = document.querySelector('#poTable tbody');
  tbody.innerHTML = '';
  const poList = JSON.parse(localStorage.getItem('poList')||'[]');
  poList.forEach(po => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${po.noPO}</td><td>${po.items.length}</td><td>Rp ${po.total.toLocaleString()}</td><td>${po.status}</td>`;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateJenisPlat();
  updateItemForm();
  renderItemTable();
  renderPO();
  document.getElementById('jenisPlat').addEventListener('change', updateItemForm);
  document.getElementById('panjang').addEventListener('input', updateItemForm);
  document.getElementById('lebar').addEventListener('input', updateItemForm);
  document.getElementById('qty').addEventListener('input', updateItemForm);
  document.getElementById('customPrice').addEventListener('input', updateItemForm);
  document.getElementById('units').addEventListener('change', updateItemForm);
  document.getElementById('tambahItem').addEventListener('click', tambahItem);
  document.getElementById('simpanPO').addEventListener('click', simpanPO);
}); 