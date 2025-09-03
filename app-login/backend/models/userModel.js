const db = require('../config/database');
const bcrypt = require('bcrypt');

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

  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = UserModel;