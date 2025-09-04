/**
 * Definição das rotas de autenticação
 * Configura os endpoints da API relacionados ao login
 * e autenticação de usuários
 */

const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

router.post('/login', AuthController.login);

module.exports = router;