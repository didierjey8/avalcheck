import axios from 'axios';
import chatService from './../Services/ChatService'; // Ajusta la ruta según tu proyecto

jest.mock('axios'); // Mockear axios para evitar solicitudes reales

describe('chatService', () => {
  let service;

  beforeEach(() => {
    service = new chatService();
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

  describe('sendMessage', () => {
    const mockData = { message: 'Hello' };
    const mockToken = 'fake-token';

    it('should call axios with the correct configuration', async () => {
      axios.request.mockResolvedValue({ data: { success: true } });

      const result = await service.sendMessage({
        data: mockData,
        token: mockToken,
      });

      expect(axios.request).toHaveBeenCalledWith({
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://avalcheckbackend.concilbot.com/users/chat',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        data: mockData,
      });

      expect(result).toEqual({ data: { success: true } });
    });
  });

  describe('sendMessageCreation', () => {
    const mockData = { content: 'New content' };
    const mockToken = 'fake-token';

    it('should call axios with the correct configuration and default Content-Type', async () => {
      axios.request.mockResolvedValue({ data: { success: true } });

      const result = await service.sendMessageCreation({
        data: mockData,
        token: mockToken,
      });

      expect(axios.request).toHaveBeenCalledWith({
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://avalcheckbackend.concilbot.com/users/create',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        data: mockData,
      });

      expect(result).toEqual({ data: { success: true } });
    });

    it('should override Content-Type when provided', async () => {
      axios.request.mockResolvedValue({ data: { success: true } });

      const result = await service.sendMessageCreation({
        data: mockData,
        token: mockToken,
        contentType: 'application/xml',
      });

      expect(axios.request).toHaveBeenCalledWith({
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://avalcheckbackend.concilbot.com/users/create',
        headers: {
          'Content-Type': 'application/xml',
          Authorization: `Bearer ${mockToken}`,
        },
        data: mockData,
      });

      expect(result).toEqual({ data: { success: true } });
    });
  });

  describe('readMessagesCreation', () => {
    const mockToken = 'fake-token';

    it('should call axios with the correct configuration', async () => {
      axios.request.mockResolvedValue({ data: { messages: [] } });

      const result = await service.readMessagesCreation({ token: mockToken });

      expect(axios.request).toHaveBeenCalledWith({
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://avalcheckbackend.concilbot.com/users/create',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
      });

      expect(result).toEqual({ data: { messages: [] } });
    });
  });

  describe('removeMessagesCreation', () => {
    const mockToken = 'fake-token';

    it('should call axios with the correct configuration', async () => {
      axios.request.mockResolvedValue({ data: { success: true } });

      const result = await service.removeMessagesCreation({ token: mockToken });

      expect(axios.request).toHaveBeenCalledWith({
        method: 'delete',
        maxBodyLength: Infinity,
        url: 'https://avalcheckbackend.concilbot.com/users/create',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
      });

      expect(result).toEqual({ data: { success: true } });
    });
  });

  describe('sendMessageTransactions', () => {
    const mockData = { transaction: '0x123' };
    const mockToken = 'fake-token';

    it('should call axios with the correct configuration', async () => {
      axios.request.mockResolvedValue({ data: { success: true } });

      const result = await service.sendMessageTransactions({
        data: mockData,
        token: mockToken,
      });

      expect(axios.request).toHaveBeenCalledWith({
        method: 'GET',
        maxBodyLength: Infinity,
        url: 'https://avalcheckbackend.concilbot.com/users/txs/mainnet',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        data: mockData,
      });

      expect(result).toEqual({ data: { success: true } });
    });
  });
});
