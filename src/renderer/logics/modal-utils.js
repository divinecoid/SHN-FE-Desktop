// Modal Utilities - Reusable custom modal functions
// This file provides consistent modal experience across the application

// Custom Modal Functions
function showModal(type, title, message) {
    const modal = document.getElementById('customModal');
    if (!modal) {
        console.error('Custom modal element not found');
        return;
    }
    
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
    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) closeBtn.focus();
}

function hideModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
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

// Custom Confirm Modal Function
function showConfirmModal(title, message, onConfirm, onCancel) {
    // Create modal container
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
        z-index: 10001;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; max-width: 500px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
            <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h3 style="margin: 0; font-size: 1.2em;">${title}</h3>
            </div>
            <div style="padding: 25px; text-align: center;">
                <div style="font-size: 1.1em; color: #555; margin-bottom: 25px; line-height: 1.5;">${message}</div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="confirmYes" style="background: #e74c3c; color: white; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1em; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">Ya</button>
                    <button id="confirmNo" style="background: #95a5a6; color: white; border: none; border-radius: 8px; padding: 12px 24px; font-size: 1em; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">Tidak</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const yesBtn = modal.querySelector('#confirmYes');
    const noBtn = modal.querySelector('#confirmNo');
    
    yesBtn.addEventListener('click', () => {
        modal.remove();
        if (onConfirm) onConfirm();
    });
    
    noBtn.addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    });
    
    // Close modal with ESC key
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape') {
            modal.remove();
            if (onCancel) onCancel();
            document.removeEventListener('keydown', closeOnEsc);
        }
    });
    
    // Focus on Yes button
    yesBtn.focus();
}

// Setup modal event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
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
        } else if (e.key === 'Enter' && customModal && customModal.style.display === 'flex') {
            hideModal();
        }
    });
});

// Export functions to global scope for backward compatibility
window.showModal = showModal;
window.hideModal = hideModal;
window.showSuccessModal = showSuccessModal;
window.showErrorModal = showErrorModal;
window.showWarningModal = showWarningModal;
window.showInfoModal = showInfoModal;
window.showConfirmModal = showConfirmModal;
