import axios from 'axios';
import authService from './../Services/AuthService'; 

jest.mock('axios'); 

describe('authService', () => {
  let service;

  beforeEach(() => {
    service = new authService();
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

  describe('auth', () => {
    const mockData = { phone: '1234567890', password: 'password' };

    it('should call axios with the correct configuration', async () => {
      axios.request.mockResolvedValue({ data: { token: 'fake-token' } });

      const result = await service.auth({ data: mockData });

      expect(axios.request).toHaveBeenCalledWith({
        method: 'POST',
        maxBodyLength: Infinity,
        url: 'https://avalcheckbackend.concilbot.com/users/signin',
        headers: {
          'Content-Type': 'application/json',
        },
        data: mockData,
      });

      expect(result).toEqual({ data: { token: 'fake-token' } });
    });

    it('should handle 401 error and clear localStorage', async () => {
      // Mock de localStorage
      const mockRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');

      // Mock de window.location.href
      delete window.location; // Elimina `location` para redefinirla
      window.location = { href: '' }; // Mockea `href`

      axios.request.mockRejectedValue({
        response: { status: 401 },
      });

      await service.auth({
        data: { phone: '1234567890', password: 'password' },
      });

      // Verificar que localStorage.removeItem fue llamado correctamente
      expect(mockRemoveItem).toHaveBeenCalledWith('phone_user');
      expect(mockRemoveItem).toHaveBeenCalledWith('access_token');
      expect(mockRemoveItem).toHaveBeenCalledWith('Certification_Level');

      // Verificar que redirige al inicio
      expect(window.location.href).toBe('/');
    });
  });
});
