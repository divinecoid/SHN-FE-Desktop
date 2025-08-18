// SO (Sales Order) Logic
let currentItems = [];
let soList = JSON.parse(localStorage.getItem('soList') || '[]');
let filteredSOList = [...soList];

// Modal functions are now imported from modal-utils.js



// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadMasterData();
    createSampleWarehouseData(); // Create sample warehouse data if none exists
    createSampleSOData(); // Create sample SO data if none exists
    loadSOList();
    setupEventListeners();
    updateSummaryInfo();
});

function setupEventListeners() {
    // Test Convert button listener
    const testConvertBtn = document.getElementById('testConvertBtn');
    if (testConvertBtn) {
        testConvertBtn.addEventListener('click', function() {
            console.log('Test Convert button clicked');
            console.log('Current SO list:', soList);
            console.log('Current stock list:', JSON.parse(localStorage.getItem('stockList') || '[]'));
            console.log('Current warehouse list:', JSON.parse(localStorage.getItem('warehouseList') || '[]'));
            
            if (soList.length > 0) {
                const firstSO = soList[0];
                console.log('Testing conversion with first SO:', firstSO);
                convertToWO(firstSO.id);
            } else {
                showWarningModal('Tidak ada Sales Order untuk diuji');
            }
        });
    }
    
    // Fill Test Data button listener
    const fillTestDataBtn = document.getElementById('fillTestDataBtn');
    if (fillTestDataBtn) {
        fillTestDataBtn.addEventListener('click', function() {
            console.log('Fill Test Data button clicked');
            fillTestData();
        });
    }
    
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
    showConfirmModal(
        'Konfirmasi Hapus',
        'Yakin ingin menghapus Sales Order ini?',
        () => {
            soList = soList.filter(so => so.id !== id);
            localStorage.setItem('soList', JSON.stringify(soList));
            loadSOList();
            showSuccessModal('Sales Order berhasil dihapus');
        }
    );
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
        
        // Enhanced button text for partial WO
        let convertButtonText = 'Convert to WO';
        if (so.status === 'Partial WO') {
            convertButtonText = `Re-Convert (${so.partialWOInfo?.conversionRate || '0'}%)`;
        } else if (!canConvertToWO) {
            convertButtonText = 'Cannot Convert';
        }
        
        // Enhanced status display for partial WO
        let statusDisplay = so.status;
        if (so.status === 'Partial WO' && so.partialWOInfo) {
            statusDisplay = `Partial WO (${so.partialWOInfo.conversionRate}%)`;
        }
        
        // Add info buttons for partial WO
        let infoButtons = '';
        if (so.status === 'Partial WO' && so.partialWOInfo) {
            infoButtons += `<button class="btn-info" onclick="showPartialWOInfo(${so.id})" style="background: #9b59b6; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-right: 4px;">ℹ️ Info</button>`;
            
            // Add stock reduction details button if available
            if (so.partialWOInfo.stockReduction) {
                infoButtons += `<button class="btn-stock" onclick="showStockReductionDetails(${so.id})" style="background: #e67e22; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-right: 4px;">📦 Stok</button>`;
            }
        }
        
        row.innerHTML = `
            <td>${so.soNumber}</td>
            <td>${so.customerName}</td>
            <td>${soDate}</td>
            <td>${getWarehouseDisplay(so.asalGudang)}</td>
            <td>${so.items.length}</td>
            <td>Rp ${so.total.toLocaleString('id-ID')}</td>
            <td><span style="color: ${getStatusColor(so.status)}">${statusDisplay}</span></td>
            <td>
                ${infoButtons}
                <button class="btn-view" onclick="viewSO(${so.id})">View</button>
                <button class="btn-convert" onclick="convertToWO(${so.id})" ${!canConvertToWO ? 'disabled' : ''}>${convertButtonText}</button>
                <button class="btn-hapus" onclick="deleteSO(${so.id})">Hapus</button>
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
        'Partial WO': '#9b59b6', // Purple for partial conversion
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
        'Partial WO': 0,
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
    document.getElementById('partialWOCount').textContent = statusCounts['Partial WO'];
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
    try {
        console.log('Converting SO to WO:', soId);
        
        const so = soList.find(s => s.id === soId);
        if (!so) {
            showErrorModal('Sales Order tidak ditemukan');
            return;
        }
        
        console.log('SO found:', so);
        
        // Check if SO status is appropriate for conversion
        if (so.status === 'Completed' || so.status === 'Cancelled') {
            showErrorModal('Sales Order dengan status ' + so.status + ' tidak dapat dikonversi menjadi Work Order');
            return;
        }
        
        // Check if SO has items
        if (!so.items || so.items.length === 0) {
            showErrorModal('Sales Order tidak memiliki item yang dapat dikonversi');
            return;
        }
        
        // Validate stock availability
        const stockValidation = validateStockForWO(so);
        console.log('Stock validation result:', stockValidation);
        
        if (!stockValidation.isValid) {
            // Show detailed information about what can and cannot be converted
            let errorMessage = 'Stok tidak mencukupi untuk konversi ke WO:\n\n';
            
            if (stockValidation.convertibleItems.length > 0) {
                errorMessage += `✅ Item yang dapat dikonversi (${stockValidation.convertibleItems.length}):\n`;
                stockValidation.convertibleItems.forEach(item => {
                    errorMessage += `   • ${item.jenisBarang || item.jenis} - ${item.qty} pcs (${item.luas}m²)\n`;
                });
                errorMessage += `\n💰 Total nilai: Rp ${stockValidation.totalConvertibleValue.toLocaleString('id-ID')}\n\n`;
            }
            
            if (stockValidation.nonConvertibleItems.length > 0) {
                errorMessage += `❌ Item yang tidak dapat dikonversi (${stockValidation.nonConvertibleItems.length}):\n`;
                stockValidation.nonConvertibleItems.forEach(item => {
                    errorMessage += `   • ${item.jenisBarang || item.jenis} - ${item.reason}\n`;
                });
                errorMessage += `\n💰 Total nilai: Rp ${stockValidation.totalNonConvertibleValue.toLocaleString('id-ID')}\n\n`;
            }
            
            errorMessage += `📊 Tingkat konversi: ${stockValidation.conversionRate}%`;
            
            // Ask user if they want to proceed with partial conversion
            if (stockValidation.convertibleItems.length > 0) {
                showConfirmModal(
                    'Konversi Partial',
                    errorMessage + '\n\n' +
                    'Apakah Anda ingin melanjutkan dengan konversi partial?\n' +
                    'Hanya item yang stoknya mencukupi yang akan dikonversi menjadi WO.',
                    () => {
                        // Proceed with partial conversion
                        proceedWithPartialConversion(so, stockValidation);
                    }
                );
                return;
            }
            
            showErrorModal(errorMessage);
            return;
        }
        
        // Confirm conversion (full conversion)
        showConfirmModal(
            'Konversi ke Work Order',
            `Yakin ingin mengkonversi Sales Order ${so.soNumber} menjadi Work Order?\n\nSemua item (${stockValidation.convertibleItems.length}) dapat dikonversi.\nStok tersedia dan siap untuk diproses.`,
            () => {
                try {
                    // Create Work Order with all items
                    const wo = createWorkOrderFromSO(so, stockValidation.convertibleItems);
                    console.log('Work Order created (full):', wo);
                    
                    // Update SO status
                    so.status = 'In Progress';
                    localStorage.setItem('soList', JSON.stringify(soList));
                    
                    // Save Work Order
                    saveWorkOrder(wo);
                    console.log('Work Order saved successfully');
                    
                    // Refresh display
                    renderFilteredSOList();
                    updateSummaryInfo();
                    
                    // Build success message with stock reduction info
                    let successMessage = `Sales Order ${so.soNumber} berhasil dikonversi menjadi Work Order ${wo.woNumber}!\n\n`;
                    successMessage += `✅ Semua ${stockValidation.convertibleItems.length} item berhasil dikonversi\n`;
                    successMessage += `💰 Total nilai: Rp ${stockValidation.totalConvertibleValue.toLocaleString('id-ID')}\n\n`;
                    
                    // Add stock reduction information
                    if (wo.stockReduction && wo.stockReduction.success) {
                        successMessage += `📦 Pengurangan Stok:\n`;
                        successMessage += `   • Total stok berkurang: ${wo.stockReduction.totalReduced.toFixed(2)}m²\n`;
                        successMessage += `   • Item yang diproses: ${wo.stockReduction.itemsProcessed}\n`;
                        successMessage += `   • Status: ${wo.stockReduction.message}\n\n`;
                    }
                    
                    successMessage += `📊 Status SO diubah menjadi "In Progress"`;
                    
                    showSuccessModal(successMessage);
                    
                    // Redirect to Work Order page after successful conversion
                    setTimeout(() => {
                        showConfirmModal(
                            'Lihat Work Order',
                            'Konversi berhasil! Apakah Anda ingin melihat Work Order yang baru dibuat?',
                            () => {
                                window.location.href = 'workorder.html';
                            }
                        );
                    }, 2000);
                    
                } catch (error) {
                    console.error('Error during conversion:', error);
                    showErrorModal('Terjadi kesalahan saat mengkonversi SO ke WO: ' + error.message);
                }
            }
        );
    } catch (error) {
        console.error('Error in convertToWO:', error);
        showErrorModal('Terjadi kesalahan: ' + error.message);
    }
}

// Function to proceed with partial conversion
function proceedWithPartialConversion(so, stockValidation) {
    try {
        console.log('Proceeding with partial conversion for SO:', so.soNumber);
        console.log('Convertible items:', stockValidation.convertibleItems);
        console.log('Non-convertible items:', stockValidation.nonConvertibleItems);
        
        // Create Work Order with only convertible items
        const wo = createWorkOrderFromSO(so, stockValidation.convertibleItems);
        console.log('Partial Work Order created:', wo);
        
        // Update SO status to indicate partial conversion
        so.status = 'Partial WO';
        so.partialWOInfo = {
            convertedItems: stockValidation.convertibleItems.length,
            totalItems: so.items.length,
            conversionRate: stockValidation.conversionRate,
            convertedValue: stockValidation.totalConvertibleValue,
            nonConvertedValue: stockValidation.totalNonConvertibleValue,
            convertedAt: new Date().toISOString(),
            stockReduction: wo.stockReduction // Store stock reduction info
        };
        
        localStorage.setItem('soList', JSON.stringify(soList));
        
        // Save Work Order
        saveWorkOrder(wo);
        console.log('Partial Work Order saved successfully');
        
        // Refresh display
        renderFilteredSOList();
        updateSummaryInfo();
        
        // Show success message with detailed information
        let successMessage = `Sales Order ${so.soNumber} berhasil dikonversi menjadi Work Order ${wo.woNumber}!\n\n`;
        successMessage += `✅ Item yang dikonversi (${stockValidation.convertibleItems.length}):\n`;
        stockValidation.convertibleItems.forEach(item => {
            successMessage += `   • ${item.jenisBarang || item.jenis} - ${item.qty} pcs (${item.luas}m²)\n`;
        });
        successMessage += `\n💰 Total nilai dikonversi: Rp ${stockValidation.totalConvertibleValue.toLocaleString('id-ID')}\n\n`;
        
        // Add stock reduction information
        if (wo.stockReduction && wo.stockReduction.success) {
            successMessage += `📦 Pengurangan Stok:\n`;
            successMessage += `   • Total stok berkurang: ${wo.stockReduction.totalReduced.toFixed(2)}m²\n`;
            successMessage += `   • Item yang diproses: ${wo.stockReduction.itemsProcessed}\n`;
            successMessage += `   • Status: ${wo.stockReduction.message}\n\n`;
        }
        
        if (stockValidation.nonConvertibleItems.length > 0) {
            successMessage += `⚠️ Item yang tidak dikonversi (${stockValidation.nonConvertibleItems.length}):\n`;
            stockValidation.nonConvertibleItems.forEach(item => {
                successMessage += `   • ${item.jenisBarang || item.jenis} - ${item.reason}\n`;
            });
            successMessage += `\n💰 Total nilai tidak dikonversi: Rp ${stockValidation.totalNonConvertibleValue.toLocaleString('id-ID')}\n\n`;
        }
        
        successMessage += `📊 Tingkat konversi: ${stockValidation.conversionRate}%\n📋 Status SO diubah menjadi "Partial WO"`;
        
        showSuccessModal(successMessage);
        
        // Redirect to Work Order page after successful conversion
        setTimeout(() => {
            showConfirmModal(
                'Lihat Work Order',
                'Konversi partial berhasil! Apakah Anda ingin melihat Work Order yang baru dibuat?',
                () => {
                    window.location.href = 'workorder.html';
                }
            );
        }, 2000);
        
    } catch (error) {
        console.error('Error during partial conversion:', error);
        showErrorModal('Terjadi kesalahan saat konversi partial: ' + error.message);
    }
}

// Function to show partial WO information
function showPartialWOInfo(soId) {
    try {
        const so = soList.find(s => s.id === soId);
        if (!so || so.status !== 'Partial WO' || !so.partialWOInfo) {
            showWarningModal('Informasi Partial WO tidak tersedia');
            return;
        }
        
        const info = so.partialWOInfo;
        let message = `📋 Informasi Konversi Partial WO\n\n`;
        message += `📊 Sales Order: ${so.soNumber}\n`;
        message += `👤 Customer: ${so.customerName}\n\n`;
        message += `✅ Item yang berhasil dikonversi: ${info.convertedItems} dari ${info.totalItems}\n`;
        message += `📈 Tingkat konversi: ${info.conversionRate}%\n\n`;
        message += `💰 Nilai yang dikonversi: Rp ${info.convertedValue.toLocaleString('id-ID')}\n`;
        message += `⚠️ Nilai yang tidak dikonversi: Rp ${info.nonConvertedValue.toLocaleString('id-ID')}\n\n`;
        message += `📅 Waktu konversi: ${new Date(info.convertedAt).toLocaleString('id-ID')}\n\n`;
        message += `💡 Anda dapat mengkonversi ulang untuk item yang belum dikonversi dengan klik tombol "Re-Convert"`;
        
        // Add stock reduction information if available
        if (so.partialWOInfo && so.partialWOInfo.stockReduction) {
            message += `\n\n📦 Informasi Pengurangan Stok:\n`;
            message += `   • Total stok berkurang: ${so.partialWOInfo.stockReduction.totalReduced.toFixed(2)}m²\n`;
            message += `   • Item yang diproses: ${so.partialWOInfo.stockReduction.itemsProcessed}\n`;
            message += `   • Status: ${so.partialWOInfo.stockReduction.message}`;
        }
        
        showInfoModal(message);
        
    } catch (error) {
        console.error('Error showing partial WO info:', error);
        showErrorModal('Terjadi kesalahan saat menampilkan info Partial WO: ' + error.message);
    }
}

// Function to show detailed stock reduction information
function showStockReductionDetails(soId) {
    try {
        const so = soList.find(s => s.id === soId);
        if (!so || !so.partialWOInfo || !so.partialWOInfo.stockReduction) {
            showWarningModal('Informasi pengurangan stok tidak tersedia');
            return;
        }
        
        const stockReduction = so.partialWOInfo.stockReduction;
        let message = `📦 Detail Pengurangan Stok\n\n`;
        message += `📊 Sales Order: ${so.soNumber}\n`;
        message += `👤 Customer: ${so.customerName}\n`;
        message += `📅 Waktu: ${new Date(so.partialWOInfo.convertedAt).toLocaleString('id-ID')}\n\n`;
        message += `📈 Ringkasan:\n`;
        message += `   • Total stok berkurang: ${stockReduction.totalReduced.toFixed(2)}m²\n`;
        message += `   • Item yang diproses: ${stockReduction.itemsProcessed}\n`;
        message += `   • Status: ${stockReduction.message}\n\n`;
        
        if (stockReduction.details && stockReduction.details.length > 0) {
            message += `📋 Detail per Item:\n`;
            stockReduction.details.forEach((detail, index) => {
                message += `\n${index + 1}. ${detail.itemName}\n`;
                message += `   • Status: ${detail.status}\n`;
                message += `   • Dibutuhkan: ${detail.required.toFixed(2)}m²\n`;
                message += `   • Berkurang: ${detail.reduced.toFixed(2)}m²\n`;
                
                if (detail.stockReductions && detail.stockReductions.length > 0) {
                    message += `   • Detail stok:\n`;
                    detail.stockReductions.forEach(stock => {
                        message += `     - Stock ID ${stock.stockId}: ${stock.reduced.toFixed(2)}m² (${stock.originalLuas.toFixed(2)}m² → ${stock.remaining.toFixed(2)}m²)\n`;
                    });
                }
            });
        }
        
        showInfoModal(message);
        
    } catch (error) {
        console.error('Error showing stock reduction details:', error);
        showErrorModal('Terjadi kesalahan saat menampilkan detail pengurangan stok: ' + error.message);
    }
}

// Function to reduce stock quantities when creating Work Order
function reduceStockForWO(itemsForWO, warehouseId) {
    try {
        console.log('Reducing stock for WO items:', itemsForWO);
        console.log('Warehouse ID:', warehouseId);
        
        let stockList = JSON.parse(localStorage.getItem('stockList') || '[]');
        const warehouseStock = stockList.filter(stock => stock.warehouseId == warehouseId);
        
        if (warehouseStock.length === 0) {
            console.warn('No stock found in warehouse:', warehouseId);
            return {
                success: false,
                message: 'Tidak ada stok di gudang',
                totalReduced: 0,
                itemsProcessed: 0,
                details: []
            };
        }
        
        const reductionDetails = [];
        let totalReduced = 0;
        let itemsProcessed = 0;
        
        // Process each item in the WO
        for (const woItem of itemsForWO) {
            console.log('Processing WO item:', woItem);
            
            const requiredArea = woItem.luas * woItem.qty;
            const itemJenis = woItem.jenisBarang || woItem.jenis || 'Unknown';
            const itemKetebalan = woItem.ketebalan || 2.0;
            
            console.log('Required area:', requiredArea, 'Item jenis:', itemJenis, 'Ketebalan:', itemKetebalan);
            
            // Find matching stock items
            const matchingStocks = warehouseStock.filter(stock => {
                const stockMatches = stock.jenisPlat && stock.jenisPlat.includes(itemJenis.split(' ')[0]);
                const thicknessMatches = Math.abs(stock.ketebalan - itemKetebalan) <= 0.5;
                return stockMatches && thicknessMatches;
            });
            
            if (matchingStocks.length === 0) {
                console.warn('No matching stock found for item:', woItem);
                reductionDetails.push({
                    itemId: woItem.id,
                    itemName: itemJenis,
                    status: 'No matching stock',
                    reduced: 0,
                    required: requiredArea
                });
                continue;
            }
            
            // Sort stocks by available area (largest first) for efficient reduction
            matchingStocks.sort((a, b) => b.luas - a.luas);
            
            let remainingRequired = requiredArea;
            let itemReduced = 0;
            const stockReductions = [];
            
            // Reduce stock quantities
            for (const stock of matchingStocks) {
                if (remainingRequired <= 0) break;
                
                const availableInStock = stock.luas;
                const toReduce = Math.min(availableInStock, remainingRequired);
                
                // Reduce stock quantity
                stock.luas -= toReduce;
                stock.qty = Math.max(1, Math.floor(stock.luas / (stock.panjang * stock.lebar)));
                
                // Update stock item
                stock.updatedAt = new Date().toISOString();
                
                stockReductions.push({
                    stockId: stock.id,
                    originalLuas: availableInStock,
                    reduced: toReduce,
                    remaining: stock.luas
                });
                
                remainingRequired -= toReduce;
                itemReduced += toReduce;
                
                console.log(`Reduced stock ${stock.id}: ${toReduce}m² (${availableInStock}m² → ${stock.luas}m²)`);
                
                // Remove stock if completely consumed
                if (stock.luas <= 0) {
                    stock.luas = 0;
                    stock.qty = 0;
                    stock.status = 'Depleted';
                }
            }
            
            if (itemReduced > 0) {
                itemsProcessed++;
                totalReduced += itemReduced;
                
                reductionDetails.push({
                    itemId: woItem.id,
                    itemName: itemJenis,
                    status: 'Success',
                    reduced: itemReduced,
                    required: requiredArea,
                    remaining: remainingRequired,
                    stockReductions: stockReductions
                });
                
                console.log(`Item ${itemJenis}: Reduced ${itemReduced}m², Remaining: ${itemReduced}m²`);
            } else {
                reductionDetails.push({
                    itemId: woItem.id,
                    itemName: itemJenis,
                    status: 'Failed - No stock available',
                    reduced: 0,
                    required: requiredArea,
                    remaining: requiredArea
                });
            }
        }
        
        // Save updated stock list
        localStorage.setItem('stockList', JSON.stringify(stockList));
        
        const result = {
            success: true,
            message: `Berhasil mengurangi stok untuk ${itemsProcessed} item`,
            totalReduced: totalReduced,
            itemsProcessed: itemsProcessed,
            details: reductionDetails
        };
        
        console.log('Stock reduction completed:', result);
        return result;
        
    } catch (error) {
        console.error('Error reducing stock for WO:', error);
        return {
            success: false,
            message: 'Error saat mengurangi stok: ' + error.message,
            totalReduced: 0,
            itemsProcessed: 0,
            details: []
        };
    }
}

// Function to validate stock availability for WO conversion with partial support
function validateStockForWO(so) {
    try {
        console.log('Validating stock for SO:', so);
        
        let stockList = JSON.parse(localStorage.getItem('stockList') || '[]');
        const warehouseId = so.asalGudang;
        
        console.log('Warehouse ID:', warehouseId);
        console.log('Current stock list:', stockList);
        
        // If no stock data exists, create sample data for testing
        if (stockList.length === 0) {
            console.log('No stock data found, creating sample data...');
            stockList = createSampleStockData();
            localStorage.setItem('stockList', JSON.stringify(stockList));
        }
        
        // Filter stock by warehouse
        const warehouseStock = stockList.filter(stock => stock.warehouseId == warehouseId);
        console.log('Warehouse stock:', warehouseStock);
        
        if (warehouseStock.length === 0) {
            return {
                isValid: false,
                message: `Tidak ada stok di gudang ${getWarehouseDisplay(warehouseId)}`,
                convertibleItems: [],
                nonConvertibleItems: []
            };
        }
        
        const convertibleItems = [];
        const nonConvertibleItems = [];
        let totalConvertibleValue = 0;
        let totalNonConvertibleValue = 0;
        
        // Check each item in SO
        for (const soItem of so.items) {
            console.log('Checking item:', soItem);
            
            const requiredArea = soItem.luas * soItem.qty; // Total area needed
            const itemJenis = soItem.jenisBarang || soItem.jenis || 'Unknown';
            const itemKetebalan = soItem.ketebalan || 2.0; // Default thickness
            
            console.log('Required area:', requiredArea, 'Item jenis:', itemJenis, 'Ketebalan:', itemKetebalan);
            
            // More flexible matching for stock items
            const availableStock = warehouseStock.filter(stock => {
                const stockMatches = stock.jenisPlat && stock.jenisPlat.includes(itemJenis.split(' ')[0]); // Match first word
                const thicknessMatches = Math.abs(stock.ketebalan - itemKetebalan) <= 0.5; // Allow 0.5mm tolerance
                return stockMatches && thicknessMatches;
            });
            
            console.log('Available stock for this item:', availableStock);
            
            if (availableStock.length === 0) {
                // No stock available for this item
                nonConvertibleItems.push({
                    ...soItem,
                    reason: `Tidak ada stok ${itemJenis} dengan ketebalan ${itemKetebalan}mm di gudang`,
                    availableStock: 0,
                    requiredStock: requiredArea
                });
                totalNonConvertibleValue += soItem.total || 0;
                continue;
            }
            
            const totalAvailableArea = availableStock.reduce((sum, stock) => sum + stock.luas, 0);
            console.log('Total available area:', totalAvailableArea, 'Required:', requiredArea);
            
            if (totalAvailableArea < requiredArea) {
                // Stock insufficient for this item
                nonConvertibleItems.push({
                    ...soItem,
                    reason: `Stok ${itemJenis} tidak mencukupi. Dibutuhkan: ${requiredArea.toFixed(2)}m², Tersedia: ${totalAvailableArea.toFixed(2)}m²`,
                    availableStock: totalAvailableArea,
                    requiredStock: requiredArea
                });
                totalNonConvertibleValue += soItem.total || 0;
            } else {
                // Stock sufficient for this item
                convertibleItems.push({
                    ...soItem,
                    availableStock: totalAvailableArea,
                    requiredStock: requiredArea
                });
                totalConvertibleValue += soItem.total || 0;
            }
        }
        
        console.log('Stock validation completed');
        console.log('Convertible items:', convertibleItems.length);
        console.log('Non-convertible items:', nonConvertibleItems.length);
        
        // Return detailed validation result
        return {
            isValid: convertibleItems.length > 0, // Valid if at least one item can be converted
            message: convertibleItems.length > 0 ? 
                `Dapat dikonversi ${convertibleItems.length} item dari ${so.items.length} item total` :
                'Tidak ada item yang dapat dikonversi',
            convertibleItems: convertibleItems,
            nonConvertibleItems: nonConvertibleItems,
            totalConvertibleValue: totalConvertibleValue,
            totalNonConvertibleValue: totalNonConvertibleValue,
            conversionRate: (convertibleItems.length / so.items.length * 100).toFixed(1)
        };
        
    } catch (error) {
        console.error('Error in validateStockForWO:', error);
        return {
            isValid: false,
            message: 'Error saat validasi stok: ' + error.message,
            convertibleItems: [],
            nonConvertibleItems: []
        };
    }
}

// Function to create sample warehouse data for testing
function createSampleWarehouseData() {
    const existingWarehouse = JSON.parse(localStorage.getItem('warehouseList') || '[]');
    if (existingWarehouse.length > 0) {
        console.log('Sample warehouse data already exists');
        return;
    }
    
    console.log('Creating sample warehouse data...');
    
    const sampleWarehouse = [
        {
            id: 1,
            nama: 'Gudang Utama',
            lokasi: 'Jakarta Pusat',
            alamat: 'Jl. Gudang Utama No. 1, Jakarta Pusat',
            kapasitas: 1000,
            satuan: 'm²',
            status: 'Active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 2,
            nama: 'Gudang Cabang 1',
            lokasi: 'Jakarta Selatan',
            alamat: 'Jl. Gudang Cabang No. 1, Jakarta Selatan',
            kapasitas: 500,
            satuan: 'm²',
            status: 'Active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('warehouseList', JSON.stringify(sampleWarehouse));
    console.log('Sample warehouse data created:', sampleWarehouse);
}

// Function to fill test data with random items
function fillTestData() {
    try {
        console.log('Filling test data with random items...');
        
        // Ensure master data exists first
        ensureMasterDataExists();
        
        // Clear existing items first
        const previousItemsCount = currentItems.length;
        console.log('Previous items count:', previousItemsCount);
        currentItems = [];
        
        // Add random seed based on current time to ensure different results each time
        const randomSeed = Date.now() + Math.random();
        const timestamp = new Date().toLocaleString('id-ID');
        console.log('=== FILL TEST DATA EXECUTED ===');
        console.log('Timestamp:', timestamp);
        console.log('Random seed:', randomSeed);
        console.log('===============================');
        
        // Generate random number of items (3-8 items)
        const numItems = Math.floor((randomSeed % 6) + 3);
        console.log(`Generating ${numItems} random items...`);
        
        // Get master data for variety
        const jenisBarangList = JSON.parse(localStorage.getItem('jenisBarang') || '[]');
        const bentukBarangList = JSON.parse(localStorage.getItem('bentukBarang') || '[]');
        const gradeBarangList = JSON.parse(localStorage.getItem('gradeBarang') || '[]');
        
        // Fallback options if master data is empty
        const jenisBarangOptions = jenisBarangList.length > 0 ? 
            jenisBarangList.map(item => item.nama) : 
            ['Aluminium 1100', 'Aluminium 6061', 'Aluminium 7075', 
             'Stainless Steel 304', 'Stainless Steel 316', 'Stainless Steel 430',
             'Galvanized Steel', 'Mild Steel', 'Copper', 'Brass'];
        
        const bentukBarangOptions = bentukBarangList.length > 0 ? 
            bentukBarangList.map(item => item.nama) : 
            ['Plat', 'Pipa', 'Profil', 'Kawat', 'Lembaran', 'Kotak'];
        
        const gradeBarangOptions = gradeBarangList.length > 0 ? 
            gradeBarangList.map(item => item.nama) : 
            ['Grade A', 'Grade B', 'Grade C', 'Premium', 'Standard', 'Economy'];
        
        const unitsOptions = ['per_m2', 'per_lembar', 'per_kg'];
        
        // Generate random items with enhanced randomness
        for (let i = 0; i < numItems; i++) {
            // Enhanced random dimensions with more variation
            const randomFactor1 = (randomSeed * (i + 1)) % 1000 / 1000;
            const randomFactor2 = (randomSeed * (i + 2)) % 1000 / 1000;
            
            const panjang = parseFloat((randomFactor1 * 3.5 + 0.5).toFixed(2));
            const lebar = parseFloat((randomFactor2 * 3.5 + 0.5).toFixed(2));
            const qty = Math.floor((randomSeed * (i + 3)) % 10) + 1; // 1-10 pieces
            
            // Enhanced random selections with rotation
            const jenisBarang = jenisBarangOptions[Math.floor((randomSeed * (i + 4)) % jenisBarangOptions.length)];
            const bentukBarang = bentukBarangOptions[Math.floor((randomSeed * (i + 5)) % bentukBarangOptions.length)];
            const gradeBarang = gradeBarangOptions[Math.floor((randomSeed * (i + 6)) % gradeBarangOptions.length)];
            const units = unitsOptions[Math.floor((randomSeed * (i + 7)) % unitsOptions.length)];
            
            // Enhanced random price with more variation
            let basePrice = 100000; // Default price
            const priceRandom = (randomSeed * (i + 8)) % 1000 / 1000;
            
            if (jenisBarang.includes('Aluminium')) {
                basePrice = 150000 + (priceRandom * 100000); // 150k - 250k
            } else if (jenisBarang.includes('Stainless Steel')) {
                basePrice = 250000 + (priceRandom * 150000); // 250k - 400k
            } else if (jenisBarang.includes('Steel')) {
                basePrice = 80000 + (priceRandom * 70000); // 80k - 150k
            } else if (jenisBarang.includes('Copper')) {
                basePrice = 300000 + (priceRandom * 200000); // 300k - 500k
            } else if (jenisBarang.includes('Brass')) {
                basePrice = 200000 + (priceRandom * 100000); // 200k - 300k
            }
            
            // Enhanced random discount (0-30%)
            const discount = parseFloat(((randomSeed * (i + 9)) % 300 / 10).toFixed(1));
            
            // Enhanced random notes with rotation
            const notesOptions = [
                'Urgent delivery', 'High quality required', 'Standard specification',
                'Custom finish', 'Export quality', 'Local market', 'Sample order',
                'Bulk order', 'Special requirement', 'Regular stock', 'Premium grade',
                'Industrial use', 'Construction material', 'Automotive parts',
                'Electronics components', 'Medical equipment', 'Aerospace grade'
            ];
            const notes = notesOptions[Math.floor((randomSeed * (i + 10)) % notesOptions.length)];
            
            // Calculate values
            const luas = panjang * lebar;
            let harga = basePrice;
            
            // Adjust price based on units
            if (units === 'per_lembar') {
                harga = basePrice * luas;
            } else if (units === 'per_kg') {
                // Estimate weight using density
                const density = jenisBarang.includes('Aluminium') ? 2700 : 
                              jenisBarang.includes('Stainless') ? 8000 : 
                              jenisBarang.includes('Steel') ? 7850 : 8500;
                const ketebalan = 2; // mm
                const volume = luas * (ketebalan / 1000);
                const weight = volume * density;
                harga = basePrice * weight;
            }
            
            const discountAmount = (harga * luas * qty * discount) / 100;
            const total = (harga * luas * qty) - discountAmount;
            
            // Create item object with enhanced random ID
            const item = {
                id: Date.now() + i + Math.floor(randomSeed % 1000),
                jenisBarang: jenisBarang,
                bentukBarang: bentukBarang,
                gradeBarang: gradeBarang,
                panjang: panjang,
                lebar: lebar,
                qty: qty,
                luas: luas,
                ketebalan: 2.0,
                harga: Math.round(harga),
                units: units,
                discount: discount,
                discountAmount: Math.round(discountAmount),
                total: Math.round(total),
                notes: notes
            };
            
            currentItems.push(item);
            console.log(`Generated item ${i + 1}:`, item);
        }
        
        // Update tables and summary
        renderItemTable();
        updateSOSummary();
        
        // Fill customer and warehouse data randomly
        fillRandomCustomerData();
        fillRandomWarehouseData();
        
        // Show success message with random seed info
        showSuccessModal(`Berhasil mengisi ${numItems} item test data dengan variasi random!\n\nRandom Seed: ${randomSeed}\n\nItem termasuk berbagai jenis material, dimensi, dan spesifikasi yang berbeda.\n\nData customer dan gudang juga telah diisi secara random.`);
        
        console.log('Test data filled successfully with random seed:', randomSeed);
        console.log('Generated items:', currentItems);
        console.log('=== SUMMARY ===');
        console.log('Previous items:', previousItemsCount);
        console.log('New items:', currentItems.length);
        console.log('Total change:', currentItems.length - previousItemsCount);
        console.log('===============');
        
    } catch (error) {
        console.error('Error filling test data:', error);
        showErrorModal('Terjadi kesalahan saat mengisi test data: ' + error.message);
    }
}

// Function to ensure master data exists for test data generation
function ensureMasterDataExists() {
    try {
        // Check and create jenis barang if empty
        let jenisBarang = JSON.parse(localStorage.getItem('jenisBarang') || '[]');
        if (jenisBarang.length === 0) {
            jenisBarang = [
                { id: 1, nama: 'Aluminium 1100', deskripsi: 'Aluminium alloy 1100' },
                { id: 2, nama: 'Aluminium 6061', deskripsi: 'Aluminium alloy 6061' },
                { id: 3, nama: 'Stainless Steel 304', deskripsi: 'Stainless steel 304' },
                { id: 4, nama: 'Stainless Steel 316', deskripsi: 'Stainless steel 316' },
                { id: 5, nama: 'Galvanized Steel', deskripsi: 'Galvanized steel sheet' },
                { id: 6, nama: 'Mild Steel', deskripsi: 'Mild steel plate' },
                { id: 7, nama: 'Copper', deskripsi: 'Copper sheet' },
                { id: 8, nama: 'Brass', deskripsi: 'Brass sheet' }
            ];
            localStorage.setItem('jenisBarang', JSON.stringify(jenisBarang));
            console.log('Created sample jenis barang data');
        }
        
        // Check and create bentuk barang if empty
        let bentukBarang = JSON.parse(localStorage.getItem('bentukBarang') || '[]');
        if (bentukBarang.length === 0) {
            bentukBarang = [
                { id: 1, nama: 'Plat', deskripsi: 'Flat plate' },
                { id: 2, nama: 'Pipa', deskripsi: 'Pipe/tube' },
                { id: 3, nama: 'Profil', deskripsi: 'Profile section' },
                { id: 4, nama: 'Kawat', deskripsi: 'Wire' },
                { id: 5, nama: 'Lembaran', deskripsi: 'Sheet' },
                { id: 6, nama: 'Kotak', deskripsi: 'Box section' }
            ];
            localStorage.setItem('bentukBarang', JSON.stringify(bentukBarang));
            console.log('Created sample bentuk barang data');
        }
        
        // Check and create grade barang if empty
        let gradeBarang = JSON.parse(localStorage.getItem('gradeBarang') || '[]');
        if (gradeBarang.length === 0) {
            gradeBarang = [
                { id: 1, nama: 'Grade A', deskripsi: 'Premium grade' },
                { id: 2, nama: 'Grade B', deskripsi: 'Standard grade' },
                { id: 3, nama: 'Grade C', deskripsi: 'Economy grade' },
                { id: 4, nama: 'Premium', deskripsi: 'High quality' },
                { id: 5, nama: 'Standard', deskripsi: 'Normal quality' },
                { id: 6, nama: 'Economy', deskripsi: 'Basic quality' }
            ];
            localStorage.setItem('gradeBarang', JSON.stringify(gradeBarang));
            console.log('Created sample grade barang data');
        }
        
        console.log('Master data ensured for test data generation');
        
    } catch (error) {
        console.error('Error ensuring master data exists:', error);
    }
}

// Function to fill random customer data
function fillRandomCustomerData() {
    try {
        // Use current timestamp for enhanced randomness
        const randomSeed = Date.now() + Math.random();
        
        const customerNames = [
            'PT Maju Bersama', 'CV Sukses Mandiri', 'UD Jaya Abadi',
            'PT Global Teknik', 'CV Mitra Sejati', 'UD Berkah Makmur',
            'PT Prima Steel', 'CV Mitra Utama', 'UD Jaya Makmur',
            'PT Teknik Sukses', 'CV Maju Jaya', 'UD Berkah Jaya',
            'PT Metal Works', 'CV Steel Solutions', 'UD Aluminium Pro',
            'PT Industrial Supply', 'CV Construction Co', 'UD Manufacturing Plus'
        ];
        
        const customerPhones = [
            '021-1234567', '021-2345678', '021-3456789',
            '021-4567890', '021-5678901', '021-6789012',
            '021-7890123', '021-8901234', '021-9012345',
            '021-1122334', '021-2233445', '021-3344556',
            '021-4455667', '021-5566778', '021-6677889'
        ];
        
        const customerEmails = [
            'info@majubersama.com', 'contact@sukesmandiri.com', 'sales@jayabadi.com',
            'info@globalteknik.com', 'contact@mitrasejati.com', 'sales@berkahmakmur.com',
            'info@primasteel.com', 'contact@mitrautama.com', 'sales@jayamakmur.com',
            'sales@metalworks.com', 'info@steelsolutions.com', 'contact@aluminiumpro.com',
            'info@industrialsupply.com', 'sales@constructionco.com', 'contact@manufacturingplus.com'
        ];
        
        const customerAddresses = [
            'Jl. Sudirman No. 123, Jakarta Pusat', 'Jl. Thamrin No. 45, Jakarta Pusat',
            'Jl. Gatot Subroto No. 67, Jakarta Selatan', 'Jl. Rasuna Said No. 89, Jakarta Selatan',
            'Jl. Jendral Ahmad Yani No. 12, Jakarta Timur', 'Jl. Jendral Sudirman No. 34, Jakarta Barat',
            'Jl. Raya Bekasi No. 56, Bekasi', 'Jl. Raya Tangerang No. 78, Tangerang',
            'Jl. Raya Bogor No. 90, Bogor', 'Jl. Raya Depok No. 11, Depok',
            'Jl. Industri No. 15, Karawang', 'Jl. Pelabuhan No. 22, Cilegon',
            'Jl. Pabrik No. 33, Serang', 'Jl. Kawasan Industri No. 44, Bekasi',
            'Jl. Sentra Industri No. 55, Tangerang', 'Jl. Zona Industri No. 66, Bogor'
        ];
        
        // Enhanced random selections using seed
        const randomName = customerNames[Math.floor((randomSeed * 1) % customerNames.length)];
        const randomPhone = customerPhones[Math.floor((randomSeed * 2) % customerPhones.length)];
        const randomEmail = customerEmails[Math.floor((randomSeed * 3) % customerEmails.length)];
        const randomAddress = customerAddresses[Math.floor((randomSeed * 4) % customerAddresses.length)];
        
        // Fill form fields
        const customerNameField = document.getElementById('customerName');
        const customerPhoneField = document.getElementById('customerPhone');
        const customerEmailField = document.getElementById('customerEmail');
        const customerAddressField = document.getElementById('customerAddress');
        
        if (customerNameField) customerNameField.value = randomName;
        if (customerPhoneField) customerPhoneField.value = randomPhone;
        if (customerEmailField) customerEmailField.value = randomEmail;
        if (customerAddressField) customerAddressField.value = randomAddress;
        
        console.log('Random customer data filled:', { randomName, randomPhone, randomEmail, randomAddress });
        
    } catch (error) {
        console.error('Error filling random customer data:', error);
    }
}

// Function to fill random warehouse data
function fillRandomWarehouseData() {
    try {
        // Use current timestamp for enhanced randomness
        const randomSeed = Date.now() + Math.random();
        
        const warehouseOptions = document.getElementById('asalGudang');
        if (warehouseOptions && warehouseOptions.options.length > 1) {
            // Select random warehouse (skip first option which is "Pilih Gudang")
            const randomIndex = Math.floor((randomSeed * 1) % (warehouseOptions.options.length - 1)) + 1;
            warehouseOptions.selectedIndex = randomIndex;
            console.log('Random warehouse selected:', warehouseOptions.options[randomIndex].text);
        }
        
        // Fill random delivery date (within next 30 days)
        const deliveryDateField = document.getElementById('deliveryDate');
        if (deliveryDateField) {
            const today = new Date();
            const randomDays = Math.floor((randomSeed * 2) % 30) + 7; // 7-37 days from now
            const deliveryDate = new Date(today.getTime() + (randomDays * 24 * 60 * 60 * 1000));
            deliveryDateField.value = deliveryDate.toISOString().split('T')[0];
            console.log('Random delivery date set:', deliveryDateField.value);
        }
        
        // Fill random SO number
        const soNumberField = document.getElementById('soNumber');
        if (soNumberField) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const randomSequence = Math.floor((randomSeed * 3) % 999) + 1;
            const soNumber = `SO-${year}${month}${day}-${String(randomSequence).padStart(3, '0')}`;
            soNumberField.value = soNumber;
            console.log('Random SO number generated:', soNumber);
        }
        
        // Fill random SO date (within last 7 days)
        const soDateField = document.getElementById('soDate');
        if (soDateField) {
            const today = new Date();
            const randomDaysAgo = Math.floor((randomSeed * 4) % 7); // 0-6 days ago
            const soDate = new Date(today.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
            soDateField.value = soDate.toISOString().split('T')[0];
            console.log('Random SO date set:', soDateField.value);
        }
        
        // Fill random payment terms
        const paymentTermsField = document.getElementById('paymentTerms');
        if (paymentTermsField) {
            const paymentTermsOptions = ['net30', 'net60', 'net90', 'advance', 'cod'];
            const randomPaymentTerms = paymentTermsOptions[Math.floor((randomSeed * 5) % paymentTermsOptions.length)];
            paymentTermsField.value = randomPaymentTerms;
            console.log('Random payment terms set:', randomPaymentTerms);
        }
        
    } catch (error) {
        console.error('Error filling random warehouse data:', error);
    }
}

// Function to create sample SO data for testing
function createSampleSOData() {
    const existingSO = JSON.parse(localStorage.getItem('soList') || '[]');
    if (existingSO.length > 0) {
        console.log('Sample SO data already exists');
        return;
    }
    
    console.log('Creating sample SO data...');
    
    const sampleSO = [
        {
            id: Date.now(),
            soNumber: 'SO-20250812-001',
            customerName: 'PT Test Customer',
            customerPhone: '021-1234567',
            customerEmail: 'test@customer.com',
            customerAddress: 'Jl. Test No. 123, Jakarta',
            tanggalSO: new Date().toISOString(),
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            asalGudang: 1, // Gudang Utama
            items: [
                {
                    id: 1,
                    jenisBarang: 'Aluminium 1100',
                    bentukBarang: 'Plat',
                    gradeBarang: 'Grade A',
                    panjang: 2.0,
                    lebar: 1.0,
                    qty: 2,
                    luas: 2.0,
                    ketebalan: 1.0,
                    harga: 150000,
                    units: 'per_m2',
                    discount: 0,
                    total: 600000,
                    notes: 'Sample item 1'
                },
                {
                    id: 2,
                    jenisBarang: 'Aluminium 6061',
                    bentukBarang: 'Plat',
                    gradeBarang: 'Grade B',
                    panjang: 1.5,
                    lebar: 1.0,
                    qty: 1,
                    luas: 1.5,
                    ketebalan: 1.5,
                    harga: 200000,
                    units: 'per_m2',
                    discount: 5,
                    total: 285000,
                    notes: 'Sample item 2'
                }
            ],
            total: 885000,
            status: 'Draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('soList', JSON.stringify(sampleSO));
    console.log('Sample SO data created:', sampleSO);
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
function createWorkOrderFromSO(so, itemsToConvert = null) {
    const woNumber = generateWONumber();
    const currentDate = new Date();
    
    // Use provided items or all SO items
    const itemsForWO = itemsToConvert || so.items;
    
    // Calculate totals for WO
    const totalItems = itemsForWO.length;
    const totalQty = itemsForWO.reduce((sum, item) => sum + (item.qty || 0), 0);
    const totalValue = itemsForWO.reduce((sum, item) => sum + (item.total || 0), 0);
    
    // Reduce stock quantities for items being converted to WO
    const stockReductionResult = reduceStockForWO(itemsForWO, so.asalGudang);
    console.log('Stock reduction result:', stockReductionResult);
    
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
        items: itemsForWO.map(item => ({
            ...item,
            status: 'Pending',
            progress: 0,
            notes: ''
        })),
        // WO summary
        totalItems: totalItems,
        totalQty: totalQty,
        totalValue: totalValue,
        // Conversion info
        isPartialConversion: itemsToConvert !== null && itemsToConvert.length < so.items.length,
        originalSOItemsCount: so.items.length,
        convertedItemsCount: totalItems,
        conversionRate: itemsToConvert ? (totalItems / so.items.length * 100).toFixed(1) : '100',
        // Stock reduction info
        stockReduction: stockReductionResult,
        // WO properties
        status: 'Pending',
        priority: 'Normal',
        assignedTo: '',
        estimatedDuration: '',
        actualStartDate: '',
        actualEndDate: '',
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString()
    };
    
    console.log('Work Order created:', {
        woNumber: wo.woNumber,
        itemsCount: wo.totalItems,
        totalValue: wo.totalValue,
        isPartial: wo.isPartialConversion,
        conversionRate: wo.conversionRate,
        stockReduced: stockReductionResult.totalReduced
    });
    
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

// Function to fill test data for testing purposes - REMOVED DUPLICATE

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