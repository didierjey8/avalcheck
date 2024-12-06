import axios from 'axios';
import Surveys from './../Services/Surveys'; // Ajusta la ruta según tu proyecto

jest.mock('axios'); // Mockear axios para evitar solicitudes reales

describe('Surveys', () => {
  let service;

  beforeEach(() => {
    service = new Surveys();
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

  describe('SurveyAnswerQuestion', () => {
    const mockData = { idQuestion: '12345' };
    const mockToken = 'fake-token';

    it('should call axios with the correct configuration', async () => {
      axios.request.mockResolvedValue({ data: { success: true } });

      const result = await service.SurveyAnswerQuestion({
        data: mockData,
        token: mockToken,
      });

      expect(axios.request).toHaveBeenCalledWith({
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://avalcheckbackend.concilbot.com/surveys/call-explain-topic/${mockData.idQuestion}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        data: {}, // Incluir `data` vacío como parte de la configuración
      });

      expect(result).toEqual({ data: { success: true } });
    });

    it('should handle 401 error and clear localStorage', async () => {
      // Mock de localStorage
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');
      delete window.location; // Eliminar `location` para redefinirla
      window.location = { href: '' }; // Mockear `href`

      // Simular un error con código 401
      axios.request.mockRejectedValue({
        response: { status: 401 },
      });

      // Llamar al método
      await service.SurveyAnswerQuestion({ data: mockData, token: mockToken });

      // Verificar que `localStorage.removeItem` fue llamado con las claves correctas
      expect(mockRemoveItem).toHaveBeenCalledWith('phone_user');
      expect(mockRemoveItem).toHaveBeenCalledWith('access_token');
      expect(mockRemoveItem).toHaveBeenCalledWith('Certification_Level');

      // Verificar que redirige al inicio
      expect(window.location.href).toBe('/');
    });
  });
});
