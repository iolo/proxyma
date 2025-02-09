import fs from 'fs';
import http from 'http';
import https from 'https';

import config from './config.mjs';

const handler = (req, res) => {
  //console.log('*****', req, '*****');
  const host = req.headers.host;
  const target = config.targets[host];
  if (target) {
    console.log(`${req.method} ${host}${req.url} -> ${target.host}:${target.port}`);
    const targetRequestOptions = {
      protocol: target.protocol,
      host: target.host,
      port: target.port,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `${target.host}:${target.port}` },
    };
    const httpModule = target.protocol == 'http' ? http : https;
    const targetResponseHandler = (targetResponse) => {
      console.log(`\t${targetResponse.statusCode}`);
      res.writeHead(targetResponse.statusCode, targetResponse.headers);
      targetResponse.pipe(res, { end: true });
    };
    const targetRequest = httpModule.request(targetRequestOptions, targetResponseHandler);
    req.pipe(targetRequest, { end: true });
  } else {
    console.log(`${host}${req.url} -> not found`);
    res.writeHead(404);
    res.write('Not Found');
    res.end();
  }
};

console.log(config.targets);

const httpPort = config.http?.port ?? 80;
http.createServer(handler).listen(httpPort, () => {
  console.log(`HTTP server listening on port ${httpPort}`);
});

const httpsPort = config.http?.port ?? 443;
const httpsKey = fs.readFileSync(config.https?.key ?? 'cert.key');
const httpsCert = fs.readFileSync(config.https?.cert ?? 'cert.pem');
https.createServer({ key: httpsKey, cert: httpsCert }, handler).listen(httpsPort, () => {
  console.log(`HTTPS server listening on port ${httpsPort}`);
});

