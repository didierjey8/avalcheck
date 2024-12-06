import axios from 'axios';

class chatService {
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

  async sendMessage({ data, token }) {
    const config = this.generateConfig({
      data: data,
      method: 'post',
      url: '/users/chat',
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

  async sendMessageCreation({ data, token, contentType }) {
    const config = this.generateConfig({
      data: data,
      method: 'post',
      url: '/users/create',
      headers: {
        'Content-Type': contentType ? contentType : 'application/json',
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

  async readMessagesCreation({ token }) {
    const config = this.generateConfig({
      method: 'get',
      url: '/users/create',
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
  
  async removeMessagesCreation({ token }) {
    const config = this.generateConfig({
      method: 'delete',
      url: '/users/create',
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

  async sendMessageTransactions({ data, token }) {
    const config = this.generateConfig({
      data: data,
      method: 'GET',
      url: '/users/txs/mainnet',
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

export default chatService;
