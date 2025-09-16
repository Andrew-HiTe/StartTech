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
    try {
      const [results] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Atualiza a senha de um usuário no banco de dados
   */
  static async updatePassword(id, hashedPassword) {
    try {
      const [results] = await db.execute('UPDATE usuarios SET senha = ? WHERE id = ?', [hashedPassword, id]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca usuários com senhas ainda não criptografadas
   * Identifica senhas que não começam com padrão bcrypt ($2b$)
   */
  static async findUnhashedPasswords() {
    try {
      const [results] = await db.execute("SELECT id, senha FROM usuarios WHERE senha NOT LIKE '$2b$%'");
      return results;
    } catch (error) {
      throw error;
    }
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
    try {
      const [results] = await db.execute('SELECT id, email FROM usuarios');
      return results;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserModel;
