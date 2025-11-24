import regexpFlagsUpfront from 'regexp-flags-upfront';

import httpErrors from '../../httpErrors.mjs';

import latestFeedHnd from './latestAnnosFeed.mjs';

const {
  genericDeny,
} = httpErrors.throwable;


const EX = async function approvalFeedHnd(origHow) {
  const how = origHow; // Our caller already made a flat copy.

  const sTmpl = {
    visibilityWhere: '#visibilityUndecided',
    orderByTimeDirection: 'ASC', // first come = first served
  };
  how.overrideSearchTmpl = sTmpl;
  const sData = {};
  how.overrideSearchData = sData;

  let dfTitle = 'Annos waiting for approval';
  (function forApprovalBy() {
    const fab = 'forApprovalBy';
    const q = (how.popUntrustedOpt(fab) || how[fab + 'Default'] || '');
    const rx = how[fab + 'RegExp'];
    if (rx) {
      const m = regexpFlagsUpfront(rx).exec(q) || false;
      if (!m) { throw genericDeny('Bad value in parameter ' + fab); }
    }
    if (!q) { return; }
    dfTitle += ' by ' + q;
    const j = fab + 'Json';
    const c = 'unapproval.st_detail::text = $' + j;
    sTmpl.forApprovalByCond = c; // <- using literal dot notation as grep bait
    sData[j] = JSON.stringify({ q });
  }());
  if (!how.feedTitle) { how.feedTitle = dfTitle; }

  return latestFeedHnd(how);
};


export default EX;
