const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

process.on('uncaughtException', function (e) {
    console.error("uncaughtException\t", e.stack);
});

const app = express();

app.use('/', createProxyMiddleware({
    logLevel: "debug",
    router: (req) => {
        console.log("router", req.protocol + "://" + req.headers.host);
        return req.protocol + "://" + req.headers.host;
    },
    changeOrigin: true,
}));

app.listen(12333);
