// -*- coding: utf-8, tab-width: 2 -*-

import rules from './authorIdKeys.rules.mjs';


function checkMightBeUrl(x) { return /^\w+:/.test(x || ''); }


const EX = {

  whyBad(aidKey) {
    const s = String(aidKey);
    if (s !== aidKey) { return { bad: 'not a string' }; }

    const ok = { ok: true };
    ok.mightBeUrl = checkMightBeUrl(s);
    if (ok.mightBeUrl) { return ok; }

    const m = rules.acceptableNonUrlKeyIdRgx.exec(aidKey);
    if ((m && m[0]) !== s) { return { bad: 'character rules' }; }

    return ok;
  },


  expectValid(aidKey) {
    const vali = EX.whyBad(aidKey);
    if (vali.ok) { return vali; }
    throw new Error('Invalid author ID key: ' + vali.bad);
  },

};


export default EX;
