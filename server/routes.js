const router = require('express').Router();
const {db, queries} = require('./database/queries.js');

// List reviews
router.get('/reviews/', async (req, res) => {
  const productId = req.params.product_id;
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  const sort = req.query.sort || 'newest';

  res.sendStatus(200);
});

// Get review metadata
router.get('/reviews/meta', async (req, res) => {
  const params = req.params.product_id;

  res.sendStatus(200);
});

// Add a review
router.post('/reviews', async (req, res) => {
  const params = { ...req.body};

  try {
    await queries.addReview(params);
    res.sendStatus(201);
  } catch (err) {
    console.log(err)
    res.sendStatus(500);
  }
});

// Mark review as helpful
router.put('/reviews/:review_id/helpful', async (req, res) => {
  const review_id = req.params.review_id;

  try {
    await queries.markHelpful(review_id);
    res.sendStatus(204);
  } catch (err) {
    console.log(err)
    res.sendStatus(500);
  }
});

// Report review
router.put('/reviews/:review_id/report', async (req, res) => {
  const review_id = req.params.review_id;

  try {
    await queries.reportReview(review_id);
    res.sendStatus(204);
  } catch (err) {
    console.log(err)
    res.sendStatus(500);
  }
});

module.exports = router;