// -*- coding: utf-8, tab-width: 2 -*-

import httpErrors from '../../httpErrors.mjs';

const deny = httpErrors.badVerb.explain(
  'Bulk-downloading all annotations is disabled by policy.'
  + ' Use /anno/by/ to search more specifically.');

const EX = function emptyIdGet(srv, req) {
  return deny(req);
};


export default EX;
