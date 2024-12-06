import axios from 'axios';
import CertifiedQuestionsService from './../Services/CertifiedQuestionsService';

jest.mock('axios'); 

describe('CertifiedQuestionsService', () => {
  let service;

  beforeEach(() => {
    service = new CertifiedQuestionsService();
  });

  describe('generateConfig', () => {
    it('should generate a default configuration object', () => {
      const config = service.generateConfig({
        data: { key: 'value' },
        url: '/test',
      });

      expect(config).toEqual({
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://avalcheckbackend.concilbot.com/test',
        headers: {
          'Content-Type': 'application/json',
          Authorization: '••••••',
        },
        data: { key: 'value' },
      });
    });

    it('should override default values when provided', () => {
      const config = service.generateConfig({
        data: { key: 'value' },
        method: 'PUT',
        url: '/test',
        headers: {
          'Custom-Header': 'customValue',
        },
      });

      expect(config).toEqual({
        method: 'PUT',
        maxBodyLength: Infinity,
        url: 'https://avalcheckbackend.concilbot.com/test',
        headers: {
          'Custom-Header': 'customValue',
        },
        data: { key: 'value' },
      });
    });
  });

  describe('GetAnswerAndQuestion', () => {
    const mockLevel = 'level1';
    const mockToken = 'fake-token';

    it('should call axios with the correct configuration', async () => {
      axios.request.mockResolvedValue({ data: { questions: [] } });

      const result = await service.GetAnswerAndQuestion({
        level: mockLevel,
        token: mockToken,
      });

      expect(axios.request).toHaveBeenCalledWith({
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://avalcheckbackend.concilbot.com/certificates/quiz/${mockLevel}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
      });

      expect(result).toEqual({ data: { questions: [] } });
    });
  });

  describe('sendAnswer', () => {
    const mockAnswers = ['A', 'B', 'C'];
    const mockLevel = 'level1';
    const mockToken = 'fake-token';

    it('should call axios with the correct configuration', async () => {
      axios.request.mockResolvedValue({ data: { success: true } });

      const result = await service.sendAnswer({
        answers: mockAnswers,
        level: mockLevel,
        token: mockToken,
      });

      expect(axios.request).toHaveBeenCalledWith({
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://avalcheckbackend.concilbot.com/certificates/submit/${mockLevel}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        data: { answers: mockAnswers },
      });

      expect(result).toEqual({ data: { success: true } });
    });
  });
});
