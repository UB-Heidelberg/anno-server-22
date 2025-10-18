// -*- coding: utf-8, tab-width: 2 -*-

import crObAss from 'create-object-and-assign';
import getOrAddKey from 'getoraddkey-simple';
import loMapValues from 'lodash.mapvalues';
import mustBe from 'typechecks-pmb/must-be.js';


import detectUserIdentity from './detectUserIdentity.mjs';


const EX = {

  byCacheKey(req, key) {
    const metaCache = getOrAddKey(req, 'aclMetaCache', '{}');
    return getOrAddKey(metaCache, key, EX.makeEmptyMetaCacheEntry);
  },


  async byTargetUrl(req, tgtUrl) {
    mustBe.nest('Target URL', tgtUrl);
    const cacheEntry = EX.byCacheKey(req, 'tgtUrl:' + tgtUrl);
    if (!cacheEntry.publicMeta.serviceId) {
      const svcMgr = req.getSrv().services;
      await svcMgr.determineMetadataByTargetUrl(cacheEntry, tgtUrl);
    }
    return cacheEntry;
  },


  async userInfo(req) {
    const cacheEntry = EX.byCacheKey(req, 'user:');
    if (cacheEntry.publicMeta.userId === undefined) {
      const who = await detectUserIdentity(req);
      cacheEntry.publicMeta.userId = (who.userId || '');
    }
    return cacheEntry;
  },


  makeEmptyMetaCacheEntry() {
    const cacheEntry = crObAss(EX.metaDataCacheEntryApi, {
      publicMeta: {}, /*
        public = may safely be disclosed to clients, because anyone could
        infer it from the URL anyways.
        */
      internalMeta: {}, /*
        Additional info that we have on the server but is not obvious
        from the URL, and thus shoud be kept secret.
        */
    });
    return cacheEntry;
  },


  metaDataCacheEntryApi: { /*
    Common API for metadata lookup results, independent of how you
    specify the topic. */

    allMeta() { /*
      This function cannot easily be replaced by a generic merge function
      because it has to observe priority of contradicting homonymous keys:
      Secret internal facts may override an educated guess that an outside
      observer would have infered from the URL, while publicMeta must still
      preserve what was conveyed by the URL.
      (Yes this means error messages may need to lie by showing the publicMeta
      values, or at most replace them with a placeholder like "(overridden)".)
      */
      const cacheEntry = this;
      if (!cacheEntry) { return false; }
      return { ...cacheEntry.publicMeta, ...cacheEntry.internalMeta };
    },

  },


  combineEntries(...entries) {
    const merged = EX.makeEmptyMetaCacheEntry();
    loMapValues(merged, function eachVisibilityGroup(vgDest, vgName) {
      entries.forEach(function add(entry, idx) {
        if (!entry) { return; }
        Object.assign(vgDest, mustBe.tProp('[Cache entry #' + idx + '].',
          entry, 'dictObj', vgName));
      });
    });
    return merged;
  },





};


export default EX;
