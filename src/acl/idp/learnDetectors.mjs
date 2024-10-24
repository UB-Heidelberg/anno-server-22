// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import mustBe from 'typechecks-pmb/must-be';
import objPop from 'objpop';
import vTry from 'vtry';

import idfDebug from './idfDebug.mjs';
import idfGuestAccessOnly from './idfGuestAccessOnly.mjs';
import idfHeaders from './idfHeaders.mjs';


const EX = function learnIdentityDetectors(acl, userIdSrcCfgDict) {
  const userIdSrcOrder = Object.keys(userIdSrcCfgDict).sort();
  userIdSrcOrder.forEach(function dareLearn(userIdSrcName) {
    const details = getOwn(userIdSrcCfgDict, userIdSrcName);
    const popDetail = objPop(details, { mustBe }).mustBe;
    const ctx = { acl, userIdSrcName, popDetail };
    const detector = vTry(EX.learnOneIdSrc,
      'Configure identity source ' + userIdSrcName)(ctx);
    acl.identityDetectors.push(detector);
  });
};


Object.assign(EX, {

  configSectionName: 'identity_sources',
  expectedConfigSectionFormat: 'nonEmpty obj',

  learnOneIdSrc(ctx) {
    const { popDetail } = ctx;
    const mtd = popDetail('nonEmpty str', 'method');
    const fac = getOwn(EX.userIdSrcFactories, mtd);
    if (!fac) { throw new Error('Unsupported method: ' + mtd); }
    const detector = fac(ctx);
    popDetail.done('Unsupported config option(s) for IDP method ' + mtd);
    return detector;
  },


  firstNonEmptyHeader(req, list) {
    return (req === list);
  },


  userIdSrcFactories: {
    ...idfDebug,
    guest_access_only: idfGuestAccessOnly,
    headers: idfHeaders,
  },



});


export default EX;
