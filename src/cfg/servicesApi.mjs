// -*- coding: utf-8, tab-width: 2 -*-

import lookupRevHostInDeepDict from 'lookup-reverse-hostname-in-deep-dict';
import splitOnce from 'split-string-or-buffer-once-pmb';

import httpErrors from '../httpErrors.mjs';


function orf(x) { return x || false; }


const EX = {

  svcCfgFlagNames: [
    'approvalRequired',
    'autoRequestNextVersionDoi',
  ],


  findServiceByTargetUrl(tgtUrl, origOpt) {
    const svcs = this;
    let found;
    svcs.idByPrefix.forEach(function check(svcId, pfx) {
      if (found) { return; }
      if (!tgtUrl.startsWith(pfx)) { return; }
      const subUrl = tgtUrl.slice(pfx.length);
      found = { pfx, svcId, subUrl, svc: svcs.get(svcId) };
    });
    if (found) { return found; }

    const opt = orf(origOpt);
    if (opt.ignoreAliases !== true) { // e.g. ignoreAliases === undefined
      const canonical = svcs.canonicalizePrefixReverseHostnameAliases(tgtUrl);
      if (canonical) {
        found = svcs.findServiceByTargetUrl(canonical,
          { ...origOpt, ignoreAliases: true });
        if (found) { return found; }
      }
    }

    return false;
  },


  findMetadataByTargetUrl(tgtUrl) {
    const svcs = this;
    const svcFromPrefix = svcs.findServiceByTargetUrl(tgtUrl);
    if (!svcFromPrefix) {
      const msg = 'No service configured for target URL: ' + tgtUrl;
      throw httpErrors.aclDeny.throwable(msg);
    }
    const { svcId, pfx } = svcFromPrefix;
    const svcInfo = svcFromPrefix.svc;
    if (!svcInfo) {
      const msg = 'No data for service ID: ' + svcId;
      throw httpErrors.aclDeny.throwable(msg);
    }
    const meta = {
      serviceId: svcId,
      serviceUrlPrefix: pfx,
      ...svcInfo.staticAclMeta,
    };
    svcCfgFlagNames.forEach((k) => { meta[k] = Boolean(svcInfo[k]); });

    const tumCfg = svcInfo.targetUrlMetadata;
    const subUrl = tgtUrl.slice(svcFromPrefix.pfx.length);
    (tumCfg.vSubDirs || []).reduce(function learn(remain, slot) {
      const rmnOrEmpty = (remain || '');
      const [val, more] = (splitOnce('/', rmnOrEmpty) || [rmnOrEmpty]);
      if (slot) { meta[slot] = val; }
      return more;
    }, subUrl);

    return meta;
  },


  canonicalizePrefixReverseHostnameAliases(tgtUrl) {
    const svcs = this;
    const k = 'prefixReverseHostnameAliases';
    const found = lookupRevHostInDeepDict.fromUrl(svcs[k], tgtUrl);
    if (!found) { return false; }
    const { urlParsed: url, val, parent } = found;
    url.hostname = (val.endsWith('.') ? val.slice(0, -1) : val + parent);
    return url.href;
  },


};


export default EX;
