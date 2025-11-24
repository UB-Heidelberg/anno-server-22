import getOwn from 'getown';
import qrystr from 'qrystr';
import splitStringOnce from 'split-string-or-buffer-once-pmb';

import httpErrors from '../../../httpErrors.mjs';

import fmtColl from './fmtColl.mjs';
import multiSearch from './multiSearch.mjs';


const unsupportedCriterion = httpErrors.notImpl.explain(
  'Search criterion not implemented.').throwable;
const missingCriterionParam = httpErrors.noSuchResource.explain(
  'Search criterion requires a parameter.').throwable;


function apacheSlashes(sub) {
  let url = sub.join('/');

  // Some reverse proxies like our Apache normalize double slashes,
  // mangling the URL. We could document how to configure them properly,
  // … or we can just cheat-fix it:
  url = url.replace(/^(\w+:\/)(?!\/)/, '$1/');

  return url;
}


const EX = async function searchBy(pathParts, req, srv) {
  const [critSpec, ...subPathParts] = pathParts;
  const [criterion, query] = (splitStringOnce(';', critSpec) || [critSpec]);
  const searchHnd = getOwn(EX.searchHandlers, criterion);
  if (!searchHnd) { throw unsupportedCriterion(); }
  const untrustedOpt = (Boolean(query)
    && qrystr.parse(query.replace(/;/g, '&')));
  return searchHnd({ req, srv, untrustedOpt }, subPathParts);
};


function makeSubPathUrlSearch(pathKey, customOpt) {
  const opt = {
    latestVersionOnly: true,
    readContent: 'full',
    rssMaxItems: -1,
    ...customOpt,
  };
  const f = async function subPathUrlSearch(ctx, subPathParts) {
    const sub = apacheSlashes(subPathParts);
    if (!sub) { throw missingCriterionParam(); }
    const found = await multiSearch({ ...ctx, ...opt, [pathKey]: sub });
    return fmtColl(ctx, found);
  };
  Object.assign(f, { pathKey });
  return f;
}


Object.assign(EX, {

  searchHandlers: {
    has_stamp: makeSubPathUrlSearch('searchAllWithStamp'),
    subject_target: makeSubPathUrlSearch('subjTgtSpec'),
  },


});


export default EX;
