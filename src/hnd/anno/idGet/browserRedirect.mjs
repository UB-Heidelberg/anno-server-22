// -*- coding: utf-8, tab-width: 2 -*-

import makeDictList from 'dictlist-util-pmb';

import httpErrors from '../../../httpErrors.mjs';


const {
  fubar,
} = httpErrors.throwable;


function orf(x) { return x || false; }

function slot(val) {
  return function expectSlotValue(m) {
    if (val) { return val; }
    throw new Error('No data for redirect URL slot ' + m);
  };
}


const EX = {

  defaultRedirectUrlTemplate: '%sc',
  defaultMultiSubjRedirectUrlTemplate: '', // i.e. same as for single subject

  fmtUrl(found, ctx) {
    const urlPubMeta = found.primarySubjectUrlMeta(ctx.req).publicMeta;
    if (!urlPubMeta) {
      throw fubar('No public URL metadata for primary subject target');
    }

    const anno = orf(found.annoDetails);
    const multiSubj = (found.countSubjectTargets() >= 2);

    const svcId = urlPubMeta.serviceId;
    const svcCfg = svcId && ctx.srv.services.get(svcId);
    if (!svcCfg) {
      throw new Error('Failed to lookup service config for ' + svcId);
    }

    const useMultiSubjUrlTemplate = (multiSubj && (
      svcCfg.multiSubjAnnoBrowserRedirect
      || EX.defaultMultiSubjRedirectUrlTemplate));
    let url = (useMultiSubjUrlTemplate
      || svcCfg.annoBrowserRedirect
      || EX.defaultRedirectUrlTemplate);

    url = url.replace(/%sv/g, svcId);
    url = url.replace(/%su/g, urlPubMeta.serviceUrlPrefix);

    url = url.replace(/%bi/g, ctx.idParts.baseId);
    url = url.replace(/%vi/g, ctx.idParts.versId);
    url = url.replace(/%vn/g, ctx.idParts.versNum);

    const subjUrl = found.primarySubjectTargetUrl();
    const scopes = makeDictList(anno.target).getEachOwnProp('scope');
    url = url.replace(/%sc/g, slot(scopes[0] || subjUrl));
    url = url.replace(/%st/g, slot(subjUrl));

    return url;
  },

};

export default EX;
