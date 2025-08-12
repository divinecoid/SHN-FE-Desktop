// Work Order (WO) Logic
let woList = JSON.parse(localStorage.getItem('woList') || '[]');
let filteredWOList = [...woList];
let selectedSO = null;
let selectedItems = [];
let currentWOItems = [];

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
    
    // Show WO details in a modal or new view
    alert(`Work Order: ${wo.woNumber}\nStatus: ${wo.status}\nItem: ${wo.items.length} item`);
}

function editWO(id) {
    const wo = woList.find(w => w.id === id);
    if (!wo) return;
    
    // Implement edit functionality
    alert(`Edit Work Order: ${wo.woNumber}`);
}

function deleteWO(id) {
    if (confirm('Yakin ingin menghapus Work Order ini?')) {
        woList = woList.filter(w => w.id !== id);
        localStorage.setItem('woList', JSON.stringify(woList));
        loadWOList();
        alert('Work Order berhasil dihapus!');
    }
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
    // Implement export functionality
    alert('Fitur export akan diimplementasikan');
}

function printWO() {
    // Implement print functionality
    alert('Fitur print akan diimplementasikan');
}
