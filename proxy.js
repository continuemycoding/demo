const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// app.use('/github/', createProxyMiddleware({
//     logLevel: "debug",
//     target: 'https://github.com/',
//     changeOrigin: true,
//     pathRewrite: { '^/github/': '/' }
// }));

app.use('/', createProxyMiddleware({
    logLevel: "debug",
    // target: 'https://web.telegram.org/',
    target: 'https://github.com/',
    changeOrigin: true,
    onProxyRes: (proxyRes, req, res) => {
        // proxyRes.headers['x-added'] = 'foobar'; // add new header to response
        // delete proxyRes.headers['x-removed']; // remove header from response

        console.log("########################################");

        console.log(typeof proxyRes);
        console.log("111111111111111");
        console.log(typeof req);
        console.log("222222222222222");
        console.log(typeof res);

        console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    }
}));



app.listen(12345);
