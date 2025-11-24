// -*- coding: utf-8, tab-width: 2 -*-
//
//  The "bearer" RSS feed uses a bearer token as the only authentification,
//  submitted as the "key" query parameter.


import bcrypt from 'bcryptjs';
import mapValues from 'lodash.mapvalues';
import mustLookupProp from 'must-lookup-prop-in-dict-pmb';
import objPop from 'objpop';

import httpErrors from '../../httpErrors.mjs';

import latestFeedHnd from './latestAnnosFeed.mjs';


const {
  genericDeny,
  noSuchResource,
} = httpErrors.throwable;


const EX = async function makeBearerRssHandler(srv) {
  const hnd = async function serveBearerRss(req) {
    const feedId = req.url.split('?')[0].replace(/^\//, '');
    if (!feedId) { throw noSuchResource(); }

    req.confirmCors();
    if (req.method === 'OPTIONS') { return; }

    const feedCfg = srv.rssFeeds.byFeedId.get(feedId);
    if (!feedCfg) { throw noSuchResource(); }
    const typeImpl = mustLookupProp(null, feedCfg, EX.feedTypes, 'type');
    // ^- Check for config error before checking key: Allows for automated
    //    health checks without having to provide the key.

    const untrustedOpt = { ...req.query };
    const popUntrustedOpt = objPop.d(untrustedOpt, {
      leftoversErrCls: noSuchResource,
      leftoversMsg: 'Unsupported criterion qualifier',
    });
    await EX.verifyFeedKey(feedCfg, popUntrustedOpt('key'));
    mapValues(untrustedOpt, (v, k) => (v || delete untrustedOpt[k]));
    const feedCtx = {
      ...feedCfg,
      req,
      srv,
      popUntrustedOpt,
      untrustedOpt,
    };
    return typeImpl(feedCtx);
  };

  return hnd;
};



Object.assign(EX, {

  async verifyFeedKey(feedCfg, keyGiven) {
    const { keyHash } = feedCfg;
    const algoImpl = mustLookupProp(null, feedCfg, EX.keyAlgos, 'keyAlgo');
    if (!keyHash) { throw genericDeny('No hash configured.'); }
    if (!keyGiven) { throw genericDeny('No key given.'); }
    const correct = await algoImpl(keyHash, keyGiven, feedCfg);
    if (!correct) { throw genericDeny('Wrong key.'); }
  },


});


EX.keyAlgos = {
  async bcrypt(hash, key) { return bcrypt.compare(key, hash); },
};


EX.feedTypes = {
  latest: latestFeedHnd,

  approval: latestFeedHnd.withForcedPresets({
    overrideSearchTmpl: {
      visibilityWhere: '#visibilityUndecided',
      orderByTimeDirection: 'ASC', // first come = first served
    },
  }),
};




export default EX;
