import getOwn from 'getown';
import objPop from 'objpop';

import httpErrors from '../../../httpErrors.mjs';
import sendFinalTextResponse from '../../../finalTextResponse.mjs';

import fmtAnnoCollection from '../fmtAnnosAsSinglePageCollection.mjs';
import fmtAnnosAsIiif3 from '../fmtAnnosAsIiif3.mjs';
import fmtAnnosAsRssFeed from '../fmtAnnosAsRssFeed.mjs';


const outFmtUnsupported = httpErrors.notImpl.explain(
  'Requested output format is not currently supported.').throwable;


function orf(x) { return x || false; }


const EX = async function fmtColl(ctx, rawSearchResults) {
  if (EX.maybeDebugSqlInstead(ctx, rawSearchResults)) { return; }
  const { meta } = rawSearchResults;
  const popMeta = objPop.d(meta);
  const extraTopFields = popMeta('extraTopFields') || {};

  let note = (extraTopFields['skos:note'] || '');
  if (note) { note += '\n'; }
  note += String(popMeta('stopwatchDurations'));
  extraTopFields['skos:note'] = note;

  const fmtHnd = getOwn(EX.outFmtHandlers, meta.outFmtMain || '');
  if (!fmtHnd) { throw outFmtUnsupported(); }
  const annos = rawSearchResults.toFullAnnos();
  annos.getRawSearchResults = Object.bind(null, rawSearchResults);
  return fmtHnd({ ...ctx, annos, extraTopFields });
};


Object.assign(EX, {

  maybeDebugSqlInstead(ctx, rawSearchResults) {
    const { debugSql } = rawSearchResults.meta;
    if (!debugSql) { return false; }
    const info = orf(rawSearchResults.sqlDebugInfo); /*
      ^-- This will be empty unless the proper server debug flags are set. */
    let args = JSON.stringify(orf(info.args), null, 2);
    args = args.replace(/\n\s*/g, ' ');
    const report = (String(info.query || '') + ' -- args: ' + args + '\n');
    sendFinalTextResponse(ctx.req, { text: report, type: 'plain' });
    return true;
  },


  defaultRssOpt: { feedTitle: 'Search' },


  outFmtHandlers: {
    '': fmtAnnoCollection.replyToRequest,
    count: fmtAnnoCollection.replyToRequest,
    iiif3: fmtAnnosAsIiif3.replyToRequest,
    rss(how) { return fmtAnnosAsRssFeed({ ...EX.defaultRssOpt, ...how }); },
  },


});


export default EX;
