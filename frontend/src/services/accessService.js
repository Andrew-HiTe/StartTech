/**
 * Serviço de controle de acesso para T-Draw
 * Gerencia chamadas à API relacionadas ao controle de colaboradores
 */

const API_BASE_URL = '/api/access';

class AccessService {
  /**
   * Verifica se um email existe no sistema
   */
  static async verifyEmail(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Erro na verificação do email');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      throw error;
    }
  }

  /**
   * Busca colaboradores por termo de pesquisa
   */
  static async searchCollaborators(searchTerm) {
    try {
      const response = await fetch(`${API_BASE_URL}/search-collaborators?search=${encodeURIComponent(searchTerm)}`);

      if (!response.ok) {
        throw new Error('Erro na busca de colaboradores');
      }

      const data = await response.json();
      return data.collaborators || [];
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      throw error;
    }
  }

  /**
   * Busca lista de projetos disponíveis
   */
  static async getProjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`);

      if (!response.ok) {
        throw new Error('Erro ao buscar projetos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw error;
    }
  }
}

export default AccessService;
