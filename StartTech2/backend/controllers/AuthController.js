/**
 * Controlador de autenticação para T-Draw
 * Responsável por gerenciar operações de login e criptografia automática de senhas
 */

const UserModel = require('../models/UserModel');

class AuthController {
  /**
   * Realiza o processo de login do usuário
   * Valida credenciais, verifica senha criptografada e retorna resposta de autenticação
   */
  static async login(req, res) {
    try {
      const { email, senha } = req.body;
      
      // Validação básica
      if (!email || !senha) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email e senha são obrigatórios' 
        });
      }

      const users = await UserModel.findByEmail(email);
      
      if (users.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Email ou senha incorretos' 
        });
      }

      const user = users[0];
      const senhaValida = await UserModel.comparePassword(senha, user.senha);
      
      if (!senhaValida) {
        return res.status(401).json({ 
          success: false, 
          message: 'Email ou senha incorretos' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          email: user.email
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }

  /**
   * Verifica e criptografa senhas que ainda não estão em hash
   * Função executada periodicamente para garantir segurança das senhas armazenadas
   */
  static async verificaSenhas() {
    try {
      const users = await UserModel.findUnhashedPasswords();
      
      if (!users || users.length === 0) {
        return;
      }

      console.log(`Encontradas ${users.length} senhas para criptografar`);
      
      for (let usuario of users) {
        try {
          const senhaHash = await UserModel.hashPassword(usuario.senha);
          await UserModel.updatePassword(usuario.id, senhaHash);
          console.log(`Senha do usuário ${usuario.id} criptografada com sucesso`);
        } catch (error) {
          console.error(`Erro ao criptografar senha do usuário ${usuario.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar senhas:', error);
    }
  }
}

module.exports = AuthController;
