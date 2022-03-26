const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
// const iconv = require("iconv-lite");
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

app.use('/github-com', createProxyMiddleware({
    logLevel: "debug",
    // target: 'https://web.telegram.org/',
    target: 'https://github.com/',
    // target: "http://ip-api.com/json/?lang=zh-CN",
    changeOrigin: true,
    pathRewrite: { '^/github-com/': '/' },
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

        // console.log(proxyRes.headers);

        const chunkArray = [];

        proxyRes.on('data', function (chunk) {
            chunkArray.push(chunk);
        });

        // const _write = res.write;
        // res.write = function (data) {
        //     try {
        //         console.log(data);
        //         // console.log(data.toString("utf-8").indexOf("github.githubassets.com"));
        //         // var jsonData = JSON.parse(data);
        //         // // here we can modify jsonData
        //         // jsonData.country = "中国福州市";
        //         // console.log("##########", jsonData);
        //         // var buf = Buffer.from(JSON.stringify(jsonData), 'utf-8');

        //         _write.call(res, data);
        //     } catch (err) {
        //         console.log(err);
        //     }
        // };

        // return;

        // Defer all writes
        res.write = () => { };

        const _end = res.end;
        res.end = function (chunk) {
            console.log('https://github.com/', "end", chunkArray.length, chunk);
            // console.log(body.toString());
            chunk && chunkArray.push(chunk);


            if (chunkArray.length == 0) {
                _end.call(res);
                return;
            }

            const buf = Buffer.concat(chunkArray);
            // console.log(buf.toString());
            // console.log(iconv.decode(buf, "gbk"));

            // console.log(buf.toString());

            ungzip(buf)
                // .then((compressed) => {
                //     return ungzip(compressed);
                // })
                .then((decompressed) => {
                    let output = decompressed.toString();

                    output = output.replace(/https:\/\/avatars\.githubusercontent\.com/g, "/avatars-githubusercontent-com");
                    output = output.replace(/https:\/\/github\.githubassets\.com/g, "/github-githubassets-com");

                    gzip(output).then((compressed) => {
                        // return ungzip(compressed);
                        _end.call(res, compressed);
                    });
                });


        };
    }
}));


app.use('/', createProxyMiddleware({
    logLevel: "debug",
    target: 'https://github.com/',
    changeOrigin: true
}));


app.listen(12345);
