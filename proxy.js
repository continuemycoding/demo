const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { gzip, ungzip } = require('node-gzip');

const app = express();

// app.use('/github/', createProxyMiddleware({
//     logLevel: "debug",
//     target: 'https://github.com/',
//     changeOrigin: true,
//     pathRewrite: { '^/github/': '/' }
// }));

app.use('/avatars-githubusercontent-com/', createProxyMiddleware({
    logLevel: "debug",
    target: 'https://avatars.githubusercontent.com/',
    changeOrigin: true,
    pathRewrite: { '^/avatars-githubusercontent-com/': '/' },
    onProxyRes: (proxyRes, req, res) => {
        console.log('https://avatars.githubusercontent.com/', "onProxyRes");
    }
}));

app.use('/github-githubassets-com/', createProxyMiddleware({
    logLevel: "debug",
    target: 'https://github.githubassets.com/',
    changeOrigin: true,
    pathRewrite: { '^/github-githubassets-com/': '/' },
    onProxyRes: (proxyRes, req, res) => {
        console.log('https://github.githubassets.com/', "onProxyRes");
    }
}));

app.use('/', createProxyMiddleware({
    logLevel: "debug",
    // target: 'https://web.telegram.org/',
    target: 'https://github.com/',
    // target: "http://ip-api.com/json/?lang=zh-CN",
    changeOrigin: true,
    // pathRewrite: { '^/github-com/': '/' },
    // onOpen: (proxyRes) => {
    //     console.log("onOpen", proxyRes.remoteAddress);
    //     proxySocket.on('data', (data, data2) => {
    //         console.log(data);
    //     });
    // },
    onProxyRes: (proxyRes, req, res) => {
        const type = proxyRes.headers["content-type"];


        console.log('https://github.com/', "onProxyRes", type, req.url);
        console.log(proxyRes.headers["content-security-policy"]);
        delete proxyRes.headers["content-security-policy"];

        if (type.indexOf("text/html") == -1)
            return;

        const chunkArray = [];

        proxyRes.on('data', function (chunk) {
            chunkArray.push(chunk);
        });

        res.write = () => { };

        const _end = res.end;
        res.end = async function (chunk) {
            console.log('https://github.com/', "end", chunkArray.length, chunk);

            chunk && chunkArray.push(chunk);

            if (chunkArray.length == 0) {
                _end.call(res);
                return;
            }

            const buf = Buffer.concat(chunkArray);

            try {
                let decompressed = (await ungzip(buf)).toString();

                decompressed = decompressed.replace(/https:\/\/avatars\.githubusercontent\.com/g, "/avatars-githubusercontent-com");
                decompressed = decompressed.replace(/https:\/\/github\.githubassets\.com/g, "/github-githubassets-com");

                const compressed = await gzip(decompressed);
                _end.call(res, compressed);
            }
            catch (e) {
                console.error(e);

                _end.call(res, buf);
            }
        };
    }
}));

app.listen(12345);
