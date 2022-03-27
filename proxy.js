const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/', createProxyMiddleware({
    logLevel: "debug",
    router: (req) => {
        if (typeof req == "string")
            return req;

        return req.protocol + "://" + req.headers.host;
    },
    changeOrigin: true,
}));

app.listen(12345);
