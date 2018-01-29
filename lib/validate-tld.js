const httpsPromise = require('https-promise');
const debug = require('debug')('validate-tld');
const fs = require('fs');
const util = require('util');
const path = require('path');

const cache = require('./util/cache');

const readFile = util.promisify(fs.readFile);

const CACHE_KEY = 'tlds';
const MAX_TRIES = 3;
const TLD_LIST_SOURCE = 'https://data.iana.org/TLD/tlds-alpha-by-domain.txt';

class ValidateTLD {
  constructor(options) {
    this.options = options || {};
  }

  async getTLDs(forceRefresh) {
    const { cacheTTL } = this.options;
    const { get } = httpsPromise;

    let data = await cache.get(CACHE_KEY);
    if (data && forceRefresh) {
      debug('returning cached list of tlds');
      return data;
    }

    let response = null;
    let tries = 0;
    while (tries < MAX_TRIES) {
      try {
        debug('loading list of tlds from iana');
        // eslint-disable-next-line no-await-in-loop
        response = await get(TLD_LIST_SOURCE);
        break;
      } catch (err) {
        tries += 1;
        debug(`failed to download list of tlds from iana with error '${err.message}', retry ${tries}/${MAX_TRIES}`);
      }
    }

    if (!response) {
      debug('falling back to local list of tlds since they were not able to be loaded from the remote server');
      response = await readFile(path.join(__dirname, 'tlds-alpha-by-domain.txt'), 'UTF-8');
    }

    data = response
      .trim()
      .split('\n')
      .filter(tld => !!tld && !tld.startsWith('#'));

    await cache.set(CACHE_KEY, data, { ttl: cacheTTL || 86400 });

    return data;
  }

  async validate(tld, forceRefresh) {
    const tlds = await this.getTLDs(forceRefresh);
    return tlds.indexOf(tld.toUpperCase()) > 0;
  }
}

module.exports = ValidateTLD;
