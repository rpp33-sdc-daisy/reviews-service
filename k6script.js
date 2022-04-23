import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 100,
      maxVUs: 1000,
    },
  },
};

export default function () {
  // const randomProductId = Math.floor(Math.random() * 100002) + 900009;
  const url = `http://localhost:80/reviews/meta?product_id=64622`;
  let res = http.get(url);

  const checkRes = check(res, {
    'status is 200': (r) => r.status === 200,
    // 'response contains product id': (r) => {
    //   let parsedBody = JSON.parse(r.body);
    //   if (parsedBody.product_id !== randomProductId) {
    //     console.log(randomProductId);
    //   }
    //   return parsedBody.product_id === randomProductId;
    // }
  });
}
