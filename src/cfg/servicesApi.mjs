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


  determineMetadataByTargetUrl(cacheEntry, tgtUrl) {
    const svcs = this;
    const { publicMeta, internalMeta } = orf(cacheEntry);
    if (!publicMeta) { throw new Error('Invalid cache entry'); }
    if (publicMeta.serviceId) {
      const msg = 'Cache entry for ' + tgtUrl + ' already has a serviceId!';
      throw new Error(msg);
    }
    const svcFromPrefix = svcs.findServiceByTargetUrl(tgtUrl);
    if (!svcFromPrefix) {
      const msg = 'No service configured for target URL: ' + tgtUrl;
      const err = httpErrors.aclDeny.throwable(msg);
      throw err;
    }
    const { svcId, pfx } = svcFromPrefix;
    const svcInfo = svcFromPrefix.svc;
    if (!svcInfo) {
      const msg = 'No data for service ID: ' + svcId;
      throw httpErrors.aclDeny.throwable(msg);
    }
    publicMeta.serviceId = svcId;
    publicMeta.serviceUrlPrefix = pfx;
    Object.assign(publicMeta, svcInfo.staticPublicAclMeta);
    Object.assign(internalMeta, svcInfo.staticAclMeta);
    EX.svcCfgFlagNames.forEach(
      (k) => { internalMeta[k] = Boolean(svcInfo[k]); });

    const tumCfg = svcInfo.targetUrlMetadata;
    const subUrl = tgtUrl.slice(svcFromPrefix.pfx.length);
    (tumCfg.vSubDirs || []).reduce(function learn(remain, slot) {
      const rmnOrEmpty = (remain || '');
      const [val, more] = (splitOnce('/', rmnOrEmpty) || [rmnOrEmpty]);
      if (slot) { publicMeta[slot] = val; }
      return more;
    }, subUrl);

    return cacheEntry;
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
