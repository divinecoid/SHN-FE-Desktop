// SO (Sales Order) Logic
let currentItems = [];
let soList = JSON.parse(localStorage.getItem('soList') || '[]');
let filteredSOList = [...soList];

// Custom Modal Functions
function showModal(type, title, message) {
    const modal = document.getElementById('customModal');
    const icon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    
    // Set modal content based on type
    switch(type) {
        case 'success':
            icon.textContent = '✅';
            icon.style.color = '#27ae60';
            break;
        case 'error':
            icon.textContent = '❌';
            icon.style.color = '#e74c3c';
            break;
        case 'warning':
            icon.textContent = '⚠️';
            icon.style.color = '#f39c12';
            break;
        case 'info':
            icon.textContent = 'ℹ️';
            icon.style.color = '#3498db';
            break;
        default:
            icon.textContent = 'ℹ️';
            icon.style.color = '#3498db';
    }
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Show modal
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Focus on close button
    document.getElementById('modalCloseBtn').focus();
}

function hideModal() {
    const modal = document.getElementById('customModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
}

function showSuccessModal(message) {
    showModal('success', 'Berhasil!', message);
    
    // Auto-hide success modal after 3 seconds
    setTimeout(() => {
        hideModal();
    }, 3000);
}

function showErrorModal(message) {
    showModal('error', 'Error!', message);
}

function showWarningModal(message) {
    showModal('warning', 'Peringatan!', message);
}

function showInfoModal(message) {
    showModal('info', 'Informasi', message);
}



// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadMasterData();
    loadSOList();
    setupEventListeners();
    updateSummaryInfo();
});

function setupEventListeners() {
    // Modal close button listener
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', hideModal);
    }
    
    // Close modal when clicking outside
    const customModal = document.getElementById('customModal');
    if (customModal) {
        customModal.addEventListener('click', function(e) {
            if (e.target === customModal) {
                hideModal();
            }
        });
    }
    
    // Close modal with ESC key or Enter key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideModal();
        } else if (e.key === 'Enter' && document.getElementById('customModal').style.display === 'flex') {
            hideModal();
        }
    });
    
    // View toggle listeners
    document.getElementById('tambahSOBtn').addEventListener('click', function() {
        document.getElementById('listView').style.display = 'none';
        document.getElementById('inputView').style.display = 'block';
        // Initialize form
        initializeForm();
    });
    
    document.getElementById('kembaliKeListBtn').addEventListener('click', function() {
        document.getElementById('listView').style.display = 'block';
        document.getElementById('inputView').style.display = 'none';
        // Reset form
        resetForm();
    });
    
    // Form input listeners
    document.getElementById('panjang').addEventListener('input', updateItemForm);
    document.getElementById('lebar').addEventListener('input', updateItemForm);
    document.getElementById('qty').addEventListener('input', updateItemForm);
    document.getElementById('jenisBarang').addEventListener('change', updateItemForm);
    document.getElementById('bentukBarang').addEventListener('change', updateItemForm);
    document.getElementById('gradeBarang').addEventListener('change', updateItemForm);
    document.getElementById('customPrice').addEventListener('input', updateItemForm);
    document.getElementById('units').addEventListener('change', updateItemForm);
    document.getElementById('discount').addEventListener('input', updateItemForm);
    
    // Button listeners
    document.getElementById('tambahItem').addEventListener('click', tambahItem);
    
    // Simpan SO button
    const simpanSOBtn = document.getElementById('simpanSO');
    if (simpanSOBtn) {
        console.log('Simpan SO button found and event listener attached');
        simpanSOBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Simpan SO button clicked!');
            simpanSO();
        });
    } else {
        console.error('Simpan SO button not found!');
    }
    
    // Debug info
    console.log('Event listeners setup completed');
    console.log('Simpan SO button found:', !!document.getElementById('simpanSO'));
    console.log('Input view found:', !!document.getElementById('inputView'));
    
    // Add test functions to window for HTML onclick
    window.fillTestData = fillTestData;
    window.addTestItem = addTestItem;
    window.testSimpanSO = testSimpanSO;
    
    // Print SO button
    const printSOBtn = document.getElementById('printSO');
    if (printSOBtn) {
        printSOBtn.addEventListener('click', printSO);
    }
    
    // Customer info validation
    document.getElementById('customerName').addEventListener('input', validateCustomerInfo);
    document.getElementById('soDate').addEventListener('change', validateCustomerInfo);
    document.getElementById('deliveryDate').addEventListener('change', validateCustomerInfo);
    document.getElementById('asalGudang').addEventListener('change', validateCustomerInfo);
    
    // Search and filter listeners
    document.getElementById('searchSO').addEventListener('input', filterSOList);
    document.getElementById('filterStatus').addEventListener('change', filterSOList);
    document.getElementById('filterDate').addEventListener('change', filterSOList);
    document.getElementById('clearFilterBtn').addEventListener('click', clearFilters);
    document.getElementById('exportSOBtn').addEventListener('click', exportSOList);
}

function loadMasterData() {
    // Load Jenis Barang data
    const jenisBarangSelect = document.getElementById('jenisBarang');
    const jenisBarangData = JSON.parse(localStorage.getItem('jenisBarang') || '[]');
    
    // Clear existing options
    jenisBarangSelect.innerHTML = '<option value="">Pilih Jenis Barang</option>';
    
    // Add options from master data
    jenisBarangData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nama;
        option.dataset.deskripsi = item.deskripsi;
        jenisBarangSelect.appendChild(option);
    });
    
    // Load Bentuk Barang data
    const bentukBarangSelect = document.getElementById('bentukBarang');
    const bentukBarangData = JSON.parse(localStorage.getItem('bentukBarang') || '[]');
    
    // Clear existing options
    bentukBarangSelect.innerHTML = '<option value="">Pilih Bentuk Barang</option>';
    
    // Add options from master data
    bentukBarangData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nama;
        option.dataset.deskripsi = item.deskripsi;
        bentukBarangSelect.appendChild(option);
    });
    
    // Load Grade Barang data
    const gradeBarangSelect = document.getElementById('gradeBarang');
    const gradeBarangData = JSON.parse(localStorage.getItem('gradeBarang') || '[]');
    
    // Clear existing options
    gradeBarangSelect.innerHTML = '<option value="">Pilih Grade Barang</option>';
    
    // Add options from master data
    gradeBarangData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nama;
        option.dataset.deskripsi = item.deskripsi;
        gradeBarangSelect.appendChild(option);
    });
}

function updateItemForm() {
    const panjang = parseFloat(document.getElementById('panjang').value) || 0;
    const lebar = parseFloat(document.getElementById('lebar').value) || 0;
    const qty = parseInt(document.getElementById('qty').value) || 1;
    const jenisBarang = document.getElementById('jenisBarang').value;
    const bentukBarang = document.getElementById('bentukBarang').value;
    const gradeBarang = document.getElementById('gradeBarang').value;
    const customPrice = parseFloat(document.getElementById('customPrice').value) || 0;
    const units = document.getElementById('units').value;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    
    // Calculate luas
    const luas = panjang * lebar;
    
    // Calculate harga based on units
    let harga = 0;
    let unitDisplay = '';
    
    if (customPrice > 0) {
        harga = customPrice;
    } else {
        // Default pricing based on jenis barang (can be enhanced later)
        const jenisBarangSelect = document.getElementById('jenisBarang');
        const selectedJenis = jenisBarangSelect.selectedOptions[0];
        if (selectedJenis) {
            const jenisNama = selectedJenis.textContent;
            if (jenisNama.includes('Aluminium')) {
                harga = 150000; // Default aluminium price per m²
            } else if (jenisNama.includes('Stainless Steel')) {
                harga = 250000; // Default stainless steel price per m²
            } else {
                harga = 100000; // Default price per m²
            }
        } else {
            harga = 100000; // Default price per m²
        }
    }
    
    // Adjust price based on units
    if (units === 'per_lembar') {
        harga = harga * luas; // Price per sheet
        unitDisplay = '/lembar';
    } else if (units === 'per_kg') {
        // Estimate weight using aluminum density (2700 kg/m³) and default thickness 2mm
        const defaultKetebalan = 2; // mm
        const volume = luas * (defaultKetebalan / 1000); // Convert mm to m
        const weight = volume * 2700; // kg
        harga = harga * weight; // Price per kg
        unitDisplay = '/kg';
    } else { // per_m2
        unitDisplay = '/m²';
    }
    
    // Calculate total with discount
    const discountAmount = (harga * luas * qty * discount) / 100;
    const total = (harga * luas * qty) - discountAmount;
    
    // Update display
    document.getElementById('ketebalan').textContent = '2.00'; // Default thickness
    document.getElementById('luas').textContent = luas.toFixed(2);
    document.getElementById('harga').textContent = harga.toLocaleString('id-ID');
    document.getElementById('unitDisplay').textContent = unitDisplay;
    document.getElementById('total').textContent = total.toLocaleString('id-ID');
}

function tambahItem() {
    const panjang = parseFloat(document.getElementById('panjang').value);
    const lebar = parseFloat(document.getElementById('lebar').value);
    const qty = parseInt(document.getElementById('qty').value);
    const jenisBarang = document.getElementById('jenisBarang').value;
    const bentukBarang = document.getElementById('bentukBarang').value;
    const gradeBarang = document.getElementById('gradeBarang').value;
    const customPrice = parseFloat(document.getElementById('customPrice').value) || 0;
    const units = document.getElementById('units').value;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const notes = document.getElementById('notes').value;
    
    if (!panjang || !lebar || !qty || !jenisBarang || !bentukBarang || !gradeBarang) {
        showErrorModal('Mohon lengkapi semua field yang diperlukan');
        return;
    }
    
    // Get selected data
    const jenisBarangSelect = document.getElementById('jenisBarang');
    const bentukBarangSelect = document.getElementById('bentukBarang');
    const gradeBarangSelect = document.getElementById('gradeBarang');
    const selectedJenis = jenisBarangSelect.selectedOptions[0];
    const selectedBentuk = bentukBarangSelect.selectedOptions[0];
    const selectedGrade = gradeBarangSelect.selectedOptions[0];
    
    // Calculate values
    const luas = panjang * lebar;
    let harga = customPrice;
    
    if (harga === 0) {
        // Default pricing based on jenis barang
        if (selectedJenis) {
            const jenisNama = selectedJenis.textContent;
            if (jenisNama.includes('Aluminium')) {
                harga = 150000; // Default aluminium price per m²
            } else if (jenisNama.includes('Stainless Steel')) {
                harga = 250000; // Default stainless steel price per m²
            } else {
                harga = 100000; // Default price per m²
            }
        } else {
            harga = 100000; // Default price per m²
        }
    }
    
    // Adjust price based on units
    if (units === 'per_lembar') {
        harga = harga * luas;
    } else if (units === 'per_kg') {
        const defaultKetebalan = 2; // mm
        const volume = luas * (defaultKetebalan / 1000);
        const weight = volume * 2700;
        harga = harga * weight;
    }
    
    const discountAmount = (harga * luas * qty * discount) / 100;
    const total = (harga * luas * qty) - discountAmount;
    
    // Create item object
    const item = {
        id: Date.now(),
        jenisBarang: selectedJenis ? selectedJenis.textContent : '',
        bentukBarang: selectedBentuk ? selectedBentuk.textContent : '',
        gradeBarang: selectedGrade ? selectedGrade.textContent : '',
        panjang: panjang,
        lebar: lebar,
        qty: qty,
        luas: luas,
        ketebalan: 2.0, // Default thickness
        harga: harga,
        units: units,
        discount: discount,
        discountAmount: discountAmount,
        total: total,
        notes: notes
    };
    
    currentItems.push(item);
    
    // Clear form
    document.getElementById('panjang').value = '';
    document.getElementById('lebar').value = '';
    document.getElementById('qty').value = '1';
    document.getElementById('jenisBarang').value = '';
    document.getElementById('bentukBarang').value = '';
    document.getElementById('gradeBarang').value = '';
    document.getElementById('customPrice').value = '';
    document.getElementById('units').value = 'per_m2';
    document.getElementById('discount').value = '0';
    document.getElementById('notes').value = '';
    
    // Reset display
    document.getElementById('ketebalan').textContent = '-';
    document.getElementById('luas').textContent = '0.00';
    document.getElementById('harga').textContent = '0';
    document.getElementById('total').textContent = '0';
    
    // Update tables
    renderItemTable();
    updateSOSummary();
}

function renderItemTable() {
    const tbody = document.querySelector('#itemTable tbody');
    tbody.innerHTML = '';
    
    currentItems.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Format units display
        let unitsDisplay = '';
        if (item.units === 'per_m2') unitsDisplay = 'per m²';
        else if (item.units === 'per_lembar') unitsDisplay = 'per lembar';
        else if (item.units === 'per_kg') unitsDisplay = 'per kg';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.jenisBarang}</td>
            <td>${item.bentukBarang}</td>
            <td>${item.gradeBarang}</td>
            <td>${item.panjang} × ${item.lebar} m</td>
            <td>${item.qty}</td>
            <td>${item.luas.toFixed(2)} m²</td>
            <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
            <td>${unitsDisplay}</td>
            <td>${item.discount}%</td>
            <td>Rp ${item.total.toLocaleString('id-ID')}</td>
            <td>
                <button onclick="hapusItem(${item.id})" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function hapusItem(id) {
    currentItems = currentItems.filter(item => item.id !== id);
    renderItemTable();
    updateSOSummary();
}

function updateSOSummary() {
    const subtotal = currentItems.reduce((sum, item) => sum + (item.harga * item.luas * item.qty), 0);
    const totalDiscount = currentItems.reduce((sum, item) => sum + item.discountAmount, 0);
    const ppn = (subtotal - totalDiscount) * 0.11; // 11% PPN
    const totalSO = subtotal - totalDiscount + ppn;
    
    document.getElementById('subtotal').textContent = subtotal.toLocaleString('id-ID');
    document.getElementById('totalDiscount').textContent = totalDiscount.toLocaleString('id-ID');
    document.getElementById('ppn').textContent = ppn.toLocaleString('id-ID');
    document.getElementById('totalSO').textContent = totalSO.toLocaleString('id-ID');
}

function validateCustomerInfo() {
    const customerName = document.getElementById('customerName').value.trim();
    const soDate = document.getElementById('soDate').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const asalGudang = document.getElementById('asalGudang').value;
    
    const simpanButton = document.getElementById('simpanSO');
    const printButton = document.getElementById('printSO');
    
    if (customerName && soDate && deliveryDate && asalGudang && currentItems.length > 0) {
        simpanButton.disabled = false;
        printButton.disabled = false;
    } else {
        simpanButton.disabled = true;
        printButton.disabled = true;
    }
}

function simpanSO() {
    console.log('simpanSO function called');
    
    // Check if elements exist
    const customerNameEl = document.getElementById('customerName');
    const customerPhoneEl = document.getElementById('customerPhone');
    const customerEmailEl = document.getElementById('customerEmail');
    const customerAddressEl = document.getElementById('customerAddress');
    const soNumberEl = document.getElementById('soNumber');
    const soDateEl = document.getElementById('soDate');
    const deliveryDateEl = document.getElementById('deliveryDate');
    const paymentTermsEl = document.getElementById('paymentTerms');
    const asalGudangEl = document.getElementById('asalGudang');
    
    console.log('Elements found:', {
        customerName: !!customerNameEl,
        customerPhone: !!customerPhoneEl,
        customerEmail: !!customerEmailEl,
        customerAddress: !!customerAddressEl,
        soNumber: !!soNumberEl,
        soDate: !!soDateEl,
        deliveryDate: !!deliveryDateEl,
        paymentTerms: !!paymentTermsEl,
        asalGudang: !!asalGudangEl
    });
    
    const customerName = customerNameEl ? customerNameEl.value.trim() : '';
    const customerPhone = customerPhoneEl ? customerPhoneEl.value.trim() : '';
    const customerEmail = customerEmailEl ? customerEmailEl.value.trim() : '';
    const customerAddress = customerAddressEl ? customerAddressEl.value.trim() : '';
    const soNumber = soNumberEl ? soNumberEl.value : '';
    const soDate = soDateEl ? soDateEl.value : '';
    const deliveryDate = deliveryDateEl ? deliveryDateEl.value : '';
    const paymentTerms = paymentTermsEl ? paymentTermsEl.value : '';
    const asalGudang = asalGudangEl ? asalGudangEl.value : '';
    
    console.log('Form values:', {
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        soNumber,
        soDate,
        deliveryDate,
        paymentTerms,
        asalGudang,
        currentItemsLength: currentItems.length
    });
    
    if (!customerName || !soDate || !deliveryDate || !asalGudang || currentItems.length === 0) {
        showErrorModal('Mohon lengkapi informasi pelanggan, asal gudang, dan item yang diperlukan');
        return;
    }
    
    // Create SO object
    const so = {
        id: Date.now(),
        soNumber: soNumber,
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        customerAddress: customerAddress,
        tanggalSO: soDate,
        deliveryDate: deliveryDate,
        paymentTerms: paymentTerms,
        asalGudang: asalGudang,
        items: [...currentItems],
        subtotal: currentItems.reduce((sum, item) => sum + (item.harga * item.luas * item.qty), 0),
        totalDiscount: currentItems.reduce((sum, item) => sum + item.discountAmount, 0),
        ppn: (currentItems.reduce((sum, item) => sum + (item.harga * item.luas * item.qty), 0) - 
              currentItems.reduce((sum, item) => sum + item.discountAmount, 0)) * 0.11,
        total: (currentItems.reduce((sum, item) => sum + (item.harga * item.luas * item.qty), 0) - 
                currentItems.reduce((sum, item) => sum + item.discountAmount, 0)) * 1.11,
        status: 'Draft',
        createdAt: new Date().toISOString()
    };
    
    // Add to SO list
    soList.push(so);
    localStorage.setItem('soList', JSON.stringify(soList));
    
    // Clear form
    currentItems = [];
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('asalGudang').value = '';
    document.getElementById('soDate').valueAsDate = new Date();
    var newDeliveryDate = new Date();
    newDeliveryDate.setDate(newDeliveryDate.getDate() + 7);
    document.getElementById('deliveryDate').valueAsDate = newDeliveryDate;
    document.getElementById('paymentTerms').value = 'cash';
    
    // Clear item form
    document.getElementById('panjang').value = '';
    document.getElementById('lebar').value = '';
    document.getElementById('qty').value = '1';
    document.getElementById('jenisBarang').value = '';
    document.getElementById('bentukBarang').value = '';
    document.getElementById('gradeBarang').value = '';
    document.getElementById('customPrice').value = '';
    document.getElementById('units').value = 'per_m2';
    document.getElementById('discount').value = '0';
    document.getElementById('notes').value = '';
    
    // Reset displays
    document.getElementById('ketebalan').textContent = '-';
    document.getElementById('luas').textContent = '0.00';
    document.getElementById('harga').textContent = '0';
    document.getElementById('total').textContent = '0';
    updateSOSummary();
    
    // Generate new SO number
    generateSONumber();
    
    // Update tables
    renderItemTable();
    loadSOList();
    
    // Switch back to list view
    document.getElementById('listView').style.display = 'block';
    document.getElementById('inputView').style.display = 'none';
    
    showSuccessModal(`Sales Order ${soNumber} berhasil disimpan!`);
}

function loadSOList() {
    filteredSOList = [...soList];
    renderFilteredSOList();
    updateSummaryInfo();
}

function viewSO(id) {
    const so = soList.find(s => s.id === id);
    if (!so) return;
    
    // Create modal content
    let modalContent = `
        <div style="max-width: 800px; max-height: 65vh; overflow-y: auto;">
            <h2 style="text-align: center; color: #2c3e50; margin-bottom: 20px;">Sales Order: ${so.soNumber}</h2>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #2c3e50;">Informasi Pelanggan</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div><strong>Nama:</strong> ${so.customerName}</div>
                    <div><strong>Telepon:</strong> ${so.customerPhone || '-'}</div>
                    <div><strong>Email:</strong> ${so.customerEmail || '-'}</div>
                    <div><strong>Alamat:</strong> ${so.customerAddress || '-'}</div>
                    <div><strong>Tanggal SO:</strong> ${new Date(so.tanggalSO).toLocaleDateString('id-ID')}</div>
                    <div><strong>Tanggal Pengiriman:</strong> ${new Date(so.deliveryDate).toLocaleDateString('id-ID')}</div>
                    <div><strong>Syarat Pembayaran:</strong> ${getPaymentTermsDisplay(so.paymentTerms)}</div>
                    <div><strong>Asal Gudang:</strong> ${getWarehouseDisplay(so.asalGudang)}</div>
                </div>
            </div>
            
            <h3 style="color: #2c3e50;">Detail Item</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #ecf0f1;">
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Jenis Barang</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Bentuk</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Grade</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Dimensi</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Qty</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Luas</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Harga</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Diskon</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Total</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Stok Tersedia</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    so.items.forEach(item => {
        let unitsDisplay = '';
        if (item.units === 'per_m2') unitsDisplay = 'per m²';
        else if (item.units === 'per_lembar') unitsDisplay = 'per lembar';
        else if (item.units === 'per_kg') unitsDisplay = 'per kg';
        
        // Get stock info for this item
        const itemJenis = item.jenisBarang || item.jenis || 'Unknown';
        const stockInfo = getStockInfo(so.asalGudang, itemJenis, item.ketebalan);
        const stockDisplay = stockInfo ? 
            `${stockInfo.totalLuas.toFixed(2)} m² (${stockInfo.totalPieces} pcs)` : 
            'Tidak tersedia';
        const stockColor = stockInfo && stockInfo.totalLuas >= (item.luas * item.qty) ? '#27ae60' : '#e74c3c';
        
        modalContent += `
            <tr>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.jenisBarang || item.jenis || '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.bentukBarang || '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.gradeBarang || '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.panjang} × ${item.lebar} m</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.qty}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.luas.toFixed(2)} m²</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">Rp ${item.harga.toLocaleString('id-ID')} ${unitsDisplay}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.discount}%</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">Rp ${item.total.toLocaleString('id-ID')}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px; color: ${stockColor}; font-weight: bold;">${stockDisplay}</td>
            </tr>
        `;
    });
    
    modalContent += `
                </tbody>
            </table>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: right;">
                <div style="margin-bottom: 8px;"><strong>Subtotal:</strong> Rp ${so.subtotal.toLocaleString('id-ID')}</div>
                <div style="margin-bottom: 8px;"><strong>Total Diskon:</strong> Rp ${so.totalDiscount.toLocaleString('id-ID')}</div>
                <div style="margin-bottom: 8px;"><strong>PPN (11%):</strong> Rp ${so.ppn.toLocaleString('id-ID')}</div>
                <div style="font-size: 18px; font-weight: bold; color: #27ae60;"><strong>Total Harga SO:</strong> Rp ${so.total.toLocaleString('id-ID')}</div>
            </div>
            
            <!-- Stock Summary -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #2c3e50;">Ringkasan Ketersediaan Stok</h4>
                ${generateStockSummary(so)}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                ${so.status !== 'Completed' && so.status !== 'Cancelled' ? 
                    `<button onclick="convertToWO(${so.id})" style="background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; margin: 0 10px;">Convert to Work Order</button>` : 
                    '<span style="color: #95a5a6; font-style: italic;">SO ini tidak dapat dikonversi menjadi Work Order</span>'
                }
            </div>
        </div>
    `;
    
    // Show modal
    showModal('Detail Sales Order', modalContent);
}

function deleteSO(id) {
    if (confirm('Yakin ingin menghapus Sales Order ini?')) {
        soList = soList.filter(so => so.id !== id);
        localStorage.setItem('soList', JSON.stringify(soList));
        loadSOList();
        showSuccessModal('Sales Order berhasil dihapus');
    }
}

function getPaymentTermsDisplay(terms) {
    const termsMap = {
        'cash': 'Cash',
        '30_days': '30 Hari',
        '60_days': '60 Hari',
        '90_days': '90 Hari'
    };
    return termsMap[terms] || terms;
}

function getWarehouseDisplay(warehouseId) {
    if (!warehouseId) return '-';
    
    const warehouseList = JSON.parse(localStorage.getItem('warehouseList') || '[]');
    const warehouse = warehouseList.find(w => w.id == warehouseId);
    
    if (warehouse) {
        return `${warehouse.nama} - ${warehouse.lokasi}`;
    }
    
    return warehouseId; // Return ID if warehouse not found
}

function printSO() {
    if (currentItems.length === 0) {
        showWarningModal('Tidak ada item untuk di-print');
        return;
    }
    
    // Create print content
    let printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; margin-bottom: 10px;">SURYA LOGAM JAYA</h1>
                <h2 style="color: #2c3e50; margin-bottom: 5px;">PT. SURYA HARSA NAGARA</h2>
                <h3 style="color: #2c3e50; margin-bottom: 20px;">SALES ORDER</h3>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #2c3e50;">Informasi Pelanggan</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div><strong>No SO:</strong> ${document.getElementById('soNumber').value}</div>
                    <div><strong>Tanggal SO:</strong> ${document.getElementById('soDate').value}</div>
                    <div><strong>Nama:</strong> ${document.getElementById('customerName').value}</div>
                    <div><strong>Telepon:</strong> ${document.getElementById('customerPhone').value || '-'}</div>
                    <div><strong>Email:</strong> ${document.getElementById('customerEmail').value || '-'}</div>
                    <div><strong>Alamat:</strong> ${document.getElementById('customerAddress').value || '-'}</div>
                    <div><strong>Tanggal Pengiriman:</strong> ${document.getElementById('deliveryDate').value}</div>
                    <div><strong>Syarat Pembayaran:</strong> ${getPaymentTermsDisplay(document.getElementById('paymentTerms').value)}</div>
                    <div><strong>Asal Gudang:</strong> ${getWarehouseDisplay(document.getElementById('asalGudang').value)}</div>
                </div>
            </div>
            
            <h3 style="color: #2c3e50;">Detail Item</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #ecf0f1;">
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">No</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Jenis Barang</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Bentuk</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Grade</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Dimensi</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Qty</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Luas</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Harga</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Diskon</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Total</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    currentItems.forEach((item, index) => {
        let unitsDisplay = '';
        if (item.units === 'per_m2') unitsDisplay = 'per m²';
        else if (item.units === 'per_lembar') unitsDisplay = 'per lembar';
        else if (item.units === 'per_kg') unitsDisplay = 'per kg';
        
        printContent += `
            <tr>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${index + 1}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.jenisBarang || item.jenis || '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.bentukBarang || '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.gradeBarang || '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.panjang} × ${item.lebar} m</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.qty}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.luas.toFixed(2)} m²</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">Rp ${item.harga.toLocaleString('id-ID')} ${unitsDisplay}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.discount}%</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">Rp ${item.total.toLocaleString('id-ID')}</td>
            </tr>
        `;
    });
    
    const subtotal = currentItems.reduce((sum, item) => sum + (item.harga * item.luas * item.qty), 0);
    const totalDiscount = currentItems.reduce((sum, item) => sum + item.discountAmount, 0);
    const ppn = (subtotal - totalDiscount) * 0.11;
    const totalSO = subtotal - totalDiscount + ppn;
    
    printContent += `
                </tbody>
            </table>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: right;">
                <div style="margin-bottom: 8px;"><strong>Subtotal:</strong> Rp ${subtotal.toLocaleString('id-ID')}</div>
                <div style="margin-bottom: 8px;"><strong>Total Diskon:</strong> Rp ${totalDiscount.toLocaleString('id-ID')}</div>
                <div style="margin-bottom: 8px;"><strong>PPN (11%):</strong> Rp ${ppn.toLocaleString('id-ID')}</div>
                <div style="font-size: 18px; font-weight: bold; color: #27ae60;"><strong>Total Harga SO:</strong> Rp ${totalSO.toLocaleString('id-ID')}</div>
            </div>
            
            <div style="margin-top: 40px; text-align: center;">
                <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
            </div>
        </div>
    `;
    
    // Use Electron's print API if available, otherwise fallback to browser print
    if (window.electronAPI && window.electronAPI.printContent) {
        window.electronAPI.printContent(printContent);
    } else {
        // Browser fallback
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }
}

function showModal(title, content) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 10px; max-width: 90vw; max-height: 90vh; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div style="background: #2c3e50; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">${title}</h3>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
            </div>
            <div style="padding: 20px; max-height: calc(90vh - 80px);">
                ${content}
            </div>
        </div>
    `;
    
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// New functions for search, filter, and summary
function filterSOList() {
    const searchTerm = document.getElementById('searchSO').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const dateFilter = document.getElementById('filterDate').value;
    
    filteredSOList = soList.filter(so => {
        // Search filter
        const matchesSearch = !searchTerm || 
            so.soNumber.toLowerCase().includes(searchTerm) ||
            so.customerName.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = !statusFilter || so.status === statusFilter;
        
        // Date filter
        let matchesDate = true;
        if (dateFilter) {
            const soDate = new Date(so.tanggalSO);
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            switch (dateFilter) {
                case 'today':
                    matchesDate = soDate >= startOfDay && soDate < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000);
                    matchesDate = soDate >= startOfWeek;
                    break;
                case 'month':
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    matchesDate = soDate >= startOfMonth;
                    break;
                case 'quarter':
                    const currentQuarter = Math.floor(today.getMonth() / 3);
                    const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1);
                    matchesDate = soDate >= startOfQuarter;
                    break;
                case 'year':
                    const startOfYear = new Date(today.getFullYear(), 0, 1);
                    matchesDate = soDate >= startOfYear;
                    break;
            }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    renderFilteredSOList();
    updateSummaryInfo();
}

function renderFilteredSOList() {
    const tbody = document.querySelector('#soTable tbody');
    tbody.innerHTML = '';
    
    if (filteredSOList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 20px; color: #7f8c8d;">
                    Tidak ada Sales Order yang ditemukan
                </td>
            </tr>
        `;
        return;
    }
    
    filteredSOList.forEach(so => {
        const row = document.createElement('tr');
        const soDate = new Date(so.tanggalSO).toLocaleDateString('id-ID');
        
        // Check if SO can be converted to WO
        const canConvertToWO = so.status !== 'Completed' && so.status !== 'Cancelled';
        const convertButtonStyle = canConvertToWO ? 
            'background: #27ae60; color: white; cursor: pointer;' : 
            'background: #95a5a6; color: white; cursor: not-allowed;';
        const convertButtonText = canConvertToWO ? 'Convert to WO' : 'Cannot Convert';
        
        row.innerHTML = `
            <td>${so.soNumber}</td>
            <td>${so.customerName}</td>
            <td>${soDate}</td>
            <td>${getWarehouseDisplay(so.asalGudang)}</td>
            <td>${so.items.length}</td>
            <td>Rp ${so.total.toLocaleString('id-ID')}</td>
            <td><span style="color: ${getStatusColor(so.status)}">${so.status}</span></td>
            <td>
                <button onclick="viewSO(${so.id})" style="background: #3498db; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 4px;">View</button>
                <button onclick="${canConvertToWO ? 'convertToWO(' + so.id + ')' : 'void(0)'}" style="${convertButtonStyle} border: none; padding: 4px 8px; border-radius: 4px; margin-right: 4px;">${convertButtonText}</button>
                <button onclick="deleteSO(${so.id})" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusColor(status) {
    const statusColors = {
        'Draft': '#f39c12',
        'Confirmed': '#3498db',
        'In Progress': '#e67e22',
        'Completed': '#27ae60',
        'Cancelled': '#e74c3c'
    };
    return statusColors[status] || '#95a5a6';
}

function clearFilters() {
    document.getElementById('searchSO').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDate').value = '';
    filteredSOList = [...soList];
    renderFilteredSOList();
    updateSummaryInfo();
}

function updateSummaryInfo() {
    const totalSO = soList.length;
    const totalValue = soList.reduce((sum, so) => sum + so.total, 0);
    const avgValue = totalSO > 0 ? totalValue / totalSO : 0;
    
    // Count by status
    const statusCounts = {
        'Draft': 0,
        'Confirmed': 0,
        'In Progress': 0,
        'Completed': 0,
        'Cancelled': 0
    };
    
    soList.forEach(so => {
        statusCounts[so.status] = (statusCounts[so.status] || 0) + 1;
    });
    
    // Update display
    document.getElementById('totalSOCount').textContent = totalSO;
    document.getElementById('totalSOValue').textContent = totalValue.toLocaleString('id-ID');
    document.getElementById('avgSOValue').textContent = avgValue.toLocaleString('id-ID');
    document.getElementById('draftCount').textContent = statusCounts['Draft'];
    document.getElementById('confirmedCount').textContent = statusCounts['Confirmed'];
    document.getElementById('progressCount').textContent = statusCounts['In Progress'];
    document.getElementById('completedCount').textContent = statusCounts['Completed'];
}

function exportSOList() {
    if (filteredSOList.length === 0) {
        showWarningModal('Tidak ada data untuk di-export');
        return;
    }
    
    // Create CSV content
    let csvContent = 'No SO,Pelanggan,Tanggal SO,Asal Gudang,Jumlah Item,Total Harga,Status,Stok Status\n';
    
    filteredSOList.forEach(so => {
        const soDate = new Date(so.tanggalSO).toLocaleDateString('id-ID');
        const stockValidation = validateStockForWO(so);
        const stockStatus = stockValidation.isValid ? 'Stok Tersedia' : 'Stok Tidak Cukup';
        
        const row = [
            so.soNumber,
            so.customerName,
            soDate,
            getWarehouseDisplay(so.asalGudang),
            so.items.length,
            so.total.toLocaleString('id-ID'),
            so.status,
            stockStatus
        ].map(field => `"${field}"`).join(',');
        csvContent += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Sales_Order_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to convert SO to WO with stock validation
function convertToWO(soId) {
    const so = soList.find(s => s.id === soId);
    if (!so) {
        showErrorModal('Sales Order tidak ditemukan');
        return;
    }
    
    // Check if SO status is appropriate for conversion
    if (so.status === 'Completed' || so.status === 'Cancelled') {
        showErrorModal('Sales Order dengan status ' + so.status + ' tidak dapat dikonversi menjadi Work Order');
        return;
    }
    
    // Validate stock availability
    const stockValidation = validateStockForWO(so);
    if (!stockValidation.isValid) {
        showErrorModal('Stok tidak mencukupi untuk konversi ke WO:\n' + stockValidation.message);
        return;
    }
    
    // Confirm conversion
    if (confirm(`Yakin ingin mengkonversi Sales Order ${so.soNumber} menjadi Work Order?\n\nStok tersedia dan siap untuk diproses.`)) {
        // Create Work Order
        const wo = createWorkOrderFromSO(so);
        
        // Update SO status
        so.status = 'In Progress';
        localStorage.setItem('soList', JSON.stringify(soList));
        
        // Save Work Order
        saveWorkOrder(wo);
        
        // Refresh display
        loadSOList();
        
        showSuccessModal(`Sales Order ${so.soNumber} berhasil dikonversi menjadi Work Order ${wo.woNumber}!\nStatus SO diubah menjadi "In Progress".`);
    }
}

// Function to validate stock availability for WO conversion
function validateStockForWO(so) {
    let stockList = JSON.parse(localStorage.getItem('stockList') || '[]');
    const warehouseId = so.asalGudang;
    
    // If no stock data exists, create sample data for testing
    if (stockList.length === 0) {
        stockList = createSampleStockData();
        localStorage.setItem('stockList', JSON.stringify(stockList));
    }
    
    // Filter stock by warehouse
    const warehouseStock = stockList.filter(stock => stock.warehouseId == warehouseId);
    
    if (warehouseStock.length === 0) {
        return {
            isValid: false,
            message: `Tidak ada stok di gudang ${getWarehouseDisplay(warehouseId)}`
        };
    }
    
    // Check each item in SO
    for (const soItem of so.items) {
        const requiredArea = soItem.luas * soItem.qty; // Total area needed
        const itemJenis = soItem.jenisBarang || soItem.jenis || 'Unknown';
        const itemKetebalan = soItem.ketebalan || 2.0; // Default thickness
        
        const availableStock = warehouseStock.filter(stock => 
            stock.jenisPlat === itemJenis && 
            stock.ketebalan === itemKetebalan
        );
        
        if (availableStock.length === 0) {
            return {
                isValid: false,
                message: `Tidak ada stok ${itemJenis} dengan ketebalan ${itemKetebalan}mm di gudang`
            };
        }
        
        const totalAvailableArea = availableStock.reduce((sum, stock) => sum + stock.luas, 0);
        if (totalAvailableArea < requiredArea) {
            return {
                isValid: false,
                message: `Stok ${itemJenis} tidak mencukupi. Dibutuhkan: ${requiredArea.toFixed(2)}m², Tersedia: ${totalAvailableArea.toFixed(2)}m²`
            };
        }
    }
    
    return { isValid: true, message: 'Stok mencukupi' };
}

// Function to create sample stock data for testing
function createSampleStockData() {
    return [
        // Gudang Utama (ID: 1)
        {
            id: 1,
            warehouseId: 1,
            jenisPlat: 'Aluminium 1100',
            ketebalan: 1.0,
            panjang: 2.0,
            lebar: 1.0,
            luas: 2.0,
            qty: 10,
            satuan: 'm²',
            tanggalMasuk: new Date().toISOString(),
            supplier: 'Supplier A',
            notes: 'Sample stock data'
        },
        {
            id: 2,
            warehouseId: 1,
            jenisPlat: 'Aluminium 1100',
            ketebalan: 1.5,
            panjang: 2.0,
            lebar: 1.0,
            luas: 2.0,
            qty: 8,
            satuan: 'm²',
            tanggalMasuk: new Date().toISOString(),
            supplier: 'Supplier A',
            notes: 'Sample stock data'
        },
        {
            id: 3,
            warehouseId: 1,
            jenisPlat: 'Aluminium 6061',
            ketebalan: 2.0,
            panjang: 2.0,
            lebar: 1.0,
            luas: 2.0,
            qty: 15,
            satuan: 'm²',
            tanggalMasuk: new Date().toISOString(),
            supplier: 'Supplier B',
            notes: 'Sample stock data'
        },
        // Gudang Cabang 1 (ID: 2)
        {
            id: 4,
            warehouseId: 2,
            jenisPlat: 'Aluminium 1100',
            ketebalan: 1.0,
            panjang: 2.0,
            lebar: 1.0,
            luas: 2.0,
            qty: 12,
            satuan: 'm²',
            tanggalMasuk: new Date().toISOString(),
            supplier: 'Supplier C',
            notes: 'Sample stock data'
        },
        {
            id: 5,
            warehouseId: 2,
            jenisPlat: 'Aluminium 6061',
            ketebalan: 1.5,
            panjang: 2.0,
            lebar: 1.0,
            luas: 2.0,
            qty: 6,
            satuan: 'm²',
            tanggalMasuk: new Date().toISOString(),
            supplier: 'Supplier C',
            notes: 'Sample stock data'
        }
    ];
}

// Function to create Work Order from Sales Order
function createWorkOrderFromSO(so) {
    const woNumber = generateWONumber();
    const currentDate = new Date();
    
    const wo = {
        id: Date.now(),
        woNumber: woNumber,
        soNumber: so.soNumber,
        soId: so.id,
        customerName: so.customerName,
        customerPhone: so.customerPhone,
        customerEmail: so.customerEmail,
        customerAddress: so.customerAddress,
        tanggalWO: currentDate.toISOString(),
        deliveryDate: so.deliveryDate,
        asalGudang: so.asalGudang,
        items: so.items.map(item => ({
            ...item,
            status: 'Pending',
            progress: 0,
            notes: ''
        })),
        status: 'Pending',
        priority: 'Normal',
        assignedTo: '',
        estimatedDuration: '',
        actualStartDate: '',
        actualEndDate: '',
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString()
    };
    
    return wo;
}

// Function to generate Work Order number
function generateWONumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Get existing WO count for today
    const woList = JSON.parse(localStorage.getItem('woList') || '[]');
    const todayWO = woList.filter(wo => {
        const woDate = new Date(wo.tanggalWO);
        return woDate.getFullYear() === year && 
               woDate.getMonth() === today.getMonth() && 
               woDate.getDate() === today.getDate();
    });
    
    const sequence = todayWO.length + 1;
    return `WO-${year}${month}${day}-${String(sequence).padStart(3, '0')}`;
}

// Function to save Work Order
function saveWorkOrder(wo) {
    const woList = JSON.parse(localStorage.getItem('woList') || '[]');
    woList.push(wo);
    localStorage.setItem('woList', JSON.stringify(woList));
}

// Function to get stock information for display
function getStockInfo(warehouseId, jenisBarang, ketebalan) {
    let stockList = JSON.parse(localStorage.getItem('stockList') || '[]');
    
    // If no stock data exists, create sample data for testing
    if (stockList.length === 0) {
        stockList = createSampleStockData();
        localStorage.setItem('stockList', JSON.stringify(stockList));
    }
    
    // For now, we'll use a simplified approach since we don't have detailed stock mapping
    // In a real implementation, you would map jenisBarang to stock items
    const warehouseStock = stockList.filter(stock => 
        stock.warehouseId == warehouseId
    );
    
    if (warehouseStock.length === 0) return null;
    
    // Return aggregated stock info for the warehouse
    return {
        totalLuas: warehouseStock.reduce((sum, stock) => sum + stock.luas, 0),
        totalPieces: warehouseStock.reduce((sum, stock) => sum + stock.qty, 0),
        stockDetails: warehouseStock
    };
}

// Function to generate stock summary for SO
function generateStockSummary(so) {
    let stockList = JSON.parse(localStorage.getItem('stockList') || '[]');
    
    // If no stock data exists, create sample data for testing
    if (stockList.length === 0) {
        stockList = createSampleStockData();
        localStorage.setItem('stockList', JSON.stringify(stockList));
    }
    
    const warehouseStock = stockList.filter(stock => stock.warehouseId == so.asalGudang);
    
    if (warehouseStock.length === 0) {
        return '<div style="color: #e74c3c; font-weight: bold;">⚠️ Tidak ada stok tersedia di gudang ini</div>';
    }
    
    let summary = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">';
    
    // Group stock by jenis plat and ketebalan (for backward compatibility)
    const stockGroups = {};
    warehouseStock.forEach(stock => {
        const key = `${stock.jenisPlat}_${stock.ketebalan}`;
        if (!stockGroups[key]) {
            stockGroups[key] = {
                jenisPlat: stock.jenisPlat,
                ketebalan: stock.ketebalan,
                totalLuas: 0,
                totalPieces: 0
            };
        }
        stockGroups[key].totalLuas += stock.luas;
        stockGroups[key].totalPieces += stock.qty;
    });
    
    // Calculate required vs available
    const requiredItems = {};
    so.items.forEach(item => {
        // Handle both old and new item structure
        const itemJenis = item.jenisBarang || item.jenis || 'Unknown';
        const itemKetebalan = item.ketebalan || 2.0; // Default thickness
        const key = `${itemJenis}_${itemKetebalan}`;
        
        if (!requiredItems[key]) {
            requiredItems[key] = {
                jenisPlat: itemJenis,
                ketebalan: itemKetebalan,
                requiredLuas: 0,
                requiredQty: 0
            };
        }
        requiredItems[key].requiredLuas += item.luas * item.qty;
        requiredItems[key].requiredQty += item.qty;
    });
    
    // Generate summary
    Object.values(stockGroups).forEach(stock => {
        const required = requiredItems[`${stock.jenisPlat}_${stock.ketebalan}`];
        const isSufficient = required && stock.totalLuas >= required.requiredLuas;
        const statusColor = isSufficient ? '#27ae60' : '#e74c3c';
        const statusIcon = isSufficient ? '✅' : '⚠️';
        
        summary += `
            <div style="border: 1px solid #ddd; padding: 10px; border-radius: 6px; background: ${isSufficient ? '#f8fff8' : '#fff8f8'};">
                <div style="font-weight: bold; color: #2c3e50;">${stock.jenisPlat} (${stock.ketebalan}mm)</div>
                <div style="color: #7f8c8d; font-size: 14px;">Stok: ${stock.totalLuas.toFixed(2)} m² (${stock.totalPieces} pcs)</div>
                ${required ? `<div style="color: #7f8c8d; font-size: 14px;">Dibutuhkan: ${required.requiredLuas.toFixed(2)} m² (${required.requiredQty} pcs)</div>` : ''}
                <div style="color: ${statusColor}; font-weight: bold; margin-top: 5px;">${statusIcon} ${isSufficient ? 'Stok mencukupi' : 'Stok tidak mencukupi'}</div>
            </div>
        `;
    });
    
    summary += '</div>';
    return summary;
} 

// Helper functions for form initialization
function initializeForm() {
    // Set default dates
    document.getElementById('soDate').valueAsDate = new Date();
    var deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // Default delivery in 7 days
    document.getElementById('deliveryDate').valueAsDate = deliveryDate;
    
    // Load master data
    loadWarehouseData();
    loadJenisBarangData();
    loadBentukBarangData();
    loadGradeBarangData();
    
    // Auto-generate SO number
    generateSONumber();
}

function loadWarehouseData() {
    // Load warehouse data from localStorage or create sample data if none exists
    let warehouseList = JSON.parse(localStorage.getItem('warehouseList') || '[]');
    
    // If no warehouse data exists, create sample data
    if (warehouseList.length === 0) {
        warehouseList = [
            { id: 1, nama: 'Gudang Utama', lokasi: 'Jakarta Pusat' },
            { id: 2, nama: 'Gudang Cabang 1', lokasi: 'Jakarta Selatan' },
            { id: 3, nama: 'Gudang Cabang 2', lokasi: 'Jakarta Barat' },
            { id: 4, nama: 'Gudang Cabang 3', lokasi: 'Jakarta Timur' }
        ];
        localStorage.setItem('warehouseList', JSON.stringify(warehouseList));
    }
    
    // Populate warehouse select
    const asalGudangSelect = document.getElementById('asalGudang');
    asalGudangSelect.innerHTML = '<option value="">Pilih Gudang</option>';
    
    warehouseList.forEach(warehouse => {
        const option = document.createElement('option');
        option.value = warehouse.id;
        option.textContent = `${warehouse.nama} - ${warehouse.lokasi}`;
        asalGudangSelect.appendChild(option);
    });
}

function loadJenisBarangData() {
    // Load jenis barang data from localStorage or create sample data if none exists
    let jenisBarangList = JSON.parse(localStorage.getItem('jenisBarang') || '[]');
    
    // If no jenis barang data exists, create sample data
    if (jenisBarangList.length === 0) {
        jenisBarangList = [
            { id: 1, nama: 'Aluminium 1100', deskripsi: 'Aluminium murni dengan kemurnian 99.0%' },
            { id: 2, nama: 'Aluminium 6061', deskripsi: 'Aluminium alloy dengan magnesium dan silikon' },
            { id: 3, nama: 'Stainless Steel 304', deskripsi: 'Stainless steel austenitik' },
            { id: 4, nama: 'Stainless Steel 316', deskripsi: 'Stainless steel dengan molibdenum' }
        ];
        localStorage.setItem('jenisBarang', JSON.stringify(jenisBarangList));
    }
    
    // Populate jenis barang select
    const jenisBarangSelect = document.getElementById('jenisBarang');
    jenisBarangSelect.innerHTML = '<option value="">Pilih Jenis Barang</option>';
    
    jenisBarangList.forEach(jenis => {
        const option = document.createElement('option');
        option.value = jenis.id;
        option.textContent = jenis.nama;
        jenisBarangSelect.appendChild(option);
    });
}

function loadBentukBarangData() {
    // Load bentuk barang data from localStorage or create sample data if none exists
    let bentukBarangList = JSON.parse(localStorage.getItem('bentukBarang') || '[]');
    
    // If no bentuk barang data exists, create sample data
    if (bentukBarangList.length === 0) {
        bentukBarangList = [
            { id: 1, nama: 'Plat', deskripsi: 'Bentuk plat datar' },
            { id: 2, nama: 'Pipa', deskripsi: 'Bentuk pipa silindris' },
            { id: 3, nama: 'Profil', deskripsi: 'Bentuk profil khusus' },
            { id: 4, nama: 'Kawat', deskripsi: 'Bentuk kawat' }
        ];
        localStorage.setItem('bentukBarang', JSON.stringify(bentukBarangList));
    }
    
    // Populate bentuk barang select
    const bentukBarangSelect = document.getElementById('bentukBarang');
    bentukBarangSelect.innerHTML = '<option value="">Pilih Bentuk Barang</option>';
    
    bentukBarangList.forEach(bentuk => {
        const option = document.createElement('option');
        option.value = bentuk.id;
        option.textContent = bentuk.nama;
        bentukBarangSelect.appendChild(option);
    });
}

function loadGradeBarangData() {
    // Load grade barang data from localStorage or create sample data if none exists
    let gradeBarangList = JSON.parse(localStorage.getItem('gradeBarang') || '[]');
    
    // If no grade barang data exists, create sample data
    if (gradeBarangList.length === 0) {
        gradeBarangList = [
            { id: 1, nama: 'Grade A', deskripsi: 'Kualitas terbaik' },
            { id: 2, nama: 'Grade B', deskripsi: 'Kualitas baik' },
            { id: 3, nama: 'Grade C', deskripsi: 'Kualitas standar' },
            { id: 4, nama: 'Grade D', deskripsi: 'Kualitas rendah' }
        ];
        localStorage.setItem('gradeBarang', JSON.stringify(gradeBarangList));
    }
    
    // Populate grade barang select
    const gradeBarangSelect = document.getElementById('gradeBarang');
    gradeBarangSelect.innerHTML = '<option value="">Pilih Grade Barang</option>';
    
    gradeBarangList.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade.id;
        option.textContent = grade.nama;
        gradeBarangSelect.appendChild(option);
    });
}

function resetForm() {
    // Clear form fields
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('asalGudang').value = '';
    document.getElementById('panjang').value = '';
    document.getElementById('lebar').value = '';
    document.getElementById('qty').value = '1';
    document.getElementById('jenisBarang').value = '';
    document.getElementById('bentukBarang').value = '';
    document.getElementById('gradeBarang').value = '';
    document.getElementById('customPrice').value = '';
    document.getElementById('units').value = 'per_m2';
    document.getElementById('discount').value = '0';
    document.getElementById('notes').value = '';
    
    // Reset displays
    document.getElementById('ketebalan').textContent = '-';
    document.getElementById('luas').textContent = '0.00';
    document.getElementById('harga').textContent = '0';
    document.getElementById('total').textContent = '0';
    
    // Clear current items
    if (typeof currentItems !== 'undefined') {
        currentItems = [];
        renderItemTable();
        updateSOSummary();
    }
}

function generateSONumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Get existing SO count for today
    const existingSOs = JSON.parse(localStorage.getItem('soList') || '[]');
    const todaySOs = existingSOs.filter(so => {
        const soDate = new Date(so.tanggalSO);
        return soDate.getFullYear() === year && 
               soDate.getMonth() === today.getMonth() && 
               soDate.getDate() === day;
    });
    
    const sequence = todaySOs.length + 1;
    const soNumber = `SO-${year}${month}${day}-${String(sequence).padStart(3, '0')}`;
    document.getElementById('soNumber').value = soNumber;
}

// Function to fill test data for testing purposes
function fillTestData() {
    console.log('Filling test data...');
    
    // Fill customer information
    document.getElementById('customerName').value = 'PT Test Customer';
    document.getElementById('customerPhone').value = '08123456789';
    document.getElementById('customerEmail').value = 'test@customer.com';
    document.getElementById('customerAddress').value = 'Jl. Test No. 123, Jakarta Pusat';
    
    // Set dates
    const today = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(today.getDate() + 14); // 14 days from today
    
    document.getElementById('soDate').valueAsDate = today;
    document.getElementById('deliveryDate').valueAsDate = deliveryDate;
    
    // Set payment terms and warehouse
    document.getElementById('paymentTerms').value = '30_days';
    
    // Set warehouse if available
    const asalGudangSelect = document.getElementById('asalGudang');
    if (asalGudangSelect.options.length > 1) {
        asalGudangSelect.value = asalGudangSelect.options[1].value; // Select first warehouse
    }
    
    // Fill item form with test data
    document.getElementById('panjang').value = '2.5';
    document.getElementById('lebar').value = '1.2';
    document.getElementById('qty').value = '10';
    
    // Set item properties if available
    const jenisBarangSelect = document.getElementById('jenisBarang');
    if (jenisBarangSelect.options.length > 1) {
        jenisBarangSelect.value = jenisBarangSelect.options[1].value;
    }
    
    const bentukBarangSelect = document.getElementById('bentukBarang');
    if (bentukBarangSelect.options.length > 1) {
        bentukBarangSelect.value = bentukBarangSelect.options[1].value;
    }
    
    const gradeBarangSelect = document.getElementById('gradeBarang');
    if (gradeBarangSelect.options.length > 1) {
        gradeBarangSelect.value = gradeBarangSelect.options[1].value;
    }
    
    // Set price and units
    document.getElementById('customPrice').value = '150000';
    document.getElementById('units').value = 'per_m2';
    document.getElementById('discount').value = '5';
    document.getElementById('notes').value = 'Test order untuk testing sistem';
    
    // Trigger form update to calculate totals
    if (typeof updateItemForm === 'function') {
        updateItemForm();
    }
    
    // Add the item to the list
    if (typeof tambahItem === 'function') {
        setTimeout(() => {
            tambahItem();
            console.log('Test item added successfully');
        }, 100);
    }
    
    console.log('Test data filled successfully!');
    showSuccessModal('Test data berhasil diisi! Silakan klik "Tambah Item" jika belum ada item, lalu klik "Simpan SO"');
}

// Function to add test item to the list
function addTestItem() {
    console.log('Adding test item...');
    
    // Check if form has data
    const panjang = document.getElementById('panjang').value;
    const lebar = document.getElementById('lebar').value;
    const qty = document.getElementById('qty').value;
    
    if (!panjang || !lebar || !qty) {
        showWarningModal('Form item masih kosong! Klik "Fill Test Data" terlebih dahulu.');
        return;
    }
    
    // Add the item
    if (typeof tambahItem === 'function') {
        tambahItem();
        console.log('Test item added successfully');
        showSuccessModal('Test item berhasil ditambahkan! Sekarang bisa klik "Simpan SO"');
    } else {
        showErrorModal('Fungsi tambahItem tidak tersedia');
    }
}

// Function to test Simpan SO functionality
function testSimpanSO() {
    console.log('Testing Simpan SO...');
    
    // Check if we have items
    if (typeof currentItems !== 'undefined' && currentItems.length > 0) {
        console.log('Current items found:', currentItems.length);
        showInfoModal(`Ada ${currentItems.length} item dalam list. Mencoba simpan SO...`);
        
        // Try to save SO
        setTimeout(() => {
            if (typeof simpanSO === 'function') {
                simpanSO();
            } else {
                showErrorModal('Fungsi simpanSO tidak tersedia');
            }
        }, 1000);
    } else {
        showWarningModal('Belum ada item dalam list! Klik "Add Test Item" terlebih dahulu.');
    }
} 