const router = require('express').Router();
const { pool, queries } = require('./database/queries.js');

// List reviews
router.get('/reviews/', async (req, res) => {
  const product_id = req.query.product_id;
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  const sort = req.query.sort || 'newest';

  try {
    await queries.getReviews({product_id, page, count, sort})
    .then((data) => {
      var result = data.rows;
      res.send({product: product_id, page, count, results: result});
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});
router.get('/loaderio-f21320ff0ca5a683e37063ccfa552813.txt', (req, res) => {
	res.sendFile('/home/ubuntu/reviews-service/server/loaderio-f21320ff0ca5a683e37063ccfa552813.txt');
});
// Get review metadata
router.get('/reviews/meta', async (req, res) => {
  const product_id = req.query.product_id;
  try {
    await queries.getMetaData(product_id)
    .then((data) => {
      res.send(data);
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

// Add a review
router.post('/reviews', async (req, res) => {
  const params = { ...req.body};
  console.log(req.body);
  try {
    await queries.addReview(params)
    .then((result) => {
      console.log(result);
      const review_id = result.rows[0].id;
      queries.addPhotos({ photos: params.photos, review_id});
      queries.addCharacteristicsReviews({characteristics: params.characteristics, review_id});
    });
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
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
    res.sendStatus(400);
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
    res.sendStatus(400);
  }
});

module.exports = router;
