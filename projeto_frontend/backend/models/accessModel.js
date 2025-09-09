/**
 * Model de acesso para T-Draw
 * Responsável por operações relacionadas ao controle de acesso e colaboradores
 */

const db = require('../config/database');

class AccessModel {
  /**
   * Verifica se um email existe no sistema
   */
  static async emailExists(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT email FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  }

  /**
   * Busca colaboradores por termo de pesquisa
   */
  static async searchCollaborators(searchTerm) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT email FROM usuarios WHERE email LIKE ? LIMIT 10';
      const term = `%${searchTerm}%`;
      
      db.query(query, [term], (err, results) => {
        if (err) {
          reject(err);
        } else {
          // Adaptar resultado para incluir name usando email
          const collaborators = results.map(user => ({
            email: user.email,
            name: user.email
          }));
          resolve(collaborators);
        }
      });
    });
  }

  /**
   * Busca usuário por email (para detalhes completos)
   */
  static async findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT id, email FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0 ? results[0] : null);
        }
      });
    });
  }
}

module.exports = AccessModel;
