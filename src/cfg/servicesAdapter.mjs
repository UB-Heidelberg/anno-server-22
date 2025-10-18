// -*- coding: utf-8, tab-width: 2 -*-

import arrayOfTruths from 'array-of-truths';
import loMapValues from 'lodash.mapvalues';
import mergeOpt from 'merge-options';

import lazyMergeTruthyPropInplace from './util/lazyMergeTruthyPropInplace.mjs';
import learnTopicDict from './learnTopicDict.mjs';
import servicesApi from './servicesApi.mjs';

const OrderedMap = Map; // to clarify where we do care.
const isNum = Number.isFinite;

function orf(x) { return x || false; }

const essentialMandatoryBool = 'bool'; /*
  This alias is just to clarify that these options are so important that
  we force users to make an explicit choice, so that we are able to detect
  when their config decision got lost by accidet. */


const EX = {

  async make(srv) {
    const svcs = new Map();
    Object.assign(svcs, servicesApi, {
      idByPrefix: new OrderedMap(),
      prefixReverseHostnameAliases: false,
    });
    const ctx = { srv, svcs, learnMeta: EX.learnServicesMeta };
    await learnTopicDict(ctx, 'services', EX.learnOneService);
    return svcs;
  },


  learnServicesMeta(ctx, mustPopCfgMeta) {
    const sd = EX.learnOneService(ctx, '', mustPopCfgMeta);
    ctx.topicDefaults = sd; // eslint-disable-line no-param-reassign
    mustPopCfgMeta.expectEmpty('Services defaults config key');
  },


  learnOneService(ctx, svcId, mustPopDetail) {
    const { svcs } = ctx;
    const det = {};
    if (svcId) {
      det.id = svcId;
      svcs.set(svcId, det);
    }

    function copy(prop, rules, dflt) {
      const v = mustPopDetail(rules, prop, dflt);
      if (v !== undefined) { det[prop] = v; }
      return v;
    }

    const tum = orf(copy('targetUrlMetadata',
      'dictObj' + (svcId ? '' : ' | undef')));
    const { prefixes } = tum;
    if (svcId) {
      arrayOfTruths(prefixes).forEach(pfx => svcs.idByPrefix.set(pfx, svcId));
    } else if (prefixes !== undefined) {
      const msg = 'Services defaults must not include URL prefixes.';
      throw new Error(msg);
    }

    lazyMergeTruthyPropInplace(svcs, 'prefixReverseHostnameAliases', tum);

    EX.learnRssFeeds(ctx, svcId, prefixes,
      copy('rssFeeds', 'dictObj | nul | undef'));
    copy('annoBrowserRedirect', 'str | nul | undef');
    copy('approvalRequired', 'bool | nul | undef');
    copy('autoRequestNextVersionDoi', essentialMandatoryBool);
    copy('staticAclMeta', 'dictObj | nul | undef');

    mustPopDetail.expectEmpty('Unsupported leftover service config keys');
    return det;
  },


  learnRssFeeds(ctx, svcId, urlPrefixes, feedsSpec) {
    // console.debug('learnRssFeeds', { svcId }, feedsSpec);
    if (!feedsSpec) { return; }
    if (!svcId) { return; }
    const feedDefaults = ctx.mergeInheritedFragments(feedsSpec['']);
    loMapValues(feedsSpec, function learnOneRssFeed(origFeedCfg, origFeedId) {
      if (!origFeedId) { return; }
      // ^-- Empty feed ID is used for defaults.
      const feedId = origFeedId.replace(/\^/g, svcId);
      // console.debug('learnOneRssFeed:', feedId, merged);
      const merged = mergeOpt({
        staticMeta: {
          serviceId: svcId,
        },
      }, feedDefaults, ctx.mergeInheritedFragments(origFeedCfg));
      const fc = ctx.srv.rssFeeds.register(feedId, merged);
      if (!fc.prefix) { fc.prefix = 1; }
      if (isNum(fc.prefix)) { fc.prefix = urlPrefixes[fc.prefix - 1]; }
      if (!fc.prefix) {
        throw new Error('Empty URL prefix for RSS feed ' + feedId);
      }
    });
  },


};


export default EX;
