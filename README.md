# kairos

Bruteforce a NEAR seed phrase from a couple of guesses.

> *Named after the greek god Caerus- <https://en.wikipedia.org/wiki/Caerus>*

## How to run?

Start by installing Node.js - <https://nodejs.org/en/download>.

Then run the following commands:

```console
git clone https://github.com/miraclx/kairos.git
cd kairos
npm install

# edit the inputs.js file to use custom keys and guesses.

node kairos.js

# now wait for the magic.
```

## Why?

Context: <https://twitter.com/SecretSkellies/status/1508859798116257793>

Everyday for 12 days, a clue for a word in the seedphrase for the `puzzlemaster.near` account is released.
From that one clue, you can have multiple guesses. Stringing together the right set of guesses gives you a valid seed phrase.

## How it works?

Using the content of the [`inputs.js`](inputs.js) file, kairos would;

- filter out valid BIP39 words. See <https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt>
- permute through all the arrangements of the words.
- for each permutation, check if the seedphrase is valid. See <https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#generating-the-mnemonic>
- if the seedphrase is valid, convert it to a secret key.
- check if the public key derived from the secret key matches one of the expected keys.

## Resume?

While kairos runs, it atomically dumps it's state to a cache file - `.cache.json` that includes information about all the permutations that have been tried to avoid having to retry them on subsequent runs.

It's worth noting that, due to the nature of this behaviour, the cache file grows infinitely.

- To disable writing a cache file, use the `--no-cache` CLI flag.
- To disable reading the cache file, use the `--fresh` CLI flag.
