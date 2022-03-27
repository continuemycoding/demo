const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const socks = require('socksv5');

process.on('uncaughtException', function (e) {
    console.error("uncaughtException\t", e.stack);
});

const app = express();

app.use('/', createProxyMiddleware({
    // logLevel: "debug",
    router: (req) => {
        return req.protocol + "://" + req.headers.host;
    },
    changeOrigin: true,
}));

app.listen(12345);

for (let i = 22000; i < 22050; i++) {
    let server = socks.createServer(function (info, accept, deny) {
        // winston.info(info.srcAddr, info.srcPort, info.dstAddr, info.dstPort);
        accept();
    });

    server.listen(i, '0.0.0.0', function () {
        // winston.info('SOCKS server listening');
    });

    server.useAuth(socks.auth.None());
}
