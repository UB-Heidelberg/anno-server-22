// -*- coding: utf-8, tab-width: 2 -*-

import fmtColl from '../anno/searchBy/fmtColl.mjs';
import multiSearch from '../anno/searchBy/multiSearch.mjs';


const EX = async function latestAnnosFeed(how) {
  const {
    feedTitle,
    linkTpl,
    overrideSearchData,
    overrideSearchTmpl,
    prefix,
    req,
    srv,
    staticMeta,
    untrustedOpt,
  } = how;

  const found = await multiSearch({
    srv,
    req,
    subjTgtSpec: prefix + (req.query.subj || '*'),
    overrideSearchData,
    overrideSearchTmpl,
    latestVersionOnly: true,
    readContent: 'justTitles',
    outFmt: 'rss',
    untrustedOpt,
  });
  if (staticMeta) { Object.assign(found.meta, staticMeta); }
  return fmtColl({ req, srv, feedTitle, linkTpl }, found);
};


Object.assign(EX, {

  withForcedPresets(presets) {
    return function presetFeed(how) { return EX({ ...how, ...presets }); };
  },

  withVisibility(visibilityWhere) {
    return EX.withForcedPresets({ overrideSearchTmpl: { visibilityWhere } });
  },



});


export default EX;
