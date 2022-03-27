const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { gzip, ungzip } = require('node-gzip');
const brotli = require('brotli');

// http://service.picasso.adesk.com/v1/vertical/category/4e4d610cdf714d2966000000/vertical
// http://maqib.cn/blog/node-reptile

const app = express();

function router(req) {
    const searchValue = /\/proxy\/(http|https)-([\w-=]+)/gm;

    const match = searchValue.exec(req.path);
    if (match) {
        return match[0].replace(searchValue, (substring, ...args) => {
            const protocol = args[0];
            const host = Buffer.from(args[1], 'hex').toString();
            return protocol + "://" + host;
        });
    }

    // return "https://www.douyin.com/";
    // return "https://web.telegram.org/z/";
    return "https://www.xvideos.com/";
    // return "https://my-next-app-git-test-continuemycoding.vercel.app/";
    // return "https://www.bilibili.com/";
    // return "https://www.google.com.hk/";
    // return "https://web.telegram.org/";
    // return "https://github.com/";
    // return "https://www.baidu.com";
}

app.use('/', createProxyMiddleware({
    // logLevel: "debug",
    router,
    changeOrigin: true,
    pathRewrite: async function (path, req) {
        const match = /\/proxy\/(http|https)-([\w-=]+)(.*)/gm.exec(path);
        return match ? match[3] : path;
    },
    cookieDomainRewrite: "",
    onProxyReq: (proxyReq, req, res, options) => {
        proxyReq.setHeader('referer', router(req.originalUrl));
    },
    onProxyRes: (proxyRes, req, res) => {

        console.log("onProxyRes", req.path);

        const contentType = proxyRes.headers["content-type"];

        if (contentType && contentType.indexOf("text/html") == -1) {
            return;
        }

        // if (contentType?.includes("image/"))
        //     return;

        const encoding = proxyRes.headers["content-encoding"];
        console.log({ encoding });

        delete proxyRes.headers["content-security-policy"];
        delete proxyRes.headers["content-length"];

        const chunkArray = [];

        proxyRes.on('data', function (chunk) {
            chunkArray.push(chunk);
        });

        res.write = () => { };

        const _end = res.end;
        res.end = async function (chunk) {

            chunk && chunkArray.push(chunk);

            console.log(req.url, chunkArray.length, contentType);

            if (chunkArray.length == 0) {
                _end.call(res);
                return;
            }

            const buf = Buffer.concat(chunkArray);

            try {
                let decompressed = buf.toString();

                if (encoding == "gzip")
                    decompressed = (await ungzip(buf)).toString();
                else if (encoding == "br")
                    decompressed = new TextDecoder().decode(brotli.decompress(buf));

                // decompressed = decompressed.replace(/\\u002F/gm, "/");

                decompressed = decompressed.replace(/(href="\/video\d+)\/\d+\/\d(\/\w+")/gm, (substring, ...args) => {
                    return args[0] + args[1];
                });

                decompressed = decompressed.replace(/((http|https):)?\/\/([^/]+)/gm, (substring, ...args) => {
                    // console.log("replace", substring, "=>", `${req.protocol}://${req.headers.host}/proxy/${args[0]}-${args[1].replace(/\./gm, '-')}`);

                    return `${req.protocol}://${req.headers.host}/proxy/${args[1] || "http"}-${Buffer.from(args[2]).toString('hex')}`;
                });

                const proxyUrl = /\/proxy\/(http|https)-[\w-=]+/gm.exec(req.originalUrl);
                if (proxyUrl) {
                    decompressed = decompressed.replace(/(src|href|srcset)="(\/[^"]+)"/gm, (substring, ...args) => {
                        // console.log("replace", substring, "=>", `${args[0]}="${req.protocol}://${req.headers.host}${proxyUrl[0]}${args[1]}"`);

                        return `${args[0]}="${req.protocol}://${req.headers.host}${proxyUrl[0]}${args[1]}"`;
                    });
                }

                let compressed = Buffer.from(decompressed);
                if (encoding == "gzip")
                    compressed = await gzip(decompressed);
                else if (encoding == "br")
                    compressed = brotli.compress(new TextEncoder().encode(decompressed));

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
