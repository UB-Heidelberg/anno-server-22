// -*- coding: utf-8, tab-width: 2 -*-

import miscMetaFieldInfos from '../miscMetaFieldInfos.mjs';


function orf(x) { return x || false; }


function addStampRec(accum, stDefaults, stType, stOverrides) {
  accum.push({ ...stDefaults, st_type: stType, ...orf(stOverrides) });
}


const EX = async function decideStamps(ctx) {
  const {
    anno,
    annoUserId,
    anySvcCfgFlag,
    dbAddr,
    oldAnnoDetails,
  } = ctx;
  const stampRecs = [];
  stampRecs.add = addStampRec.bind(null, stampRecs, {
    ...dbAddr,
    st_at: anno.created,
    st_by: annoUserId,
    st_effts: null,
    st_detail: null,
  });

  const mfi = miscMetaFieldInfos;
  const needsApproval = anySvcCfgFlag('approvalRequired');
  if (needsApproval) { stampRecs.add(mfi.unapprovedStampName); }

  const old = orf(oldAnnoDetails);
  if (old[mfi.doiStampName]) {
    if (anySvcCfgFlag('autoRequestNextVersionDoi')) {
      stampRecs.add(mfi.doiRequestStampName);
    }
  }

  return stampRecs;
};


// Object.assign(EX, {});
export default EX;
