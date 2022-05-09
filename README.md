```bash
sudo -s #切换root权限

apt install -y npm

npm install n -g && n stable #更新node最新版，重启生效

curl -O https://raw.githubusercontent.com/continuemycoding/demo/main/proxy.js
curl -O https://raw.githubusercontent.com/continuemycoding/demo/main/package.json

echo "node /home/lighthouse/proxy.js" >> /etc/rc.local #添加开机自启

reboot

npm install

sudo reboot
```

### 腾讯云轻量应用服务器搭建需要配置防火墙开放指定端口
---
~~~bash
git config -l

git config --global http.proxy "socks5://ip:port"
git config --global https.proxy "socks5://ip:port"

git config --global --unset http.proxy
git config --global --unset https.proxy
~~~
