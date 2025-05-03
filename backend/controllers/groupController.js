const Group = require('../models/Group');
let groups = []; // Store deployed groups temporarily

const addGroup = (contractAddress) => {
    groups.push({
        id: groups.length + 1,
        contractAddress
    });
};

const getGroups = (req, res) => {
    res.json(groups);
};

const getGroupsByMember = async (req, res) => {
    try {
      const { userId } = req.params;
      const groups = await Group.find({ 'members.userId': userId });
      res.status(200).json(groups);
    } catch (error) {
      console.error('❌ Failed to fetch groups by member:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = { addGroup, getGroups, getGroupsByMember };
