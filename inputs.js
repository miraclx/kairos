let wordlistLanguage = 'english';

let expectedPublicKeys = [
  // these are the two FullAccess keys on the puzzlemaster.near
  // account as at block hash AUuoUf2hZBWoxGF7bDuPzuyM88NHSEEr63sKgUQoHMLz
  // --
  'ed25519:43oLtgANKwkXnyEGuCb1McGZoAydJQ56ykXcx6wDnCnK',
  'ed25519:BTyLuYU4GzZEEN6wDPv3m1p14wLxhwnNFcymqrzNZrib',
];

let guesses = [
  [
    // DAY 1
    'drink',
    'glass',
    'soda',
    'alcohol',
  ],
  [
    // DAY 2
    'basket',
    'bread',
    'cream',
  ],
  [
    // DAY 3
    'open',
    'salon',
    'hair',
    'beauty',
  ],
  [
    // DAY 4
    'mountain',
    'snow',
    'cloud',
  ],
  [
    // DAY 5
    'sand',
    'beach',
    'hold',
    'crisp',
  ],
  [
    // DAY 6
    'beyond',
    'six',
    'eight',
  ],
  [
    // DAY 7
    'fragile',
    'empty',
    'entry',
    'guard',
  ],
  [
    // DAY 8
    'project',
    'near',
    'ask',
    'auction',
  ],
  [
    // DAY 9
    'attack',
    'energy',
    'fire',
    'mule',
  ],
  [
    // DAY 10
    'grass',
    'whip',
    'trim',
    'man',
    'blur',
  ],
  [
    // DAY 11
    'trophy',
    'gold',
    'victory',
    'medal',
    'icon',
  ],
  [
    // DAY 12
    'secret',
    'skeleton',
    'build',
  ],
];

module.exports = {
  guesses,
  wordlistLanguage,
  expectedPublicKeys,
};
