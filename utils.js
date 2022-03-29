let {formatWithOptions} = require("util");

function assert_eq(l, r) {
  if (!Array.apply(null, {length: Math.max(l.length, r.length)}).every((_, i) => l[i] === r[i])) 
   throw new Error("assertion failed");
}

function log(...msg) {
  console.log(formatWithOptions({
    colors: true,
    depth: Infinity
  }, ...msg));
}

function* permute(list) {
  if (!list.length) {
    yield [];
    return;
  }
  let [head, ...tail] = list;
  for (let v of head) {
    for (let rest of permute(tail)) {
      yield [v, ...rest];
    }
  }
}

module.exports = {assert_eq, log, permute};
