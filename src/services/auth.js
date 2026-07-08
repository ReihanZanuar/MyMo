import api from './api';

export const authService = {
  async register(email, password, name) {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('onboardingCompleted', response.data.user.onboardingCompleted);
    }

    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('onboardingCompleted', response.data.user.onboardingCompleted);
    }

    return response.data;
  },

  async googleAuth(googleToken) {
    const response = await api.post('/auth/google', {
      googleId: googleToken,
      email: '',
      name: '',
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('onboardingCompleted', response.data.user.onboardingCompleted);
    }

    return response.data;
  },

  async completeOnboarding() {
    const response = await api.post('/auth/complete-onboarding');

    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('onboardingCompleted', 'true');
    }

    return response.data;
  },

  isOnboardingCompleted() {
    return localStorage.getItem('onboardingCompleted') === 'true';
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboardingCompleted');
  }
};
