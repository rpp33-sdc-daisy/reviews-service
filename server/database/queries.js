require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT
});

pool.on('error', (err, client) => {
  console.log('Unexpected error on idle client: ', err);
  process.exit(-1);
});

const queries = {
  getPhotos: async (review_id) => {
    const query = `SELECT id, url
      FROM photos
      WHERE review_id = ${review_id}
      ;`;

    return pool
      .connect()
      .then((client) => {
        return client
          .query(query)
          .then((res) => {
            client.release();
            return res;
          })
          .catch((err) => {
            client.release();
            console.log(err.stack);
          });
      });
    // return await db.query(query);
  },
  getReviews: ({product_id, page, count, sort}) => {
    if (sort === 'newest') {
      sort = 'ORDER BY date DESC';
    } else if (sort === 'relevant') {
      sort = 'ORDER BY helpfulness DESC, date';
    } else if (sort === 'helpful') {
      sort = 'order by helpfulness DESC';
    }

    const query = `SELECT r1.id AS review_id, r1.rating, r1.summary, r1.recommend, r1.response, r1.body, r1.date, r1.reviewer_name, r1.helpfulness,
      (
      SELECT ARRAY_TO_JSON(COALESCE(ARRAY_AGG(photo), array[]::record[]))
      FROM
        (
          SELECT p.id, p.url
          FROM reviews r2
          INNER JOIN photos p
          ON r2.id = p.review_id
          WHERE p.review_id = r1.id
        ) photo
      ) AS photos
      FROM reviews r1
      WHERE r1.product_id = ${product_id} AND r1.reported <> true
      ${sort}
      LIMIT ${count}
      OFFSET ${count * page - count}
      ;`;

      return pool
      .connect()
      .then((client) => {
        return client
          .query(query)
          .then((res) => {
            client.release();
            return res;
          })
          .catch((err) => {
            client.release();
            console.log(err.stack);
          });
      });
  },
  getMetaData: (product_id) => {
    const query = `
      SELECT rMain.product_id,
        (
        SELECT JSONB_AGG(outerC) FROM
          (
          SELECT json_object_agg(r2.rating,
            (
            SELECT COUNT(r1.rating)
            FROM reviews r1
            WHERE r1.product_id = rMain.product_id AND r1.rating = r2.rating
            )
          ) AS counts
        FROM reviews r2
        WHERE r2.product_id = rMain.product_id
        GROUP BY r2.rating) AS outerC) AS ratings,
        (
        SELECT JSONB_AGG(outerRecommendCounts) FROM
          (
          SELECT json_object_agg(r4.recommend,
            (
            SELECT count(r3.recommend)
            FROM reviews r3
            WHERE r3.product_id = rMain.product_id AND r3.recommend = r4.recommend
            )
          ) AS recommendCounts
        FROM reviews r4
        WHERE r4.product_id = rMain.product_id
        GROUP BY r4.recommend) AS outerRecommendCounts
        ) AS recommended,
        (
        SELECT ARRAY_TO_JSON(ARRAY_AGG(characteristicGroup)) FROM
          (
          SELECT c.characteristic, c.id, avg(cr.value) AS value
          FROM "characteristics" c
          INNER JOIN characteristics_reviews cr
          ON c.id = cr.characteristic_id
          WHERE c.product_id = rMain.product_id
          GROUP BY c.id
          ) characteristicGroup
        ) AS characteristics
      FROM reviews rMain
      WHERE rMain.product_id = ${product_id}
      GROUP BY rMain.product_id
      ;`;

    const transformer = (data) => {
      let transformedRatings = {},
        transformedRecommended = {},
        transformedCharacteristics = {};
      data = data.rows[0];

      data.ratings.forEach((row) => {
        transformedRatings = { ...transformedRatings, ...row.counts };
      });
      data.ratings = transformedRatings;

      data.recommended.forEach((row) => {
        transformedRecommended = { ...transformedRecommended, ...row.recommendcounts };
      });
      data.recommended = transformedRecommended;

      data.characteristics.forEach((row) => {
        transformedCharacteristics = { ...transformedCharacteristics, [row.characteristic]: { id: row.id, value: row.value } };
      });
      data.characteristics = transformedCharacteristics;
      return data;
    };

    return pool
      .connect()
      .then((client) => {
        return client
          .query(query)
          .then((res) => {
            client.release();
            return transformer(res);
          })
          .catch((err) => {
            client.release();
            console.log(err.stack);
          });
      });
  },
  addPhotos: ({photos, review_id}) => {
    const query = `INSERT INTO photos (url, review_id)
      SELECT url, review_id FROM UNNEST ($1::text[], $2::int[]) AS t (url, review_id);`;

    return pool
      .connect()
      .then((client) => {
        return client
          .query(query, [photos, Array(photos.length).fill(review_id)])
          .then((res) => {
            client.release();
            return res;
          })
          .catch((err) => {
            client.release();
            console.log(err.stack);
          });
      });
  },
  addCharacteristicsReviews: ({characteristics, review_id}) => {
    const query = ` INSERT INTO characteristics_reviews (review_id, characteristic_id, value)
      SELECT review_id, characteristics_id, value FROM UNNEST ($1::int[], $2::int[], $3::int[]) AS t (review_id, characteristics_id, value)`;

    return pool
      .connect()
      .then((client) => {
        return client
          .query(query, [
            Array(Object.keys(characteristics).length).fill(review_id),
            Object.keys(characteristics),
            Object.values(characteristics)
          ])
          .then((res) => {
            client.release();
            return res;
          })
          .catch((err) => {
            client.release();
            console.log(err.stack);
          });
      });

  },
  addReview: (params) => {
    const query = `INSERT INTO reviews
      ("product_id", "rating", "date", "summary", "body", "recommend", "reviewer_name", "reviewer_email")
      VALUES
      ($1, $2, current_timestamp, $3, $4, $5, $6, $7)
      RETURNING id;`;
      console.log('PARAMS', params);
    const values = [
      params.product_id,
      params.rating,
      params.summary,
      params.body,
      params.recommend,
      params.name,
      params.email
    ];

    return pool
      .connect()
      .then((client) => {
        return client
          .query(query, values)
          .then((res) => {
            client.release();
            return res;
          })
          .catch((err) => {
            client.release();
            console.log(err.stack);
          });
      });
  },
  markHelpful: (review_id) => {
    const query = `UPDATE reviews SET helpfulness =  helpfulness + 1 WHERE id = ${review_id}`;

    return pool
      .connect()
      .then((client) => {
        return client
          .query(query)
          .then((res) => {
            client.release();
            return res;
          })
          .catch((err) => {
            client.release();
            console.log(err.stack);
          });
      });
  },
  reportReview: (review_id) => {
    const query = `UPDATE reviews SET reported = NOT reported WHERE id= ${review_id};`;

    return pool
      .connect()
      .then((client) => {
        return client
          .query(query)
          .then((res) => {
            client.release();
            return res;
          })
          .catch((err) => {
            client.release();
            console.log(err.stack);
          });
      });
  }
}
module.exports = { pool, queries };
