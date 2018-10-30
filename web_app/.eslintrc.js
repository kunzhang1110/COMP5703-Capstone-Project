module.exports = {
  "parser": 'babel-eslint',
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true,
    "jquery": true
  },
  "extends": ["eslint:recommended",],
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
    },
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": [
      "warn",
      {
        "varsIgnorePattern": "should|expect"
      }
    ],
    "indent": ["warn", 2],
    "linebreak-style": ["warn","unix"],
    "quotes": ["warn","single"],
    "semi": ["warn","always"],
    "no-console": ["warn", { "allow": ["info", "error"] }]
  }
};
