const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { gzip, ungzip } = require('node-gzip');
const brotli = require('brotli');

// http://service.picasso.adesk.com/v1/vertical/category/4e4d610cdf714d2966000000/vertical
// http://maqib.cn/blog/node-reptile

const app = express();

// app.use('/github/', createProxyMiddleware({
//     logLevel: "debug",
//     target: 'https://github.com/',
//     changeOrigin: true,
//     pathRewrite: { '^/github/': '/' }
// }));

// app.use('/avatars-githubusercontent-com/', createProxyMiddleware({
//     logLevel: "debug",
//     target: 'https://avatars.githubusercontent.com/',
//     changeOrigin: true,
//     pathRewrite: { '^/avatars-githubusercontent-com/': '/' },
//     onProxyRes: (proxyRes, req, res) => {
//         console.log('https://avatars.githubusercontent.com/', "onProxyRes");
//     }
// }));

// app.use('/github-githubassets-com/', createProxyMiddleware({
//     logLevel: "debug",
//     target: 'https://github.githubassets.com/',
//     changeOrigin: true,
//     pathRewrite: { '^/github-githubassets-com/': '/' },
//     onProxyRes: (proxyRes, req, res) => {
//         console.log('https://github.githubassets.com/', "onProxyRes");
//     }
// }));

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
    //target: "https://www.baidu.com",
    router: function (req) {

        // console.log("router", req.path);

        // if (req.protocol == "http")
        // return 'https://www.google.com.hk/';


        // return 'https://www.google.com.hk/';

        // /proxy/https-www-bilibili-com/gentleman/polyfill.js

        const match = /\/proxy\/(http|https)-([\w-]+)/gm.exec(req.path);
        if (match) {

            const xx = match[0].replace(/\/proxy\/(http|https)-([\w-]+)/gm, (substring, ...args) => {
                // if(args[1] == "www.baidu.com")
                //     return `${req.protocol}://${req.headers.host}`;

                // return `${req.protocol}://${req.headers.host}/proxy/${args[0]}-${args[1].replace(/\./g, '-')}`;

                const protocol = args[0];
                const domain = args[1].replace(/-/, ".");
                return protocol + "://" + domain;
            });

            console.log("####################", "router", xx);

            return xx;

            // const protocol = match[1];
            // const domain = match[2].replace(/-/, ".");
            // return protocol + "://" + domain;
            //const result = {};
            //result[match[0]] = protocol + "://" + domain;
            //return result;
        }

        return "https://my-next-app-git-test-continuemycoding.vercel.app/";
        // return "https://www.bilibili.com/";
    },
    // target: "http://ip-api.com/json/?lang=zh-CN",
    changeOrigin: true,
    // pathRewrite: { '^/github-com/': '/' },
    pathRewrite: async function (path, req) {
        const match = /\/proxy\/(http|https)-([\w-]+)(.*)/gm.exec(req.path);
        if (match) {
            //const protocol = match[1];
            //const domain = match[2].replace(/-/, ".");
            //return protocol + "://" + domain;

            return match[3];
        }

        return path;
    },
    // onOpen: (proxyRes) => {
    //     console.log("onOpen", proxyRes.remoteAddress);
    //     proxySocket.on('data', (data, data2) => {
    //         console.log(data);
    //     });
    // },
    onProxyReq: (proxyReq, req, res, options) => {
        // req.headers["cache-control"] = "no-cache";
        // req.headers["cache-control"] = "no-store";
        req.headers["content-encoding"] = "gzip";
        req.gzip = true;
    },
    onProxyRes: (proxyRes, req, res) => {

        console.log("onProxyRes", req.path);

        const type = proxyRes.headers["content-type"];
        if (!type || type.includes("image/"))
            return;

        const encoding = proxyRes.headers["content-encoding"];
        console.log({ encoding });

        // console.log('https://github.com/', "onProxyRes", type, req.url);
        // console.log(proxyRes.headers["content-security-policy"]);
        delete proxyRes.headers["content-security-policy"];


        //if (type.indexOf("text/html") == -1)
        //    return;

        const chunkArray = [];

        proxyRes.on('data', function (chunk) {
            chunkArray.push(chunk);
        });

        res.write = () => { };

        const _end = res.end;
        res.end = async function (chunk) {



            chunk && chunkArray.push(chunk);

            console.log(req.url, chunkArray.length, proxyRes.headers["content-type"]);

            if (chunkArray.length == 0) {
                _end.call(res);
                return;
            }

            console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", "222222222222222222222");

            const buf = Buffer.concat(chunkArray);

            try {
                let decompressed = buf.toString();

                if (encoding == "gzip")
                    decompressed = (await ungzip(buf)).toString();
                else if(encoding == "br")
                    decompressed = new TextDecoder().decode(brotli.decompress(buf));

                // console.log("decompressed", decompressed);

                // decompressed = decompressed.replace(/https:\/\/avatars\.githubusercontent\.com/g, "/avatars-githubusercontent-com");
                // decompressed = decompressed.replace(/https:\/\/github\.githubassets\.com/g, "/github-githubassets-com");

                // decompressed = decompressed.replace(/https:\/\/www\.google\.com\.hk/g, `http://${req.headers.host}`);

                // http://hongkong:12345/https-www-youtube-com/



                decompressed = decompressed.replace(/(http|https):\/\/(([\w\.]+)(:\d+)?)/gm, (substring, ...args) => {
                    // if(args[1] == "www.baidu.com")
                    //     return `${req.protocol}://${req.headers.host}`;

                    // console.log("replace", substring, "=>", `${req.protocol}://${req.headers.host}/proxy/${args[0]}-${args[1].replace(/\./g, '-')}`);

                    return `${req.protocol}://${req.headers.host}/proxy/${args[0]}-${args[1].replace(/\./g, '-')}`;
                });

                // decompressed = decompressed.replace(/www.baidu.com/gm, `${req.protocol}://${req.headers.host}`);

                let compressed = Buffer.from(decompressed);
                if(encoding == "gzip")
                    compressed = await gzip(decompressed);
                else if(encoding == "br")
                    compressed = brotli.compress(new TextEncoder().encode(decompressed));

                console.log("compressed", compressed);

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
