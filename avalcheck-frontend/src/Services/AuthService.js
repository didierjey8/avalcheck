import axios from 'axios';

class authService {
  constructor() {}

  generateConfig({ data, method, url, headers }) {
    return {
      method: method || 'post',
      maxBodyLength: Infinity,
      url: `https://avalcheckbackend.concilbot.com${url}`,
      headers: headers || {
        'Content-Type': 'application/json',
        Authorization: '••••••',
      },
      data: data,
    };
  }

  async auth({ data }) {
    const config = this.generateConfig({
      data,
      method: 'POST',
      url: '/users/signin',
      headers: { 'Content-Type': 'application/json' },
    });

    try {
      return await axios.request(config);
    } catch (error) {
      if (error.response?.status === 401) {
        // Limpiar localStorage y redirigir
        localStorage.removeItem('phone_user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('Certification_Level');
        window.location.href = '/';
      } else {
        // Propagar otros errores
        throw new Error(error.message || 'Request failed');
      }
    }
  }
}

export default authService;
