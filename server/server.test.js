function sum(num1, num2) {
  return num1 + num2;
}

test('adds 2 + 2 equals 4', () => {
  expect(sum(2, 2)).toBe(4);
});
