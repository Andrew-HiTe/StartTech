/**
 * Rotas de controle de acesso para T-Draw
 * Configura os endpoints da API relacionados ao gerenciamento de colaboradores
 */

const express = require('express');
const AccessController = require('../controllers/AccessController');

const router = express.Router();

router.post('/verify-email', AccessController.verifyEmail);
router.get('/search-collaborators', AccessController.searchCollaborators);
router.get('/projects', AccessController.getProjects);

module.exports = router;
