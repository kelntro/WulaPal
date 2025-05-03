const express = require('express');
const router = express.Router();
const { getGroups, getGroupsByMember } = require('../controllers/groupController');

router.get('/groups', getGroups);

router.get('/groups/member/:userId', getGroupsByMember);

module.exports = router;
