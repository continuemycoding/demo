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
    // target: 'https://github.com/',
    target: "http://ip-api.com/json/?lang=zh-CN",
    changeOrigin: true,
    onOpen: (proxyRes) => {
        console.log("onOpen", proxyRes.remoteAddress);
        proxySocket.on('data', (data, data2) => {
            console.log(data);
        });
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log("onProxyRes");
        // proxyRes.headers['x-added'] = 'foobar'; // add new header to response
        // delete proxyRes.headers['x-removed']; // remove header from response

        // console.log("########################################");

        // console.log(proxyRes.constructor.name);
        // console.log("111111111111111");
        // console.log(req.constructor.name);
        // console.log("222222222222222");
        // console.log(res.app);

        // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");




        console.log(proxyRes.headers);
        // console.log(res.getHeaders());


        var body = "";
        var _write = res.write;
        proxyRes.on('data', function (chunk) {
            body += chunk;

            console.log("####################", body.toString());
        });

        res.write = function (data) {
            try {
                // console.log(data.toString("utf-8"));
                // console.log(data.toString("utf-8").indexOf("github.githubassets.com"));
                var jsonData = JSON.parse(data);
                // here we can modify jsonData
                jsonData.country = "中国福州市";
                console.log("##########", jsonData);
                var buf = Buffer.from(JSON.stringify(jsonData), 'utf-8');

                _write.call(res, buf);
            } catch (err) {
                console.log(err);
            }
        }
    }
}));



app.listen(12345);
