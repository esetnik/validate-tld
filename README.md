# validate-tld
A lightweight node module for validating whether is a provided string is an IANA recognized top level domain

### Installation

```
npm install --save validate-tld
```

### Usage
```js
const ValidateTLD = require('validate-tld')({cacheTTL: 60});
const valid = await ValidateTLD.validate('com'); // true
```
