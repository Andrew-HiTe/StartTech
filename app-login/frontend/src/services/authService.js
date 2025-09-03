const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  static async login(email, senha) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Erro no serviço de login:', error);
      throw new Error('Erro de conexão com o servidor');
    }
  }
}

export default AuthService;