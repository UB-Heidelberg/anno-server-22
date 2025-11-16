// -*- coding: utf-8, tab-width: 2 -*-

const spyCopyMetaOpt = 'copyUndisputedTruthyMetaDataFields';
const spyCopyMetaFields = {
  approvalRequiredBy: undefined,
};


const EX = async function checkServiceConfigStuff(ctx) {
  const papn = ctx.postActionPrivName;
  const servicesInvolved = new Set();
  const aclMetaSpy = {};
  const spyCopyMetaDest = { ...spyCopyMetaFields };
  aclMetaSpy[spyCopyMetaOpt] = spyCopyMetaDest;
  const aclOpt = { aclMetaSpy };
  aclOpt.aclMetaSpyEach = function spy(meta) {
    servicesInvolved.add(meta.serviceId);
  };

  // ===== The actual spying is about to begin ===== ===== ===== ===== =====
  await ctx.requirePermForSubjTgtUrls(papn, aclOpt);
  // ===== Done spying. ===== ===== ===== ===== ===== ===== ===== ===== =====

  if (servicesInvolved.size > 1) {
    await ctx.requirePermForSubjTgtUrls('create_across_services');
  }
  ctx.anySvcCfgFlag = flag => !!aclMetaSpy['nServicesWith:' + flag];
  // ^-- :TODO: Why does eslint allow this param reassignment?
  Object.assign(ctx, spyCopyMetaDest);
};


// Object.assign(EX, {});
export default EX;
