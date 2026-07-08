// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const rememberCheckbox = document.getElementById('remember');
    const btnLogin = document.querySelector('.btn-login');
    const btnText = btnLogin.querySelector('.btn-text');
    const btnLoader = btnLogin.querySelector('.btn-loader');

    // Password visibility toggle
    let passwordVisible = false;
    togglePassword.addEventListener('click', () => {
        passwordVisible = !passwordVisible;
        passwordInput.type = passwordVisible ? 'text' : 'password';

        // Update icon
        togglePassword.innerHTML = passwordVisible
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
    });

    // Form validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const showError = (input, message) => {
        const formGroup = input.closest('.form-group');
        let errorElement = formGroup.querySelector('.error-message');

        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
            formGroup.appendChild(errorElement);
        }

        errorElement.textContent = message;
        input.style.borderColor = '#ef4444';
    };

    const clearError = (input) => {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');

        if (errorElement) {
            errorElement.remove();
        }

        input.style.borderColor = '';
    };

    // Clear errors on input
    emailInput.addEventListener('input', () => clearError(emailInput));
    passwordInput.addEventListener('input', () => clearError(passwordInput));

    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberCheckbox.checked;

        // Clear previous errors
        clearError(emailInput);
        clearError(passwordInput);

        // Validate inputs
        let hasError = false;

        if (!email) {
            showError(emailInput, 'Email wajib diisi');
            hasError = true;
        } else if (!validateEmail(email)) {
            showError(emailInput, 'Format email tidak valid');
            hasError = true;
        }

        if (!password) {
            showError(passwordInput, 'Password wajib diisi');
            hasError = true;
        } else if (!validatePassword(password)) {
            showError(passwordInput, 'Password minimal 6 karakter');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        // Show loading state
        btnLogin.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';

        try {
            // Call backend API
            await performLogin(email, password, remember);

            // Success - redirect to dashboard
            console.log('Login successful:', { email, remember });

            // Show success message
            showNotification('Login berhasil! Mengalihkan...', 'success');

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'index-vue.html#/';
            }, 1000);

        } catch (error) {
            // Show error message
            btnLogin.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';

            showNotification(error.message || 'Login gagal. Silakan coba lagi.', 'error');
        }
    });

    // API login call
    const performLogin = async (email, password, remember) => {
        const API_BASE_URL = '__API_BASE_URL__';

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Login gagal' }));
            throw new Error(error.message || 'Email atau password salah');
        }

        const data = await response.json();

        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('onboardingCompleted', data.user.onboardingCompleted);

        if (remember) {
            localStorage.setItem('mymo_remember', 'true');
        }

        return data;
    };

    // Google OAuth initialization
    const initGoogleAuth = async () => {
        try {
            await loadGoogleScript();

            google.accounts.id.initialize({
                client_id: '157253276114-mh9ej6atc7f4qssi3v3adfl2t4ajl1os.apps.googleusercontent.com',
                callback: handleGoogleCallback,
                auto_select: false,
            });

            const socialContainer = document.querySelector('.social-login');
            if (socialContainer) {
                const width = socialContainer.offsetWidth || 350;
                socialContainer.innerHTML = ''; // Clear the custom button
                
                const wrapper = document.createElement('div');
                wrapper.style.display = 'flex';
                wrapper.style.justifyContent = 'center';
                wrapper.style.width = '100%';
                socialContainer.appendChild(wrapper);

                google.accounts.id.renderButton(
                    wrapper,
                    { theme: 'outline', size: 'large', width: width }
                );
            }
        } catch (error) {
            console.error('Failed to initialize Google Auth:', error);
        }
    };

    // Load Google Sign-In script
    const loadGoogleScript = () => {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="accounts.google.com"]')) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Gagal memuat Google Sign-In'));
            document.head.appendChild(script);
        });
    };

    // Handle Google OAuth callback
    const handleGoogleCallback = async (response) => {
        try {
            const credential = response.credential;
            const userInfo = parseJwt(credential);

            console.log('Google credential received, verifying with backend...');

            const API_BASE_URL = '__API_BASE_URL__';
            const apiResponse = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    googleId: userInfo.sub,
                    email: userInfo.email,
                    name: userInfo.name
                })
            });

            const data = await apiResponse.json();

            if (apiResponse.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('onboardingCompleted', data.user.onboardingCompleted);

                showNotification('Login dengan Google berhasil! Mengalihkan...', 'success');

                setTimeout(() => {
                    window.location.href = 'index-vue.html#/';
                }, 1000);
            } else {
                throw new Error(data.error || 'Google login failed on backend');
            }

        } catch (error) {
            console.error('Google login error:', error);
            showNotification('Google login gagal. Silakan coba lagi.', 'error');
        }
    };

    // Parse JWT token
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Token tidak valid');
        }
    };

    // Notification system
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Add animations if not already added
        if (!document.querySelector('#notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Auto dismiss after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    };

    // Check if user is already logged in
    const checkAuthStatus = () => {
        const user = localStorage.getItem('token');
        if (user) {
            // User is already logged in, redirect to dashboard
            console.log('User already logged in, redirecting...');
            window.location.href = 'index-vue.html#/';
        }
    };

    // Initialize Google Auth on page load
    initGoogleAuth();

    checkAuthStatus();
});

console.log('MyMo Login - Ready');
