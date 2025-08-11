// static/js/payment.js

document.addEventListener('DOMContentLoaded', function() {
    // Menemukan form checkout
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validasi form
            if (!validateCheckoutForm()) {
                return;
            }
            
            // Tampilkan loading state
            const paymentButton = document.getElementById('payment-button');
            paymentButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Memproses...';
            paymentButton.disabled = true;
            
            // Kumpulkan data form
            const formData = new FormData(checkoutForm);
            const orderData = {
                order_id: formData.get('order_id'),
                gross_amount: parseInt(formData.get('total_amount')),
                first_name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                shipping: {
                    address: formData.get('address'),
                    city: formData.get('city'),
                    state: formData.get('state'),
                    zipcode: formData.get('zipcode')
                }
            };
            
            // Kirim request untuk membuat transaksi
            fetch('/create-transaction/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(orderData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.redirect_url) {
                    // Redirect ke halaman pembayaran Midtrans
                    window.location.href = data.redirect_url;
                } else {
                    throw new Error('No redirect URL received');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Restore button state
                paymentButton.innerHTML = 'Bayar Sekarang';
                paymentButton.disabled = false;
                showErrorAlert('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi nanti.');
            });
        });
    }
});

// Fungsi validasi form checkout
function validateCheckoutForm() {
    let isValid = true;
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zipcode'];
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (input && (input.value === '' || input.value === null)) {
            isValid = false;
            input.classList.add('is-invalid');
            
            // Tambahkan pesan error jika belum ada
            let errorDiv = input.nextElementSibling;
            if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = 'Bidang ini harus diisi';
                input.parentNode.insertBefore(errorDiv, input.nextSibling);
            }
        } else if (input) {
            input.classList.remove('is-invalid');
            
            // Hapus pesan error jika ada
            let errorDiv = input.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
                errorDiv.remove();
            }
        }
    });
    
    // Validasi format email
    const emailInput = document.getElementById('email');
    if (emailInput && emailInput.value && !validateEmail(emailInput.value)) {
        isValid = false;
        emailInput.classList.add('is-invalid');
        
        // Tambahkan pesan error jika belum ada
        let errorDiv = emailInput.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = 'Format email tidak valid';
            emailInput.parentNode.insertBefore(errorDiv, emailInput.nextSibling);
        } else {
            errorDiv.textContent = 'Format email tidak valid';
        }
    }
    
    // Validasi format nomor telepon
    const phoneInput = document.getElementById('phone');
    if (phoneInput && phoneInput.value && !validatePhone(phoneInput.value)) {
        isValid = false;
        phoneInput.classList.add('is-invalid');
        
        // Tambahkan pesan error jika belum ada
        let errorDiv = phoneInput.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = 'Format nomor telepon tidak valid (awali dengan 0 atau +62)';
            phoneInput.parentNode.insertBefore(errorDiv, phoneInput.nextSibling);
        } else {
            errorDiv.textContent = 'Format nomor telepon tidak valid (awali dengan 0 atau +62)';
        }
    }
    
    if (!isValid) {
        showErrorAlert('Harap periksa dan lengkapi semua bidang yang diperlukan.');
    }
    
    return isValid;
}

// Validasi format email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Validasi format nomor telepon Indonesia
function validatePhone(phone) {
    // Menerima format: +62812345678, 62812345678, 0812345678
    const re = /^(\+62|62|0)[0-9]{9,12}$/;
    return re.test(String(phone).replace(/\s/g, ''));
}

// Helper untuk mendapatkan CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Menampilkan alert error
function showErrorAlert(message) {
    // Cek apakah elemen alert sudah ada
    let alertContainer = document.getElementById('error-alert');
    if (!alertContainer) {
        // Buat container alert baru
        alertContainer = document.createElement('div');
        alertContainer.id = 'error-alert';
        alertContainer.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alertContainer.setAttribute('role', 'alert');
        
        // Tambahkan button close
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.setAttribute('data-bs-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');
        
        // Tambahkan pesan dan button ke alert
        alertContainer.textContent = message;
        alertContainer.appendChild(closeButton);
        
        // Tambahkan alert ke form
        const checkoutForm = document.getElementById('checkout-form');
        checkoutForm.parentNode.insertBefore(alertContainer, checkoutForm);
    } else {
        // Update pesan jika alert sudah ada
        alertContainer.textContent = message;
        
        // Tambahkan button close
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.setAttribute('data-bs-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');
        alertContainer.appendChild(closeButton);
    }
}