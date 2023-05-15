const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const socks = require('socksv5');
const axios = require('axios');

process.on('uncaughtException', (e) => {
    console.error("uncaughtException\t", e.stack);
});

async function request(config) {
    const result = await axios.create(config).request(config).catch(reason => console.error(config.url, reason));

    return result.data;
}

const app = express();

app.use('/', createProxyMiddleware({
    // logLevel: "debug",
    router: (req) => {
        return req.protocol + "://" + req.headers.host;
    },
    changeOrigin: true,
}));

app.listen(12345);

const server = socks.createServer(async (info, accept, deny) => {
    // console.log(info.srcAddr, info.srcPort, info.dstAddr, info.dstPort);

    //const data = await request({ url: `http://ip-api.com/json/${info.srcAddr}?lang=zh-CN` });

    //if (data.city == "福州" || data.city == "福州市")
        accept();
});

server.listen(54321, '0.0.0.0', () => {
    // console.log('SOCKS server listening');
});

server.useAuth(socks.auth.None());
