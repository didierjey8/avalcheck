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
    console.log(token);

    const config = this.generateConfig({
      data: data,
      method: 'post',
      url: '/users/chat',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return axios.request(config);
  }

  async sendMessageCreation({ data, token }) {
    const config = this.generateConfig({
      data: data,
      method: 'post',
      url: '/users/create',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return axios.request(config);
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

    return axios.request(config);
  }
}

export default chatService;
