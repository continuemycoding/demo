const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { gzip, ungzip } = require('node-gzip');

// http://service.picasso.adesk.com/v1/vertical/category/4e4d610cdf714d2966000000/vertical
// http://maqib.cn/blog/node-reptile

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

// app.use('/www-youtube-com/', createProxyMiddleware({
//     logLevel: "debug",
//     target: 'https://www.youtube.com/',
//     changeOrigin: true,
//     pathRewrite: { '^/www-youtube-com/': '/' },
//     onProxyRes: (proxyRes, req, res) => {
//         console.log('https://www.youtube.com/', "onProxyRes");
//     }
// }));

app.use('/', createProxyMiddleware({
    // logLevel: "debug",
    // target: 'https://web.telegram.org/',
    // target: 'https://github.com/',
    // target: 'https://www.google.com.hk/',
    router: function (req) {

        // if (req.protocol == "http")
            // return 'https://www.google.com.hk/';

        console.log("#####################", "router", req.baseUrl, "protocol", req.protocol, "hostname", req.hostname);
        return 'https://www.google.com.hk/';
    },
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


        // console.log('https://github.com/', "onProxyRes", type, req.url);
        // console.log(proxyRes.headers["content-security-policy"]);
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
            // console.log('https://github.com/', "end", chunkArray.length);

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

                decompressed = decompressed.replace(/https:\/\/www\.google\.com\.hk/g, `http://${req.headers.host}`);
                // decompressed = decompressed.replace(/https:\/\/www\.youtube\.com/g, `www-youtube-com://${req.headers.host}`);
                decompressed = decompressed.replace(/https:\/\/www\.youtube\.com/g, `youtube://${req.headers.host}`);

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
