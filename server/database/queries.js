require('dotenv').config();
const { Client } = require('pg');

const db = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT
});

db.connect(err => {
  if (err) {
    console.error('Connection error: ', err.stack);
  } else {
    console.log('Connected!');
  }
});

const queries = {
  addReview: (params) => {
    const query = `INSERT INTO reviews
        ("product_id", "rating", "date", "summary", "body", "recommend", "reviewer_name", "reviewer_email")
        VALUES
        ($1, $2, current_timestamp, $3, $4, $5, $6, $7)
        RETURNING id;`;
    const values = [
      params.product_id,
      params.rating,
      params.summary,
      params.body,
      params.recommend,
      params.reviewer_name,
      params.reviewer_email
    ];

    db.query(query, values)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
  },
  markHelpful: (review_id) => {
    const query = `UPDATE reviews SET helpfulness =  helpfulness + 1 WHERE id = ${review_id}`;

    db.query(query)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
  },
  reportReview: (review_id) => {
    const query = `UPDATE reviews SET reported = NOT reported WHERE id= ${review_id};`;

    db.query(query)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
  }
}
module.exports = { db, queries };
