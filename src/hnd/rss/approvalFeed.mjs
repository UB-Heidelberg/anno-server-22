// -*- coding: utf-8, tab-width: 2 -*-

import latestFeedHnd from './latestAnnosFeed.mjs';


const EX = async function approvalFeedHnd(origHow) {
  const how = origHow; // Our caller already made a flat copy.
  console.debug('approvalFeedHnd:', Object.keys(how));
  how.overrideSearchTmpl = {
    visibilityWhere: '#visibilityUndecided',
    orderByTimeDirection: 'ASC', // first come = first served
  };
  return latestFeedHnd(how);
};


export default EX;
