import axios from 'axios';

class Surveys {
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
      data: data || {},
    };
  }

  async SurveyAnswerQuestion({ data, token }) {
    const config = this.generateConfig({
      method: 'get',
      url: `/surveys/call-explain-topic/${data.idQuestion}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
        throw error;
      }
    }
  }
}

export default Surveys;
