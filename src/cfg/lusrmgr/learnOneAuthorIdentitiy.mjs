// -*- coding: utf-8, tab-width: 2 -*-

import uuidv5 from 'uuidv5';

import validateAuthorIdKey from './authorIdKeys.validate.mjs';


const EX = function learnOneAuthorIdentitiy(ctx, aidKey, origSpec) {
  if (!origSpec) { return; }
  const agent = ctx.mergeInheritedFragments(origSpec);
  let agentId = agent.id;
  if (agent.email === '^') { agent.email = agentId; }
  if (!agentId) {
    agentId = aidKey;
    const vali = validateAuthorIdKey.expectValid(agentId);
    if (!vali.mightBeUrl) {
      const profileUrl = ctx.mgr.authorAgentUuidBaseUrl + encodeURI(agentId);
      agentId = 'urn:uuid:' + uuidv5('url', profileUrl);
    }
    agent.id = agentId; // eslint-disable-line no-param-reassign
  }

  const auIds = ctx.userDetails.authorIdentities;
  auIds.set(aidKey, agent);
  const dupe = auIds.byAgentId.get(agent.id);
  if (dupe) {
    console.error('Conflicting previous author identity:', dupe);
    throw new Error('Duplicate agent ID: ' + agentId);
  }
  auIds.byAgentId.set(agent.id, agent);
};


export default EX;
