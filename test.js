const socks = require('socksv5');

for (let i = 22222; i < 22333; i++) {
    let server = socks.createServer(function (info, accept, deny) {
        console.log(info.srcAddr, info.srcPort, info.dstAddr, info.dstPort);
        accept();
    });

    server.listen(i, '0.0.0.0', function () {
        console.log('SOCKS server listening');
    });

    server.useAuth(socks.auth.None());
}