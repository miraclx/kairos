let fs = require('fs');
let path = require('path');

let bip39 = require('bip39');
let pms = require('pretty-ms');
let nsp = require('near-seed-phrase');

let {guesses: days, expectedPublicKeys} = require('./inputs');

console.log('(showing valid words only)');

let valids = [];

let bip39English = bip39.wordlists.english;

for (let [day, guesses] of Object.entries(days)) {
  console.log(`\n[Day ${+day + 1}]`);
  for (let [guess, matches, nValid, slot] of guesses.map(Array))
    if ((nValid = (matches = bip39English.filter(word => word == guess)).length)) {
      console.log(`  \u2022 \x1b[36m${guess}\x1b[0m`);
      ((slot = valids[day]) || (valids.push((slot = [])), slot)).push(...matches);
      if (nValid > 1 || !matches.includes(guess)) console.log(matches.map(word => `    - \x1b[32m${word}\x1b[0m`).join('\n'));
    }
}

console.log();

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

let cacheFile = path.join(__dirname, '.cache.json');
let [state, updated] = [{}, 1];
if (fs.existsSync(cacheFile)) {
  let start = Date.now();
  process.stdout.write('(i) Loading cache file...\x1b[0m');
  state = JSON.parse(fs.readFileSync(cacheFile).toString());
  console.log(`done (in ${pms(Date.now() - start)})`);
}
let [index, startTime, total] = [0, Date.now(), valids.reduce((a, t) => a * t.length, 1)];
let [epoch5s, kps, lastTracked, epoch2ms, spinCursor] = [Date.now(), 0, 0, 0, 0];
let found, now;
for (let potential_phrase of permute(valids)) {
  let phrase = potential_phrase.join(' ');
  let keyPair =
    phrase in state
      ? state[phrase]
      : ((updated |= 1),
        (state[phrase] =
          bip39.validateMnemonic(phrase, bip39English) &&
          Object.fromEntries(
            Object.entries(nsp.parseSeedPhrase(phrase)).filter(([k]) => ['secretKey', 'publicKey'].includes(k)),
          )));
  if (updated && (now = Date.now()) - epoch5s > 5000) {
    // do this at every 5second interval
    [updated, epoch5s, lastTracked] = [0, now, index];
    fs.writeFileSync(cacheFile, JSON.stringify(state));
  }
  index += 1;
  found = keyPair && expectedPublicKeys.includes(keyPair.publicKey);
  if (found || (now = Date.now()) - epoch2ms > 200) {
    // do this at every 200ms interval
    epoch2ms = now;
    let barSize = process.stdout.columns / 4;
    if (Date.now() - epoch5s >= 500) kps = Math.round((index - lastTracked) / ((Date.now() - epoch5s) / 1000));
    let spinner = ['/', '-', '\\', '-'][(spinCursor = (spinCursor + 1) % 4)];
    let bar = Array.apply(null, {length: barSize})
      .map((_, i) => (i < (index / total) * barSize ? '\x1b[38;5;249m\u2588' : '\x1b[48;5;238m '))
      .join('');
    let progress = ((index / total) * 100).toFixed(2);
    let status = `${spinner} [${bar}\x1b[0m] (${kps} k/s) (${progress}%) (${pms(
      ((total - index) / (kps || 1)) * 1000,
    )}) [${index}/${total}]`;
    let line = potential_phrase.map(word => word.padEnd(8, ' ')).join(' ');
    console.log(`${index - 1 ? '\x1b[F\x1b[J' : ''}  \x1b[38;5;244m${line}\x1b[0m`);
    process.stdout.write(status);
  }
  if (found) {
    let elapsed = pms(Date.now() - startTime);
    console.log(`\n\x1b[32m> Found Valid Key (in ${elapsed}) <\x1b[0m`);
    console.log(` • Seed Phrase: \x1b[33m${phrase}\x1b[0m`);
    console.log(` • Secret Key : \x1b[33m${keyPair.secretKey}\x1b[0m`);
    console.log(` • Public Key : \x1b[33m${keyPair.publicKey}\x1b[0m`);
    break;
  }
}
if (!found) console.log('\n\x1b[31mNo valid combinations found.\x1b[0m');
