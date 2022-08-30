// -*- coding: utf-8, tab-width: 2 -*-

import makeGenericAsyncCorsHandler from 'cors-async';
import pify from 'pify';
import smartListen from 'net-smartlisten-pmb';

import plumb from './hnd/util/miscPlumbing.mjs';


const EX = function installListenAddrPlumbing(srv) {
  const listenAddr = srv.popCfg('str | pos0 num', 'listen_addr');
  const lsnSpec = smartListen(listenAddr, 0, 'http://');
  const origLsnDescr = String(lsnSpec);
  const lsnUrl = EX.fmtLsnUrl(origLsnDescr);
  const cfgPubUrl = srv.popCfg('str', 'public_baseurl', '');
  const pubUrl = (cfgPubUrl || lsnUrl);

  const noSlashPubUrl = pubUrl.replace(/\/$/, '');
  // ^-- Please don't reinvent guessOrigReqUrl from
  //     `hnd/util/miscPlumbing.mjs`!

  const confirmCors = plumb.legacyMultiArg(makeGenericAsyncCorsHandler({
    origin: srv.popCfg('nonEmpty str', 'cors_accept_origin'),
    optionsSuccessStatus: 200, // as recommended by npm:cors
  }));

  const webSrv = srv.getLowLevelWebServer();


  async function listen() {
    const aliasReason = (function whyAlias() {
      if (cfgPubUrl) { return 'config says'; }
      if (pubUrl !== origLsnDescr) { return 'we assume'; }
    }());
    const aliasHint = (aliasReason && (' which ' + aliasReason
      + ' is also ' + pubUrl));
    const descr = ('Gonna listen on ' + origLsnDescr + aliasHint);
    console.info(descr);
    await pify(cb => webSrv.listen(lsnSpec, cb))();
    console.info('Now listening.');
  }


  async function close() {
    const closePrs = [
      pify(cb => webSrv.once('close', cb))(),
      (srv.db && srv.db.abandon()),
    ];
    webSrv.close();
    await Promise.all(closePrs);
  }


  Object.assign(srv, {
    close,
    confirmCors,
    listen,
    publicBaseUrlNoSlash: noSlashPubUrl,
  });
  return srv;
};


Object.assign(EX, {

  fmtLsnUrl(lsnSpec) {
    let u = String(lsnSpec);
    u = u.replace(/^TCP (\w+:\/{2})127\.0\.0\.1(?=:|\/|$)/, '$1localhost');
    return u;
  },


});


export default EX;
