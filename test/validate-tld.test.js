const chai = require('chai');
const httpsPromise = require('https-promise');
const sinon = require('sinon');

const { stub } = sinon;
chai.should();

const ValidateTLD = require('../lib/validate-tld');
const cache = require('../lib/util/cache');

describe('#validate()', () => {
  let validateTLD = null;
  beforeEach(async () => {
    await cache.del('tlds');
    validateTLD = new ValidateTLD();
    return true;
  });

  it('should return true when tld is com', async () => {
    const valid = await validateTLD.validate('com');
    valid.should.equal(true);
  });

  it('should cache the list of tlds', async () => {
    await validateTLD.validate('com');
    const valid = await validateTLD.validate('com');
    valid.should.equal(true);
  });

  it('should return true when tld is capitalized', async () => {
    const valid = await validateTLD.validate('COM');
    valid.should.equal(true);
  });

  it('should return true when tld is mixed case', async () => {
    const valid = await validateTLD.validate('cOm');
    valid.should.equal(true);
  });

  it('should return false when tld is invalid', async () => {
    const valid = await validateTLD.validate('test');
    valid.should.equal(false);
  });

  it('should fallback to local file when list of tlds cannot be loaded', async () => {
    stub(httpsPromise, 'get').throws(new Error('test network error'));
    const valid = await validateTLD.validate('COM');
    valid.should.equal(true);
    httpsPromise.get.restore();
  });
});
