/**
 * Controlador de controle de acesso para T-Draw
 * Responsável por gerenciar verificação de emails e busca de colaboradores
 */

const db = require('../config/database');

class AccessController {
  /**
   * Verifica se um email existe no banco de dados
   */
  static async verifyEmail(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const query = 'SELECT email FROM usuarios WHERE email = ?';
      
      db.query(query, [email], (err, results) => {
        if (err) {
          console.error('Erro ao verificar email:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        const exists = results.length > 0;
        res.json({ 
          exists, 
          email: exists ? results[0].email : null,
          message: exists ? 'Email encontrado' : 'Email não cadastrado' 
        });
      });
    } catch (error) {
      console.error('Erro na verificação de email:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Busca colaboradores por termo de pesquisa
   */
  static async searchCollaborators(req, res) {
    try {
      const { search } = req.query;
      
      let query, params;
      
      if (!search || search.length === 0) {
        // Se não há busca, retorna todos os emails
        query = 'SELECT email FROM usuarios LIMIT 20';
        params = [];
      } else {
        // Se há busca, filtra por email
        query = 'SELECT email FROM usuarios WHERE email LIKE ? LIMIT 10';
        params = [`%${search}%`];
      }
      
      db.query(query, params, (err, results) => {
        if (err) {
          console.error('Erro ao buscar colaboradores:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        // Adaptar o resultado para incluir name (usando email como fallback)
        const collaborators = results.map(user => ({
          email: user.email,
          name: user.email // Usando email como nome já que não temos campo name
        }));
        
        res.json({ collaborators });
      });
    } catch (error) {
      console.error('Erro na busca de colaboradores:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Retorna lista de projetos disponíveis
   */
  static async getProjects(req, res) {
    try {
      const projects = [
        { id: 1, name: 'T-Draw Alpha', description: 'Sistema de gestão de desenhos técnicos' },
        { id: 2, name: 'T-Draw Beta', description: 'Plataforma de colaboração em projetos' },
        { id: 3, name: 'T-Draw Gamma', description: 'Sistema de controle de versões' },
        { id: 4, name: 'T-Draw Delta', description: 'Portal de visualização de projetos' }
      ];
      res.json(projects);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = AccessController;
