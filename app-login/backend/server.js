const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração da conexão com o MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'teste'
});

// Função para verificar e criptografar senhas não criptografadas
async function verificaSenha() {
  db.query("SELECT id, senha FROM usuarios WHERE senha NOT LIKE '$2b$%'", async (err, results) => {
    if (err) return;

    for (let usuario of results) {
      try {
        const senhaHash = await bcrypt.hash(usuario.senha, 10);
        db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaHash, usuario.id]);
      } catch (error) {
        console.error(`Erro ao criptografar senha do usuário ${usuario.id}`);
      }
    }
  });
}

// Verificar senhas não criptografadas a cada 1 segundos
setInterval(verificaSenha, 1000);

// Rota para validar login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Erro no servidor' });
    }
    
    if (results.length > 0) {
      try {
        // Comparar senha com hash
        const senhaValida = await bcrypt.compare(senha, results[0].senha);
        
        if (senhaValida) {
          res.json({ success: true, message: 'Login realizado com sucesso' });
        } else {
          res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
        }
      } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao validar senha' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
    }
  });
});

app.listen(5000, () => {
  console.log('Servidor backend rodando na porta 5000');
});