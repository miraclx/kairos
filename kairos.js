let fs = require('fs');
let path = require('path');

let bip39 = require('bip39');
let pms = require('pretty-ms');
let nsp = require('near-seed-phrase');

let {guesses, wordlistLanguage, expectedPublicKeys} = require('./inputs');

if (!(wordlistLanguage in bip39.wordlists)) throw new Error(`invalid wordlist language: ${wordlistLanguage}`);
let wordlist = bip39.wordlists[wordlistLanguage];

let valids = guesses.map(entry => entry.filter(word => wordlist.includes(word)));
if (!valids.length) throw new Error('no guesses');
for (let [i, words] of valids.entries()) {
  if (!words.length) throw new Error(`entry [${i + 1}] has no valid words`);
}

/// input = [
///   [1, 2],
///   [4, 5],
/// ];
///
/// output = [
///   [1, 4],
///   [1, 5],
///   [2, 4],
///   [2, 5],
/// ];
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

let shouldCache = !process.argv.includes('--no-cache');
let fresh = process.argv.includes('--fresh');
let cacheFile = path.join(__dirname, '.cache.json');
let [state, updated] = [{}, 1];
if (!fresh && fs.existsSync(cacheFile)) {
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
          bip39.validateMnemonic(phrase, wordlist) &&
          Object.fromEntries(
            Object.entries(nsp.parseSeedPhrase(phrase)).filter(([k]) => ['secretKey', 'publicKey'].includes(k)),
          )));
  if (updated && (now = Date.now()) - epoch5s > 5000) {
    // do this at every 5second interval
    [updated, epoch5s, lastTracked] = [0, now, index];
    if (shouldCache) fs.writeFileSync(cacheFile, JSON.stringify(state));
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
    let status = `${spinner} [${bar}\x1b[0m] ${progress}% (${kps} k/s) (${pms(
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
