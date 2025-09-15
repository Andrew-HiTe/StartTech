/**
 * Rotas de autenticação para T-Draw
 * Configura os endpoints da API relacionados ao login e autenticação de usuários
 */

const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/login', AuthController.login);

module.exports = router;
