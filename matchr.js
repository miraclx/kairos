let fs = require("fs");
let path = require("path");

let pms = require("pretty-ms");
let nsp = require("near-seed-phrase");

let days = require("./days");
let {permute} = require("./utils");

let bip39 = fs
  .readFileSync("./bip39.txt")
  .toString()
  .split('\n')
  .filter(Boolean)
  .map(s => s.trim());

console.log("(showing valid words only)");

let valids = [];

for (let [day, guesses] of Object.entries(days)) {
  console.log(`\n[Day ${+day + 1}]`);
  for (let [guess, matches, nValid, slot] of guesses.map(Array))
    // if (nValid = (matches = bip39.filter(word => word.startsWith(guess))).length) {
    if (nValid = (matches = bip39.filter(word => word == guess)).length) {
      console.log(`  \u2022 \x1b[36m${guess}\x1b[0m`);
      ((slot = valids[day]) || (valids.push(slot = []), slot)).push(...matches);
      if (nValid > 1 || !matches.includes(guess))
        console.log(matches.map(word => `    - \x1b[32m${word}\x1b[0m`).join("\n"));
    }
}

let expectedPublicKeys = [
  // these are the two FullAccess keys on the puzzlemaster.near
  // account as at block hash AUuoUf2hZBWoxGF7bDuPzuyM88NHSEEr63sKgUQoHMLz
  "ed25519:43oLtgANKwkXnyEGuCb1McGZoAydJQ56ykXcx6wDnCnK",
  "ed25519:BTyLuYU4GzZEEN6wDPv3m1p14wLxhwnNFcymqrzNZrib"
];

let cacheFile = path.join(__dirname, '.cache.json');
let state = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile).toString()) : {};
let [current, lastWrite, now, start, total] = [0, 0, 0, Date.now(), valids.reduce((a, t) => a * t.length, 1)];
let ticker = setInterval(() => [current, start] = [0, Date.now()], 5000);
for (let potential_phrase of permute(valids)) {
  let phrase = potential_phrase.join(" ");
  let keyPair = (
    state[phrase]
    || (
      state[phrase] = Object.fromEntries(
        Object.entries(
          nsp.parseSeedPhrase(phrase)
        ).filter(([k]) => ["secretKey", "publicKey"].includes(k)))
    ));
  let kps = Math.round((current += 1) / ((Date.now() - start) / 1000));
  let barSize = process.stdout.columns / 4;
  let spinner = ["/", "-", "\\", "-"].find((_, i) => i > ((current % 27) / 9) - 1);
  let bar = Array.apply(null, {length: barSize}).map((_, i) => i < (current / total) * barSize ? "\x1b[38;5;249m\u2588" : "\x1b[48;5;238m ").join("");
  let progress = ((current / total) * 100).toFixed(2);
  let status = `${spinner} [${bar}\x1b[0m] (${kps} k/s) (${progress}%) (${pms((total - current) / kps * 1000)}) [${current}/${total}]`;
  if ((now = Date.now()) - lastWrite > 5000) {
    lastWrite = now;
    fs.writeFileSync(cacheFile, JSON.stringify(state));
  }
  if (expectedPublicKeys.includes(keyPair.publicKey)) {
    process.stdout.write(status);
    console.log("\n\x1b[32mFound Valid Key!\x1b[0m");
    console.log(` • Seed Phrase: \x1b[33m${phrase}\x1b[0m`);
    console.log(` • Secret Key: \x1b[33m${keyPair.secretKey}\x1b[0m`);
    console.log(` • Public Key: \x1b[33m${keyPair.publicKey}\x1b[0m`);
    break;
  }
  console.log(`\x1b[0G\x1b[2K  \x1b[38;5;244m✗ ${phrase}\x1b[0m`);
  process.stdout.write(status);
}
console.log("\n\x1b[31mNo valid combinations found.\x1b[0m");
clearInterval(ticker);
