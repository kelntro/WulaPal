const express = require('express');
const router = express.Router();
const { getGroups } = require('../controllers/groupController');

router.get('/groups', getGroups);

module.exports = router;
