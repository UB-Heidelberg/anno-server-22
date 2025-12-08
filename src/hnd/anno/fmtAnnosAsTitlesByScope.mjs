// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';
import mustBe from 'typechecks-pmb/must-be.js';

import sendFinalTextResponse from '../../finalTextResponse.mjs';


const sorted = false;


const EX = function fmtAnnosAsSinglePageCollection(how) {
  const {
    annos,
    extraTopFields,
    ...unexpected
  } = how;
  delete unexpected.untrustedOpt;
  mustBe.keyless('Unexpected options', unexpected);
  mustBe.ary('Annotations list', annos);
  const { subjTgtUrlsByResultIndex } = annos.meta || false;
  if (!subjTgtUrlsByResultIndex) {
    throw new Error('Results metadata lacks subjTgtUrlsByResultIndex.');
  }
  const reply = {
    '': { nAnnosTotal: annos.length, sorted },
  };
  annos.forEach(function readOneAnno(anno, idx) {
    const title = anno['dc:title'];
    if ((title && typeof title) !== 'string') { return; }
    const url = (subjTgtUrlsByResultIndex[idx] || false)[0];
    mustBe.nest('PST URL #' + idx, url);
    const list = getOwn(reply, url) || [];
    if (list.length) {
      if (list.includes(title)) { return; }
    } else {
      reply[url] = list;
    }
    list.push(title);
  });
  return reply;
};


function replyToRequest(origHow) {
  const { srv, req, ...how } = origHow;
  return sendFinalTextResponse.json(req, EX(how), EX.jsonReplyOpt);
}


Object.assign(EX, {
  replyToRequest,
  jsonReplyOpt: { sorted },
});


export default EX;
