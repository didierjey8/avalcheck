module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest', // Transforma JS/TS usando Babel
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(wagmi|other-esm-module)/)', // Transforma módulos ESM específicos
  ],
  moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Simula archivos de estilos
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
