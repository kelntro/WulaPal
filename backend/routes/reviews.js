const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Get all reviews for a user
router.get('/:userId', async (req, res) => {
  const reviews = await Review.find({ reviewedUser: req.params.userId }).populate('reviewer', 'name');
  res.json(reviews);
});

// Post a review
router.post('/', async (req, res) => {
  const { reviewer, reviewedUser, rating, comment } = req.body;
  const newReview = new Review({ reviewer, reviewedUser, rating, comment });
  await newReview.save();
  res.json(newReview);
});

module.exports = router;