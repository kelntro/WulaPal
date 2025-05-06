// routes/admin.js
const express = require('express');
const router = express.Router();
const { isSuperAdmin } = require('../middleware/authorize');
const User = require('../models/User');
const Group = require('../models/Group');

router.get('/dashboard', isSuperAdmin, async (req, res) => {
  const organizers = await User.countDocuments({ role: 'organizer' });
  const members = await User.countDocuments({ role: 'member' });
  const activeGroups = await Group.countDocuments({ status: 'active' });
  const completedGroups = await Group.countDocuments({ status: 'completed' });
  const inactiveGroups = await Group.countDocuments({ status: 'inactive' });

  res.json({ organizers, members, activeGroups, completedGroups, inactiveGroups });
});
