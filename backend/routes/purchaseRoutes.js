const express = require('express');
const { createPlanPurchase } = require('../controllers/purchaseController');

const router = express.Router();

router.post('/plan', createPlanPurchase); // << setup route /api/purchase/plan

module.exports = router;
