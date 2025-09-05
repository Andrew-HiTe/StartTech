/**
 * Model de usuário para T-Draw
 * Responsável por operações de banco de dados relacionadas aos usuários,
 * incluindo autenticação e gerenciamento de senhas criptografadas
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Busca usuário no banco de dados pelo email
 */
class UserModel {
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * Atualiza a senha de um usuário no banco de dados
   */
  static async updatePassword(id, hashedPassword) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hashedPassword, id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * Busca usuários com senhas ainda não criptografadas
   * Identifica senhas que não começam com padrão bcrypt ($2b$)
   */
  static async findUnhashedPasswords() {
    return new Promise((resolve, reject) => {
      db.query("SELECT id, senha FROM usuarios WHERE senha NOT LIKE '$2b$%'", (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * Criptografa uma senha usando bcrypt
   */
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Compara uma senha em texto plano com uma senha criptografada
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Busca todos os usuários para verificação de email
   */
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT id, email FROM usuarios', (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = UserModel;
