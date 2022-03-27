```bash
sudo apt install -y libssl1.0-dev nodejs-dev node-gyp npm

curl -O https://raw.githubusercontent.com/continuemycoding/demo/main/socks5-proxy.js
npm install socksv5

sudo -s #切换root权限
echo "node /home/lighthouse/socks5-proxy.js" >> /etc/rc.local #添加开机自启

reboot
```

### 使用腾讯云轻量应用服务器搭建，需要配置防火墙开放指定端口