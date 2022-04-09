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
