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

module.exports = { addGroup, getGroups };
