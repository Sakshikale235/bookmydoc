// Modern Login/Registration Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    
    // Switch to registration form
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
    });
    
    // Switch to login form
    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });
    
    // Form validation
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const inputs = this.querySelectorAll('input');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'This field is required');
                } else {
                    clearError(input);
                    
                    // Email validation for email field
                    if (input.type === 'email' || input.placeholder.toLowerCase() === 'email') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(input.value)) {
                            isValid = false;
                            showError(input, 'Please enter a valid email');
                        }
                    }
                    
                    // Password validation
                    if (input.type === 'password') {
                        if (input.value.length < 6) {
                            isValid = false;
                            showError(input, 'Password must be at least 6 characters');
                        }
                    }
                }
            });
            
            if (isValid) {
                // Here you would typically submit the form or make an API call
                console.log('Form submitted successfully');
                
                // For demo purposes, show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = 'Success! Redirecting...';
                form.appendChild(successMessage);
                
                // Simulate redirect after successful login/registration
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            }
        });
    });
    
    // Show error message
    function showError(input, message) {
        const parent = input.parentElement;
        const errorElement = parent.querySelector('.error-message') || document.createElement('span');
        
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        if (!parent.querySelector('.error-message')) {
            parent.appendChild(errorElement);
        }
        
        input.classList.add('error');
    }
    
    // Clear error message
    function clearError(input) {
        const parent = input.parentElement;
        const errorElement = parent.querySelector('.error-message');
        
        if (errorElement) {
            parent.removeChild(errorElement);
        }
        
        input.classList.remove('error');
    }
    
    // Add some animation effects
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focus');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focus');
            }
        });
    });
});