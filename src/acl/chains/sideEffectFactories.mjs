// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import mustBe from 'typechecks-pmb/must-be.js';
import objDive from 'objdive';

import metaSlotTemplate from './metaSlotTemplate.mjs';


const EX = {

  debugDumpMeta(how) {
    return function debugDumpMeta(chainCtx) {
      console.debug(how.ruleTraceDescr, 'allMeta:', chainCtx.allMeta);
    };
  },


  debugTrace(how) {
    const { popSpecProp, ruleTraceDescr } = how;
    const msg = popSpecProp('nonEmpty str | undef', 'msg');
    return function debugTrace() {
      console.debug(ruleTraceDescr, msg);
    };
  },


  setMetaFromCustomDataDict(how) {
    const { popSpecProp, acl } = how;
    const dict = objDive(acl.initTmp.cfg.customData,
      popSpecProp('nonEmpty str', 'dict'));

    let searchFor = popSpecProp('nonEmpty str | nonEmpty ary', 'searchFor');
    searchFor = [].concat(searchFor).map(mustBe('nonEmpty str',
      'Key template for setMetaFromCustomDataDict option "searchFor"'));
    searchFor = searchFor.map(metaSlotTemplate.compile);

    const debugTrace = popSpecProp('nonEmpty str | undef', 'debugTrace');
    const notFound = popSpecProp('any', 'notFound');
    const setSlot = popSpecProp('nonEmpty str | nul', 'setSlot');
    const pub = popSpecProp('bool | undef', 'public');

    return function setMetaFromCustomDataDict(chainCtx) {
      let key;
      let data;
      searchFor.every(function lookupOneKey(mold) {
        key = mold(chainCtx);
        data = getOwn(dict, key);
        if (debugTrace) {
          console.debug('setMetaFromCustomDataDict', debugTrace,
            { mold: mold.origSpec, key, data });
        }
        return (data === undefined); // whether to try the next key mold.
      });
      if (data === undefined) { data = notFound; }
      if (data === undefined) { return; }
      const { allMeta, pubMeta } = chainCtx;
      if (setSlot === null) {
        Object.assign(allMeta, data);
        if (pub) { Object.assign(pubMeta, data); }
      } else {
        allMeta[setSlot] = data;
        if (pub) { pubMeta[setSlot] = data; }
      }
      // console.debug(how.ruleTraceDescr, 'setMeta', { key, pub, data });
    };
  },


};


export default EX;
