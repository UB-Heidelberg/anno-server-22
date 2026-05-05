// -*- coding: utf-8, tab-width: 2 -*-

import clientPrefersHtml from '../../util/guessClientPrefersHtml.mjs';
import fmtIanaHeaders from '../fmtIanaHeaders.mjs';
import genericAnnoMeta from '../redundantGenericAnnoMeta.mjs';
import httpErrors from '../../../httpErrors.mjs';
import sendFinalTextResponse from '../../../finalTextResponse.mjs';

import browserRedirect from './browserRedirect.mjs';
import lookupExactVersion from './lookupExactVersion.mjs';

const {
  badVerb,
} = httpErrors.throwable;


const EX = async function serveExactVersion(ctx) {
  const found = await lookupExactVersion(ctx);
  const { srv, req, idParts } = ctx;
  const headers = fmtIanaHeaders.onlyPrefixed(found.annoDetails);
  const ftrOpt = { type: 'annoLD', headers };

  const { accept } = req.headers;
  const debugOpt = req.untrustedDebugOpt();
  const wantText = ((accept || '').startsWith('text/plain,')
    || debugOpt.text);
  if (wantText) { ftrOpt.type = 'plain'; }

  if (req.method === 'HEAD') { return sendFinalTextResponse(req, '', ftrOpt); }
  if (req.method !== 'GET') { throw badVerb(); }

  const reply = genericAnnoMeta.add(srv, idParts, found.annoDetails);

  const ianaAltn = [];
  const htmlUrl = browserRedirect.fmtUrl(found, ctx);
  if (htmlUrl) {
    ianaAltn.push({ href: htmlUrl, mediaType: 'text/html' });
    const redirToHtml = ((debugOpt.redirToHtml || clientPrefersHtml(req))
      && (!debugOpt.noredir));
    if (redirToHtml) {
      ftrOpt.redirTo = htmlUrl; /*
      We do not use req.res.redirect() because it would send a generic
      HTML body with a fallback link to the redirect URL, whereas the
      FTR redirTo allows us to still send the annotation data.
      This way, annotations are still easy to debug in browsers that
      support manual approval of redirects. */
    }
  }
  if (ianaAltn.length) {
    reply['iana:alternate'] = ianaAltn.map(
      a => ({ type: 'as:Link', rel: ['alternate'], ...a }));
  }

  return sendFinalTextResponse.json(req, reply, ftrOpt);
};


export default EX;
