// Work Order (WO) Logic
let woList = JSON.parse(localStorage.getItem('woList') || '[]');
let filteredWOList = [...woList];
let selectedSO = null;
let selectedItems = [];
let currentWOItems = [];

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

// Helper function to show detailed modals
function showDetailModal(title, content) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 0;
            border-radius: 12px;
            max-width: 90vw;
            max-height: 90vh;
            width: 900px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            overflow: hidden;
        ">
            <div style="
                background: #2c3e50;
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <h2 style="margin: 0; font-size: 1.5em;">${title}</h2>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
            </div>
            <div style="padding: 20px; max-height: calc(90vh - 100px); overflow-y: auto;">
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

// Helper functions for formatting
function getPriorityDisplay(priority) {
    const priorityMap = {
        'Low': '🟢 Rendah',
        'Medium': '🟡 Sedang',
        'High': '🟠 Tinggi',
        'Urgent': '🔴 Urgent'
    };
    return priorityMap[priority] || priority;
}

function getStatusDisplay(status) {
    const statusMap = {
        'Draft': '📝 Draft',
        'In Progress': '🔄 Sedang Berjalan',
        'Completed': '✅ Selesai',
        'Cancelled': '❌ Dibatalkan'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadWOList();
    loadSOList();
    setupEventListeners();
    updateSummaryInfo();
    generateWONumber();
});

function setupEventListeners() {
    // View toggle listeners
    document.getElementById('tambahWOBtn').addEventListener('click', function() {
        document.getElementById('listView').style.display = 'none';
        document.getElementById('inputView').style.display = 'block';
        resetForm();
    });
    
    document.getElementById('kembaliKeListBtn').addEventListener('click', function() {
        document.getElementById('listView').style.display = 'block';
        document.getElementById('inputView').style.display = 'none';
        resetForm();
    });
    
    // SO selection listener
    document.getElementById('soSelection').addEventListener('change', onSOSelectionChange);
    
    // Button listeners
    document.getElementById('buatWOBtn').addEventListener('click', showWODetails);
    document.getElementById('simpanWOBtn').addEventListener('click', simpanWO);
    document.getElementById('printWOBtn').addEventListener('click', printWO);
    
    // Search and filter listeners
    document.getElementById('searchWO').addEventListener('input', filterWOList);
    document.getElementById('filterStatus').addEventListener('change', filterWOList);
    document.getElementById('filterDate').addEventListener('change', filterWOList);
    document.getElementById('clearFilterBtn').addEventListener('click', clearFilters);
    document.getElementById('exportWOBtn').addEventListener('click', exportWOList);
    
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
    
    // Close modal with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('customModal').style.display === 'flex') {
            hideModal();
        }
    });
}

function loadWOList() {
    filteredWOList = [...woList];
    renderFilteredWOList();
    updateSummaryInfo();
}

function loadSOList() {
    const soSelection = document.getElementById('soSelection');
    const soList = JSON.parse(localStorage.getItem('soList') || '[]');
    
    // Clear existing options
    soSelection.innerHTML = '<option value="">Pilih Sales Order</option>';
    
    // Add options from SO list
    soList.forEach(so => {
        const option = document.createElement('option');
        option.value = so.id;
        option.textContent = `${so.soNumber} - ${so.customerName}`;
        option.dataset.so = JSON.stringify(so);
        soSelection.appendChild(option);
    });
}

function onSOSelectionChange() {
    const soSelection = document.getElementById('soSelection');
    const selectedValue = soSelection.value;
    
    if (!selectedValue) {
        document.getElementById('soItemsSection').style.display = 'none';
        selectedSO = null;
        return;
    }
    
    // Get selected SO data
    const selectedOption = soSelection.selectedOptions[0];
    selectedSO = JSON.parse(selectedOption.dataset.so);
    
    // Display SO items
    displaySOItems();
    document.getElementById('soItemsSection').style.display = 'block';
}

function displaySOItems() {
    if (!selectedSO) return;
    
    // Update SO info
    document.getElementById('selectedCustomer').textContent = selectedSO.customerName;
    document.getElementById('selectedSODate').textContent = selectedSO.tanggalSO;
    document.getElementById('selectedGudang').textContent = selectedSO.asalGudang;
    document.getElementById('selectedTotalItems').textContent = selectedSO.items.length;
    
    // Render SO items table
    const tbody = document.getElementById('soItemsTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    
    selectedSO.items.forEach((item, index) => {
        const row = tbody.insertRow();
        
        // Checkbox for selection
        const checkboxCell = row.insertCell(0);
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = index;
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                selectedItems.push({...item, originalIndex: index});
            } else {
                selectedItems = selectedItems.filter(selected => selected.originalIndex !== index);
            }
        });
        checkboxCell.appendChild(checkbox);
        checkboxCell.style.textAlign = 'center';
        
        // Item details
        row.insertCell(1).textContent = item.jenisBarang;
        row.insertCell(2).textContent = item.bentukBarang;
        row.insertCell(3).textContent = item.gradeBarang;
        row.insertCell(4).textContent = `${item.panjang} × ${item.lebar}`;
        row.insertCell(5).textContent = item.qty;
        row.insertCell(6).textContent = item.luas.toFixed(2);
        row.insertCell(7).textContent = getUnitDisplay(item.units);
        
        // Center align numeric columns
        for (let i = 4; i <= 7; i++) {
            row.cells[i].style.textAlign = 'center';
        }
    });
}

function getUnitDisplay(units) {
    switch(units) {
        case 'per_m2': return 'per m²';
        case 'per_lembar': return 'per lembar';
        case 'per_kg': return 'per kg';
        default: return units;
    }
}

function showWODetails() {
    if (selectedItems.length === 0) {
        alert('Pilih minimal satu item untuk Work Order');
        return;
    }
    
    // Set default values
    const today = new Date();
    document.getElementById('woDate').valueAsDate = today;
    
    // Set deadline to 7 days from today
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    document.getElementById('deadline').valueAsDate = deadline;
    
    // Display selected items
    displaySelectedItems();
    
    // Show WO details section
    document.getElementById('woDetailsSection').style.display = 'block';
}

function displaySelectedItems() {
    const tbody = document.getElementById('selectedItemsTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    
    selectedItems.forEach((item, index) => {
        const row = tbody.insertRow();
        
        row.insertCell(0).textContent = item.jenisBarang;
        row.insertCell(1).textContent = item.bentukBarang;
        row.insertCell(2).textContent = item.gradeBarang;
        row.insertCell(3).textContent = `${item.panjang} × ${item.lebar}`;
        row.insertCell(4).textContent = item.qty;
        row.insertCell(5).textContent = item.luas.toFixed(2);
        row.insertCell(6).textContent = getUnitDisplay(item.units);
        
        // Action buttons
        const actionCell = row.insertCell(7);
        const splitBtn = document.createElement('button');
        splitBtn.textContent = 'Pisahkan';
        splitBtn.style.background = '#e74c3c';
        splitBtn.style.color = 'white';
        splitBtn.style.border = 'none';
        splitBtn.style.borderRadius = '4px';
        splitBtn.style.padding = '4px 8px';
        splitBtn.style.fontSize = '12px';
        splitBtn.style.cursor = 'pointer';
        splitBtn.addEventListener('click', function() {
            splitItemToNewWO(item, index);
        });
        actionCell.appendChild(splitBtn);
        actionCell.style.textAlign = 'center';
        
        // Center align numeric columns
        for (let i = 3; i <= 6; i++) {
            row.cells[i].style.textAlign = 'center';
        }
    });
}

function splitItemToNewWO(item, index) {
    // Create new WO for this item
    const newWONumber = generateWONumberString();
    const newWO = {
        id: Date.now() + Math.random(),
        woNumber: newWONumber,
        soNumber: selectedSO.soNumber,
        customerName: selectedSO.customerName,
        customerPhone: selectedSO.customerPhone,
        customerEmail: selectedSO.customerEmail,
        customerAddress: selectedSO.customerAddress,
        tanggalSO: selectedSO.tanggalSO,
        asalGudang: selectedSO.asalGudang,
        woDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        description: `Work Order terpisah untuk item ${item.jenisBarang}`,
        estimatedHours: 2,
        assignedTo: '',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [item],
        status: 'Draft',
        createdAt: new Date().toISOString(),
        isSplit: true,
        parentWO: null
    };
    
    // Add to WO list
    woList.push(newWO);
    localStorage.setItem('woList', JSON.stringify(woList));
    
    // Remove from current selection
    selectedItems.splice(index, 1);
    displaySelectedItems();
    
    // Update WO list
    loadWOList();
    
    alert(`Item berhasil dipisahkan menjadi Work Order baru: ${newWO.woNumber}`);
}

function simpanWO() {
    if (selectedItems.length === 0) {
        alert('Pilih minimal satu item untuk Work Order');
        return;
    }
    
    const woNumber = document.getElementById('woNumber').value;
    const woDate = document.getElementById('woDate').value;
    const priority = document.getElementById('priority').value;
    const description = document.getElementById('woDescription').value;
    const estimatedHours = parseFloat(document.getElementById('estimatedHours').value) || 0;
    const assignedTo = document.getElementById('assignedTo').value;
    const deadline = document.getElementById('deadline').value;
    
    if (!woDate) {
        alert('Mohon lengkapi tanggal Work Order');
        return;
    }
    
    // Create WO object
    const wo = {
        id: Date.now(),
        woNumber: woNumber,
        soNumber: selectedSO.soNumber,
        customerName: selectedSO.customerName,
        customerPhone: selectedSO.customerPhone,
        customerEmail: selectedSO.customerEmail,
        customerAddress: selectedSO.customerAddress,
        tanggalSO: selectedSO.tanggalSO,
        asalGudang: selectedSO.asalGudang,
        woDate: woDate,
        priority: priority,
        description: description,
        estimatedHours: estimatedHours,
        assignedTo: assignedTo,
        deadline: deadline,
        items: [...selectedItems],
        status: 'Draft',
        createdAt: new Date().toISOString(),
        isSplit: false,
        parentWO: null
    };
    
    // Add to WO list
    woList.push(wo);
    localStorage.setItem('woList', JSON.stringify(woList));
    
    // Clear form and reset
    resetForm();
    
    // Update WO list
    loadWOList();
    
    // Switch back to list view
    document.getElementById('listView').style.display = 'block';
    document.getElementById('inputView').style.display = 'none';
    
    alert(`Work Order ${woNumber} berhasil disimpan!`);
}

function resetForm() {
    selectedSO = null;
    selectedItems = [];
    currentWOItems = [];
    
    // Reset form fields
    document.getElementById('soSelection').value = '';
    document.getElementById('woDate').value = '';
    document.getElementById('priority').value = 'Medium';
    document.getElementById('woDescription').value = '';
    document.getElementById('estimatedHours').value = '';
    document.getElementById('assignedTo').value = '';
    document.getElementById('deadline').value = '';
    
    // Hide sections
    document.getElementById('soItemsSection').style.display = 'none';
    document.getElementById('woDetailsSection').style.display = 'none';
    
    // Clear tables
    document.getElementById('soItemsTable').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('selectedItemsTable').getElementsByTagName('tbody')[0].innerHTML = '';
    
    // Generate new WO number
    generateWONumber();
}

function generateWONumber() {
    const woNumber = document.getElementById('woNumber');
    woNumber.value = generateWONumberString();
}

function generateWONumberString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Count existing WO for today
    const todayWOs = woList.filter(wo => {
        const woDate = new Date(wo.woDate);
        return woDate.getFullYear() === year && 
               woDate.getMonth() === today.getMonth() && 
               woDate.getDate() === today.getDate();
    });
    
    const sequence = todayWOs.length + 1;
    return `WO-${year}${month}${day}-${String(sequence).padStart(3, '0')}`;
}

function renderFilteredWOList() {
    const tbody = document.getElementById('woTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    
    filteredWOList.forEach(wo => {
        const row = tbody.insertRow();
        
        row.insertCell(0).textContent = wo.woNumber;
        row.insertCell(1).textContent = wo.soNumber;
        row.insertCell(2).textContent = wo.customerName;
        
        // Get first item info
        const firstItem = wo.items[0];
        row.insertCell(3).textContent = firstItem ? firstItem.jenisBarang : '-';
        row.insertCell(4).textContent = firstItem ? `${firstItem.panjang}×${firstItem.lebar}` : '-';
        row.insertCell(5).textContent = firstItem ? getUnitDisplay(firstItem.units) : '-';
        row.insertCell(6).textContent = firstItem ? firstItem.qty : '-';
        
        // Status with color
        const statusCell = row.insertCell(7);
        const statusSpan = document.createElement('span');
        statusSpan.textContent = wo.status;
        statusSpan.style.padding = '4px 8px';
        statusSpan.style.borderRadius = '12px';
        statusSpan.style.fontSize = '12px';
        statusSpan.style.fontWeight = '600';
        
        switch(wo.status) {
            case 'Draft':
                statusSpan.style.background = '#f39c12';
                statusSpan.style.color = 'white';
                break;
            case 'In Progress':
                statusSpan.style.background = '#3498db';
                statusSpan.style.color = 'white';
                break;
            case 'Completed':
                statusSpan.style.background = '#27ae60';
                statusSpan.style.color = 'white';
                break;
            case 'Cancelled':
                statusSpan.style.background = '#e74c3c';
                statusSpan.style.color = 'white';
                break;
        }
        
        statusCell.appendChild(statusSpan);
        
        // Action buttons
        const actionCell = row.insertCell(8);
        actionCell.style.textAlign = 'center';
        
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'Lihat';
        viewBtn.style.background = '#3498db';
        viewBtn.style.color = 'white';
        viewBtn.style.border = 'none';
        viewBtn.style.borderRadius = '4px';
        viewBtn.style.padding = '4px 8px';
        viewBtn.style.fontSize = '12px';
        viewBtn.style.cursor = 'pointer';
        viewBtn.style.marginRight = '5px';
        viewBtn.addEventListener('click', function() {
            viewWO(wo.id);
        });
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.style.background = '#f39c12';
        editBtn.style.color = 'white';
        editBtn.style.border = 'none';
        editBtn.style.borderRadius = '4px';
        editBtn.style.padding = '4px 8px';
        editBtn.style.fontSize = '12px';
        editBtn.style.cursor = 'pointer';
        editBtn.style.marginRight = '5px';
        editBtn.addEventListener('click', function() {
            editWO(wo.id);
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Hapus';
        deleteBtn.style.background = '#e74c3c';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.style.padding = '4px 8px';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.addEventListener('click', function() {
            deleteWO(wo.id);
        });
        
        actionCell.appendChild(viewBtn);
        actionCell.appendChild(editBtn);
        actionCell.appendChild(deleteBtn);
    });
}

function viewWO(id) {
    const wo = woList.find(w => w.id === id);
    if (!wo) return;
    
    // Create modal content
    let modalContent = `
        <div style="max-width: 900px; max-height: 70vh; overflow-y: auto;">
            <h2 style="text-align: center; color: #2c3e50; margin-bottom: 20px;">Work Order: ${wo.woNumber}</h2>
            
            <!-- WO Basic Information -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #2c3e50;">Informasi Work Order</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div><strong>Status:</strong> ${getStatusDisplay(wo.status)}</div>
                    <div><strong>Prioritas:</strong> ${getPriorityDisplay(wo.priority)}</div>
                    <div><strong>Tanggal WO:</strong> ${formatDate(wo.woDate)}</div>
                    <div><strong>Deadline:</strong> ${wo.deadline ? formatDate(wo.deadline) : '-'}</div>
                    <div><strong>Estimasi Jam Kerja:</strong> ${wo.estimatedHours ? wo.estimatedHours + ' jam' : '-'}</div>
                    <div><strong>Ditetapkan Kepada:</strong> ${wo.assignedTo || '-'}</div>
                </div>
            </div>
            
            <!-- SO Information -->
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #2c3e50;">Informasi Sales Order</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div><strong>No SO:</strong> ${wo.soNumber}</div>
                    <div><strong>Pelanggan:</strong> ${wo.customerName}</div>
                    <div><strong>Asal Gudang:</strong> ${wo.asalGudang || '-'}</div>
                    <div><strong>Deskripsi Pekerjaan:</strong> ${wo.description || '-'}</div>
                </div>
            </div>
            
            <!-- WO Items -->
            <h3 style="color: #2c3e50;">Detail Item Work Order</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #ecf0f1;">
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Jenis Barang</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Bentuk</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: left;">Grade</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">Ukuran (m)</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">Qty</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">Luas (m²)</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">Satuan</th>
                        <th style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">Progress</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    wo.items.forEach(item => {
        let unitsDisplay = '';
        if (item.units === 'per_m2') unitsDisplay = 'per m²';
        else if (item.units === 'per_lembar') unitsDisplay = 'per lembar';
        else if (item.units === 'per_kg') unitsDisplay = 'per kg';
        else unitsDisplay = item.units || '-';
        
        // Calculate progress percentage
        const progress = item.progress || 0;
        const progressColor = progress >= 100 ? '#27ae60' : progress >= 50 ? '#f39c12' : '#e74c3c';
        
        modalContent += `
            <tr>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.jenisBarang || item.jenis || '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.bentukBarang || '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px;">${item.gradeBarang || '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">${item.panjang || '-'} × ${item.lebar || '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">${item.qty || 0}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">${item.luas ? item.luas.toFixed(2) + ' m²' : '-'}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">${unitsDisplay}</td>
                <td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="
                            width: 60px; 
                            height: 8px; 
                            background: #ecf0f1; 
                            border-radius: 4px; 
                            overflow: hidden;
                        ">
                            <div style="
                                width: ${progress}%; 
                                height: 100%; 
                                background: ${progressColor}; 
                                transition: width 0.3s ease;
                            "></div>
                        </div>
                        <span style="color: ${progressColor}; font-weight: bold; font-size: 12px;">${progress}%</span>
                    </div>
                </td>
            </tr>
        `;
    });
    
    modalContent += `
                </tbody>
            </table>
            
            <!-- Progress Summary -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #2c3e50;">Ringkasan Progress</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;">${wo.items.length}</div>
                        <div style="font-size: 14px; color: #7f8c8d;">Total Item</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #f39c12;">
                            ${wo.items.filter(item => (item.progress || 0) > 0 && (item.progress || 0) < 100).length}
                        </div>
                        <div style="font-size: 14px; color: #7f8c8d;">Sedang Dikerjakan</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #27ae60;">
                            ${wo.items.filter(item => (item.progress || 0) >= 100).length}
                        </div>
                        <div style="font-size: 14px; color: #7f8c8d;">Selesai</div>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="margin-top: 20px; text-align: center; display: flex; gap: 15px; justify-content: center;">
                ${wo.status !== 'Completed' && wo.status !== 'Cancelled' ? 
                    `<button onclick="editWO(${wo.id})" style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer;">✏️ Edit WO</button>` : 
                    '<span style="color: #95a5a6; font-style: italic;">WO ini tidak dapat diedit</span>'
                }
                <button onclick="printWO(${wo.id})" style="background: #e67e22; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer;">🖨️ Print WO</button>
            </div>
        </div>
    `;
    
    // Show modal
    showDetailModal('Detail Work Order', modalContent);
}

function editWO(id) {
    const wo = woList.find(w => w.id === id);
    if (!wo) return;
    
    // Show edit modal
    const modalContent = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">✏️</div>
            <h3 style="color: #3498db; margin-bottom: 16px;">Edit Work Order</h3>
            <p style="color: #555; margin-bottom: 24px; line-height: 1.5;">
                Fitur edit Work Order <strong>${wo.woNumber}</strong> akan segera tersedia.<br>
                Saat ini Anda dapat menghapus dan membuat ulang WO jika diperlukan.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="this.closest('.modal').remove()" style="
                    background: #95a5a6; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    cursor: pointer;
                ">Tutup</button>
                <button onclick="deleteWO(${wo.id})" style="
                    background: #e74c3c; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    cursor: pointer;
                ">Hapus & Buat Ulang</button>
            </div>
        </div>
    `;
    
    showDetailModal('Edit Work Order', modalContent);
}

function deleteWO(id) {
    const wo = woList.find(w => w.id === id);
    if (!wo) return;
    
    // Show confirmation modal
    const modalContent = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h3 style="color: #e74c3c; margin-bottom: 16px;">Konfirmasi Hapus</h3>
            <p style="color: #555; margin-bottom: 24px; line-height: 1.5;">
                Anda yakin ingin menghapus Work Order <strong>${wo.woNumber}</strong>?<br>
                Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="this.closest('.modal').remove()" style="
                    background: #95a5a6; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    cursor: pointer;
                ">Batal</button>
                <button onclick="confirmDeleteWO(${wo.id})" style="
                    background: #e74c3c; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    cursor: pointer;
                ">Hapus WO</button>
            </div>
        </div>
    `;
    
    showDetailModal('Konfirmasi Hapus Work Order', modalContent);
}

function confirmDeleteWO(id) {
    woList = woList.filter(w => w.id !== id);
    localStorage.setItem('woList', JSON.stringify(woList));
    loadWOList();
    
    // Close modal and show success message
    document.querySelector('.modal').remove();
    showSuccessModal('Work Order berhasil dihapus!');
}

function filterWOList() {
    const searchTerm = document.getElementById('searchWO').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const dateFilter = document.getElementById('filterDate').value;
    
    filteredWOList = woList.filter(wo => {
        // Search filter
        const matchesSearch = !searchTerm || 
            wo.woNumber.toLowerCase().includes(searchTerm) ||
            wo.soNumber.toLowerCase().includes(searchTerm) ||
            wo.customerName.toLowerCase().includes(searchTerm) ||
            wo.items.some(item => item.jenisBarang.toLowerCase().includes(searchTerm));
        
        // Status filter
        const matchesStatus = !statusFilter || wo.status === statusFilter;
        
        // Date filter
        let matchesDate = true;
        if (dateFilter) {
            const woDate = new Date(wo.woDate);
            const today = new Date();
            
            switch(dateFilter) {
                case 'today':
                    matchesDate = woDate.toDateString() === today.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDate = woDate >= weekAgo;
                    break;
                case 'month':
                    matchesDate = woDate.getMonth() === today.getMonth() && 
                                woDate.getFullYear() === today.getFullYear();
                    break;
                case 'quarter':
                    const quarter = Math.floor(today.getMonth() / 3);
                    const woQuarter = Math.floor(woDate.getMonth() / 3);
                    matchesDate = woQuarter === quarter && 
                                woDate.getFullYear() === today.getFullYear();
                    break;
                case 'year':
                    matchesDate = woDate.getFullYear() === today.getFullYear();
                    break;
            }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    renderFilteredWOList();
}

function clearFilters() {
    document.getElementById('searchWO').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDate').value = '';
    filterWOList();
}

function updateSummaryInfo() {
    const totalWO = woList.length;
    const totalItems = woList.reduce((sum, wo) => sum + wo.items.length, 0);
    const avgItems = totalWO > 0 ? (totalItems / totalWO).toFixed(1) : 0;
    
    const draftCount = woList.filter(wo => wo.status === 'Draft').length;
    const progressCount = woList.filter(wo => wo.status === 'In Progress').length;
    const completedCount = woList.filter(wo => wo.status === 'Completed').length;
    
    document.getElementById('totalWOCount').textContent = totalWO;
    document.getElementById('totalWOItems').textContent = totalItems;
    document.getElementById('avgWOItems').textContent = avgItems;
    document.getElementById('draftCount').textContent = draftCount;
    document.getElementById('progressCount').textContent = progressCount;
    document.getElementById('completedCount').textContent = completedCount;
}

function exportWOList() {
    if (woList.length === 0) {
        showWarningModal('Tidak ada data Work Order untuk di-export');
        return;
    }
    
    // Show export modal
    const modalContent = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
            <h3 style="color: #3498db; margin-bottom: 16px;">Export Work Order</h3>
            <p style="color: #555; margin-bottom: 24px; line-height: 1.5;">
                Export data Work Order ke format Excel/CSV<br>
                Total data: <strong>${woList.length}</strong> Work Order
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="this.closest('.modal').remove()" style="
                    background: #95a5a6; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    cursor: pointer;
                ">Batal</button>
                <button onclick="performExport()" style="
                    background: #3498db; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    cursor: pointer;
                ">Export Data</button>
            </div>
        </div>
    `;
    
    showDetailModal('Export Work Order', modalContent);
}

function performExport() {
    try {
        // Create CSV content
        let csvContent = 'No WO,No SO,Pelanggan,Status,Prioritas,Tanggal WO,Deadline,Estimasi Jam,Assigned To,Total Item\n';
        
        woList.forEach(wo => {
            const row = [
                wo.woNumber,
                wo.soNumber,
                wo.customerName,
                wo.status,
                wo.priority,
                formatDate(wo.woDate),
                wo.deadline ? formatDate(wo.deadline) : '-',
                wo.estimatedHours || '-',
                wo.assignedTo || '-',
                wo.items.length
            ].map(field => `"${field}"`).join(',');
            
            csvContent += row + '\n';
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `work_orders_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Close modal and show success message
        document.querySelector('.modal').remove();
        showSuccessModal('Data Work Order berhasil di-export!');
        
    } catch (error) {
        showErrorModal('Terjadi kesalahan saat export: ' + error.message);
    }
}

function printWO(id) {
    const wo = woList.find(w => w.id === id);
    if (!wo) return;
    
    // Show print modal
    const modalContent = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🖨️</div>
            <h3 style="color: #e67e22; margin-bottom: 16px;">Print Work Order</h3>
            <p style="color: #555; margin-bottom: 24px; line-height: 1.5;">
                Mencetak Work Order <strong>${wo.woNumber}</strong><br>
                Fitur print akan segera tersedia.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="this.closest('.modal').remove()" style="
                    background: #95a5a6; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    cursor: pointer;
                ">Tutup</button>
                <button onclick="window.print()" style="
                    background: #e67e22; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    cursor: pointer;
                ">Print Halaman</button>
            </div>
        </div>
    `;
    
    showDetailModal('Print Work Order', modalContent);
}
