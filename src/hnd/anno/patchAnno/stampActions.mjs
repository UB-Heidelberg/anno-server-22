// -*- coding: utf-8, tab-width: 2 -*-

import getOwn from 'getown';

import decideAuthorIdentity from '../postNewAnno/decideAuthorIdentity.mjs';
import httpErrors from '../../../httpErrors.mjs';
import parseDatePropOrFubar from '../../util/parseDatePropOrFubar.mjs';

import approvalDecisionSideEffects from './approvalDecisionSideEffects.mjs';


const {
  notImpl,
  stateConflict,
} = httpErrors.throwable;


const doNothing = Boolean;

function orf(x) { return x || false; }

function popEffTs(pop) {
  let eff = pop('str | undef', 'when');
  eff = (eff && parseDatePropOrFubar(eff).jsDate);
  return (eff && { st_effts: eff });
}


const stampNamespaceRgx = /^\w+(?=:)/;
// ^- This check is intentionally kept rather lenient, including accepting
//    U+005F low line (_) at the start and end. There is no need to be
//    strict here, because that responsibility lies with the ACL.


const EX = {

  dupeStamp() { throw stateConflict('A stamp of this type already exists'); },


  async add_stamp(ctx) {
    const stRec = {
      base_id: ctx.idParts.baseId,
      version_num: ctx.idParts.versNum,
      st_effts: null,
      st_detail: null,
    };
    let uscType;
    await ctx.catchBadInput(function parse(mustPopInput) {
      stRec.st_type = mustPopInput('nonEmpty str', 'type');
      const namespace = orf(stampNamespaceRgx.exec(stRec.st_type))[0];
      if (!namespace) { throw notImpl('Unsupported stamp namespace'); }
      uscType = namespace + '_' + stRec.st_type.slice(namespace.length + 1);
      const popMore = getOwn(EX.addStampParseDetails, uscType);
      if (popMore) { Object.assign(stRec, popMore(mustPopInput)); }
      mustPopInput.expectEmpty();
    });
    const author = decideAuthorIdentity.fromAnnoCreator(ctx.annoDetails,
      ctx.who);

    const privName = ('stamp_' + (author.authorized ? 'own' : 'any')
      + '_add_' + uscType);
    await ctx.requireAdditionalReadPrivilege(privName);
    stRec.st_by = (ctx.who.userId || '');
    stRec.st_at = (new Date()).toISOString();
    ctx.mainStampRec = stRec;

    const stampFx = orf(getOwn(EX.stampFx, stRec.st_type));
    await (stampFx.prepareAdd || doNothing)(ctx);

    ctx.hadDupeError = false;
    await ctx.srv.db.postgresInsertOneRecord('anno_stamps', stRec, {
      customDupeError(err) {
        ctx.hadDupeError = err;
        return 'ignore';
      },
    });

    await (stampFx.cleanupAfterAdd || doNothing)(ctx);

    if (ctx.hadDupeError) { EX.dupeStamp(); }
    return { st_at: stRec.st_at };
  },


  addStampParseDetails: {
    as_deleted: popEffTs,
  },


  stampFx: {
    'dc:dateAccepted': approvalDecisionSideEffects,
  },


};



export default EX;
