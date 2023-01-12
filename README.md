# About

This microservice architecture was created as a response to a significant increase in traffic for the Atelier E-Commerce website. As the engineer responsible for all CRUD operations of the Ratings and Reviews section of our outdated, monolith architecture, I chose to create a microservice based system with an initial client specification 100 responses per second (RPS) with an low average latency (<2000ms) and low error rate (<1%). With the additional time I had after achieving the client specs early on, I decided to both vertically and horizontally scale the microservice to support more than 5500 RPS with an average latency of <10ms and 0% error rate.

![image50](https://user-images.githubusercontent.com/81450107/212163936-bf4b3fa9-c9bf-4474-a019-eda21ec733c1.png)

# Architecture
The final architecture included 2 Node servers, PostgreSQL database server, Redis caching server, and NGINX load balancer. All servers were deployed with AWS EC2 t2.micro instances since they were both effective in achieving client specs and economical.

![SDC Presentation](https://user-images.githubusercontent.com/81450107/212180754-a7cb59ba-8910-4084-8631-288aae04762a.png)
*Visual representation of ratings and reviews microservice architecture*

# Performance Improvements
To further increase the performance of the microservice, all improvements were driven by data provided by testing the microservice with  k6 (for load testing on local machine), Loader.io (for cloud-based load testing on deployed microservice) , and New Relic (for monitoring each server's resources) for the following improvements to be made:
### 2 Node Servers
- Node.js Express web application framework was used for rapid development time to leave more time for finding bottlenecks and improving system
- postgreSQL pools for reusable pool of clients to reduce the cost of time a new client takes to be established with the PostgreSQL server
- A single query was used for each endpoint rather than chained promises which increase performance by roughly 40%
### PostgreSQL Database Server
- Alternative databases were considered but PostgreSQL was chosen due to scalability, documentation, data types supported, and was most compatible with the given dataset.
- B-tree indexing which cut query execution times from 28977.975ms to 2.400ms on GET /reviews/meta endpoint
### Redis Caching Server
- Max memory was increased to 200MB to alleviate the bottleneck on the database server
- Last recently used (LRU) key eviction was used so that more recently used API requests were given priority in the caching server
### NGINX Load Balancer
- Vastly changed the default NGINX config files to allow more read/writes and increased both the amount of connections and connection uptime to handle more clients per second
- Round Robin was used and proven to be more effective than weighted load balancing methods at high RPS

# Routes

### List Reviews
Returns a list of reviews for a particular product. This list **does not** include any reported reviews.

`GET /reviews`

*Query Parameters*
| Parameter   | Type        | Description |
| ----------- | ----------- | ----------- |
| page | integer | Selects the page of results to return (Default = 1) |
| count | integer | Specifies how many results per page to return (Default = 5) |
| sort | text | Changes the sort order of reviews to be based on "newest", "helpful", or "relevant" |
| product_id | integer | Specifies the product for which to retrieve reviews |

### Get Review Metadata
Returns review metadata for a given product.

`GET /reviews/meta`

*Query Parameters*
| Parameter   | Type        | Description |
| ----------- | ----------- | ----------- |
| product_id | integer | **Required** ID of the product for which data should be returned |

### Add a Review
Adds a review for the given product.

`POST /reviews`

*Body Parameters*
| Parameter   | Type        | Description |
| ----------- | ----------- | ----------- |
| product_id | integer | **Required** ID of the product to post the review for |
| rating | integer | Integer (1-5) indicating the rating of the review given |
| summary | text | Summary text of the review |
| body | text | Continued or full text of the review |
| recommend | boolean | Value indicating if the reviewer recommends the product |
| name | text | Username for question asker |
| email | text | Email address for question asker |
| photos | [text] | Array of text urls that link to images to be shown |
| characteristics | object | Object of keys representing characteristic_id and values representing the review value for that characterstic (ex: {"14": 5, "15": 5, ...} |

### Mark Review as Helpful
Updates a review to show it was found helpful

`PUT /reviews/:review_id/helpful `

*Parameters*
| Parameter   | Type        | Description |
| ----------- | ----------- | ----------- |
| review_id | integer | **Required** ID of the review to be updated |

### Report Review
Updates a review to show it was reported. Note, this action does not delete the review, but the review will not be returned in the above GET request.

`PUT /reviews/:review_id/report`

*Parameters*
| Parameter   | Type        | Description |
| ----------- | ----------- | ----------- |
| review_id | integer | **Required** ID of the review to be updated |

# Technologies
After considering their respective alternatives, the following technologies were chosen due to the efficiency, cost, large community support, and availability of robust documentation.
- Deployment
  - AWS EC2 t2.micro instances
  - Docker
- Node Server
  - Node.js Express
- Database
  - PostgreSQL
- Caching
  - Redis
- Load Balancing
  - NGINX
- Monitoring Server Resources / Load testing
  - New Relic
  - k6
  - Loader.io
