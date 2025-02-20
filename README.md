# proxyma

> simple named virutal host proxy server for development

For example, you want to run some servers on local(development) but some servers on remote(production or staging).
You can use `proxyma` to proxy requests to the right server by the domain name without complex web servers like `nginx`
or `apache`.

## Prepare hosts files or DNS

add the following lines to your `hosts` file

```
127.0.0.1 example.com
127.0.0.1 www.example.com
127.0.0.1 api.example.com
```

NOTE: You may find `hosts` file location are different by OS:

- Windows: `Windows/System32/drivers/etc/hosts`
- Macos: `/private/etc/hosts`
- Linux: `/etc/hosts`

NOTE: You may add `A` record for `127.0.0.1` to your DNS server instead of modifying `hosts` file.

## Prepare a certificate for https(optional)

modify `req.cnf` to match your domain

```
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no
[req_distinguished_name]
C = KR
ST = State
L = Location
O = Organization Name
OU = Organizational Unit
CN = example.com
[v3_req]
keyUsage = critical, digitalSignature, keyAgreement
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = exmaple.com
DNS.2 = www.exmaple.com
DNS.3 = api.example.com
```

and generate certificate files with `openssl`

```console
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout cert.key -out cert.pem -config req.cnf -sha256
```

and you've got `cert.key` and `cert.pem` files.

NOTE: You may use [Let's Encrypt](https://letsencrypt.org/) to get certificates with your DNS server.

```console
mkcert -install
mkcert -key-file cert.key -cert-file cert.pem example.com www.example.com api.example.com
```

### Configure the proxy-server

modify `config.mjs` to match your target backends.

```js
export default {
  http: {
    port: 80, // default
  },
  https: {
    port: 443, // default
    key: 'cert.key', // default
    cert: 'cert.pem', // default
  }
  targets: {
    'example.com': { protocol: 'http:', host: 'localhost', port: 3000 },
    'www.example.com': { protocol: 'http:', host: 'localhost', port: 3000 },
    'api.example.com': { protocol: 'http:', host: 'localhost', port: 4000 },
    'auth.example.com': { protocol: 'https:', host: 'auth.example.com', port: 443 },
  },
};
```

### Run the proxy-server

```console
node index.mjs
```

### Connect to the proxy-server

- https://example.com, https://example.com, http://example.com or http://example.com will be proxied to
  `http://localhost:3000`
- https://api.example.com or http://api.example.com will be proxied to `http://localhost:4000`
- https://auth.example.com or http://auth.example.com will be proxied to `https://auth.example.com`

That's all folks.

---
May the **SOURCE** be with you...
