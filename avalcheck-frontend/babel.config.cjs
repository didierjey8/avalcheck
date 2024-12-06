module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }], // Soporte para ESM
    '@babel/preset-react', // Soporte para JSX
  ],
};
