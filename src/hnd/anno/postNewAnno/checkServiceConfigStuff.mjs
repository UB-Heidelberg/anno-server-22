// -*- coding: utf-8, tab-width: 2 -*-

const EX = async function checkServiceConfigStuff(ctx) {
  const papn = ctx.postActionPrivName;
  const servicesInvolved = new Set();
  const aclMetaSpy = {};
  const aclOpt = { aclMetaSpy };
  aclOpt.aclMetaSpyEach = function spy(meta) {
    servicesInvolved.add(meta.serviceId);
  };
  await ctx.requirePermForSubjTgtUrls(papn, aclOpt);
  if (servicesInvolved.size > 1) {
    await ctx.requirePermForSubjTgtUrls('create_across_services');
  }
  ctx.anySvcCfgFlag = flag => !!aclMetaSpy['nServicesWith:' + flag];
  // ^-- :TODO: Why does eslint allow this param reassignment?
};


// Object.assign(EX, {});
export default EX;
