import axios from 'axios';

class CertifiedQuestionsService {
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

  async GetAnswerAndQuestion({ level, token }) {
    const config = this.generateConfig({
      method: 'get',
      url: `/certificates/quiz/${level}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    
    try {
      return axios.request(config);
    } catch (error) {
      if (error.response.status === 401) {  
        localStorage.removeItem('phone_user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('Certification_Level'); 
        window.location.href="/";
      } 
    }
  }

  sendAnswer({ answers, level, token }) {
    const config = this.generateConfig({
      data: { answers: answers },
      method: 'post',
      url: `/certificates/submit/${level}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    
    try {
      return axios.request(config);
    } catch (error) {
      if (error.response.status === 401) {  
        localStorage.removeItem('phone_user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('Certification_Level'); 
        window.location.href="/";
      } 
    }
  }
}

export default CertifiedQuestionsService;
