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
    console.log(token);

    const config = this.generateConfig({
      method: 'get',
      url: `/surveys/call-explain-topic/${data.idQuestion}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return axios.request(config);
  }
}

export default Surveys;
