// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be';
import sortedJson from 'safe-sortedjson';

import httpErrors from '../httpErrors.mjs';

import aclSubChain from './chainConditions/aclSubChain.mjs';
import detectUserIdentity from './detectUserIdentity.mjs';


const EX = async function whyDeny(req, initMeta) {
  const acl = this;

  const allMeta = { ...initMeta };
  const mustMeta = mustBe.tProp('ACL metadata property ', allMeta);

  const userIdentityMeta = await detectUserIdentity(req);
  const tgtUrl = mustMeta('nonEmpty str', 'targetUrl');
  const urlMeta = req.getSrv().services.findMetadataByTargetUrl(tgtUrl);

  const pubMeta = {
    // ACL metadata that is ok to be "public" in the sense that it
    // may be sent to the client as part of explanation.
    userId: (userIdentityMeta.userId || ''),
    urlMeta,
  };
  Object.assign(allMeta, pubMeta);

  const chainCtx = {
    getAcl() { return acl; },
    getReq() { return req; },
    pubMeta,
    allMeta,
    mustMeta,
    chainNamesStack: [],
    state: {
      tendencies: {
        '*': 'deny',
      },
      decision: null,
    },
  };
  req.logCkp('ACL meta before', allMeta);
  await aclSubChain(chainCtx, 'main');
  req.logCkp('ACL state after', chainCtx.state);
  const { decision } = chainCtx.state;

  if (decision === 'allow') {
    // req.logCkp('D: ACL: allow.');
    return false; // no reason to deny
  }

  if (decision !== 'deny') {
    req.logCkp('E: ACL: invalid decision!', { decision });
  }

  const denyMsg = ('Lacking permission ' + allMeta.privilegeName
    + ' on ' + sortedJson(pubMeta, { mergeNlWsp: true }));
  const errDeny = httpErrors.aclDeny.explain(denyMsg).throwable();
  return errDeny;
};


export default EX;
