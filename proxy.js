const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

function router(req) {
    return req.protocol + "://" + req.headers.host;
}

app.use('/', createProxyMiddleware({
    logLevel: "debug",
    router,
    changeOrigin: true,
    // pathRewrite: async function (path, req) {
    //     return path;
    // },
    // cookieDomainRewrite: "",
    onProxyReq: (proxyReq, req, res, options) => {
        proxyReq.setHeader('referer', router(req.originalUrl));
    },
    // onProxyRes: (proxyRes, req, res) => {
    //     delete proxyRes.headers["content-security-policy"];
    //     delete proxyRes.headers["content-length"];
    // }
}));

app.listen(12345);
