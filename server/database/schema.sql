DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS characteristics CASCADE;
DROP TABLE IF EXISTS characteristics_reviews CASCADE;

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL NOT NULL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  date VARCHAR(20) NOT NULL,
  summary VARCHAR(1000) NOT NULL,
  body VARCHAR(1000) NOT NULL,
  recommend BOOLEAN NOT NULL,
  reported BOOLEAN NOT NULL,
  reviewer_name VARCHAR(100) NOT NULL,
  reviewer_email VARCHAR(100) NOT NULL,
  response VARCHAR(500) NOT NULL,
  helpfulness INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
  id SERIAL NOT NULL PRIMARY KEY,
  review_id INTEGER NOT NULL,
  url VARCHAR(1000) NOT NULL
);

-- ALTER TABLE photos
--   ADD CONSTRAINT FK_ReviewPhotos
--     FOREIGN KEY (review_id)
--       REFERENCES reviews(id)
--       ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS characteristics (
  id SERIAL NOT NULL UNIQUE PRIMARY KEY,
  product_id INTEGER NOT NULL,
  characteristic VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS characteristics_reviews (
  id SERIAL PRIMARY KEY,
  characteristic_id INTEGER NOT NULL,
  review_id INTEGER NOT NULL,
  value INTEGER NOT NULL
);

-- Create Indexes (Default B-Tree)
CREATE INDEX reviews_product_id_idx ON reviews(product_id);
CREATE INDEX photos_review_id_idx ON photos(review_id);
CREATE INDEX characteristics_product_id_idx ON characteristics(product_id);
CREATE INDEX characteristics_reviews_characteristics_id_idx ON characteristics_reviews(characteristic_id);

-- ALTER TABLE characteristic_reviews
--   ADD CONSTRAINT FK_Reviews
--     FOREIGN KEY (review_id)
--       REFERENCES reviews(id)
--         ON DELETE SET NULL;

-- ALTER TABLE characteristic_reviews
--   ADD CONSTRAINT FK_Characteristics
--     FOREIGN KEY (characteristic_id)
--       REFERENCES characteristics(id)
--       ON DELETE SET NULL;

-- psql sdc-reviews

-- Bulk import data from provided dataset
/*
  \COPY reviews FROM '/Users/jakobtruong/coding/hack-reactor/rpp33/reviews-service/server/database/data/reviews.csv' WITH delimiter ','  CSV HEADER;
  \COPY photos FROM '/Users/jakobtruong/coding/hack-reactor/rpp33/reviews-service/server/database/data/reviews_photos.csv' WITH delimiter ','  CSV HEADER;
  \COPY characteristics FROM '/Users/jakobtruong/coding/hack-reactor/rpp33/reviews-service/server/database/data/characteristics.csv' WITH delimiter ','  CSV HEADER;
  \COPY characteristics_reviews FROM '/Users/jakobtruong/coding/hack-reactor/rpp33/reviews-service/server/database/data/characteristic_reviews.csv' WITH delimiter ','  CSV HEADER;
*/
