module.exports = {
  extends: ['react-app', 'react-app/jest'],
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src/']
      }
    }
  },
  rules: {
    // Adicione regras personalizadas aqui se necessário
  }
};
