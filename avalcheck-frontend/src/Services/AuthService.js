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
      data: data,
      method: 'POST',
      url: '/users/signin',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    return axios.request(config);
  }

}

export default authService;
