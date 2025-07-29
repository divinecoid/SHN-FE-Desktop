document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    saveBtn.addEventListener('click', function() {
        const supplierData = {
            kode: document.getElementById('kode').value,
            nama: document.getElementById('nama').value,
            kota: document.getElementById('kota').value,
            telepon: document.getElementById('telepon').value,
            contact: document.getElementById('contact').value
        };
        
        // TODO: Implement save functionality
        console.log('Supplier data to save:', supplierData);
        alert('Data supplier berhasil disimpan!');
    });
    
    resetBtn.addEventListener('click', function() {
        document.getElementById('kode').value = '';
        document.getElementById('nama').value = '';
        document.getElementById('kota').value = '';
        document.getElementById('telepon').value = '';
        document.getElementById('contact').value = '';
    });
});