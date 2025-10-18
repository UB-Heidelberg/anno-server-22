// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import mustBe from 'typechecks-pmb/must-be.js';
import sortedJson from 'safe-sortedjson';

import httpErrors from '../httpErrors.mjs';
import servicesApi from '../cfg/servicesApi.mjs';

import aclMetaCache from './aclMetaCache.mjs';
import aclSubChain from './chains/aclSubChain.mjs';


const EX = async function whyDeny(req, actionMetaAndSpecials) {
  const acl = this;
  const {
    aclMetaSpy,
    privilegeName,
    targetUrl,
    ...staticActionMeta
  } = actionMetaAndSpecials;
  const srv = req.getSrv();
  mustBe.nest('privilegeName for whyDeny call', privilegeName);

  const aclMetaCacheView = (Boolean(targetUrl)
    && await aclMetaCache.byTargetUrl(req, targetUrl));
  const userMetaCacheView = await aclMetaCache.userInfo(req);
  const combinedAclMeta = aclMetaCache.combineEntries(
    aclMetaCacheView,
    userMetaCacheView,
  );
  const allMeta = combinedAclMeta.allMeta();
  Object.assign(allMeta, staticActionMeta);
  const pubMeta = combinedAclMeta.publicMeta;
  const forcedMeta = {
    privilegeName,
    targetUrl,
  };
  Object.assign(pubMeta, forcedMeta);
  Object.assign(allMeta, forcedMeta);
  const mustMeta = mustBe.tProp('ACL metadata property ', allMeta);

  if (aclMetaSpy) {
    Object.assign(aclMetaSpy, allMeta);
    EX.metaSpySvcBoolCounters.forEach(function incr(p) {
      const k = 'nServicesWith' + (allMeta[p] ? '' : 'out') + ':' + p;
      aclMetaSpy[k] = (+aclMetaSpy[k] || 0) + 1;
    });
  }

  const chainCtx = {
    getAcl() { return acl; },
    getReq() { return req; },
    pubMeta,
    allMeta,
    mustMeta,
    chainNamesStack: [],
    state: {
      allDecisions: {},
      tendencies: { '*': 'deny' },
      decision: null,
    },
  };
  // req.logCkp('ACL meta before', allMeta);
  await aclSubChain(chainCtx, 'main');
  // req.logCkp('ACL state after', chainCtx.state);
  let { decision } = chainCtx.state;

  if ((decision === null) || (decision === 'stop')) {
    const { tendencies } = chainCtx.state;
    decision = getOwn(tendencies, privilegeName);
    if (decision === undefined) { decision = getOwn(tendencies, '*'); }
  }

  if (aclMetaSpy) {
    const all = {
      ...chainCtx.state.tendencies,
      ...chainCtx.state.allDecisions,
    };
    aclMetaSpy.allPrivilegesPreview = all;
    const byStu = aclMetaSpy.aclPreviewBySubjectTargetUrl;
    if (byStu) { byStu[targetUrl] = all; }
  }

  if (decision === 'allow') {
    // req.logCkp('D: ACL: allow.');
    return false; // no reason to deny
  }

  if (decision !== 'deny') {
    req.logCkp('E: ACL: invalid decision!', { decision });
  }

  let denyMsg = ('Lacking permission ' + privilegeName
    + ' on ' + sortedJson(pubMeta, { mergeNlWsp: true }));
  if (srv.serverDebugFlags.reportInternalAclMeta) {
    denyMsg += '\n\nAll ACL meta (including internal): ' + sortedJson(allMeta);
  }
  const errDeny = httpErrors.aclDeny.throwable(denyMsg);
  return errDeny;
};


Object.assign(EX, {

  metaSpySvcBoolCounters: [
    ...servicesApi.svcCfgFlagNames,
  ],


});


export default EX;
