# 智慧食堂前端（客户端 + 管理端）

本仓库保留原有根目录 uni-app 客户端，并将 Vue 3 管理端放在 admin/。后端、Docker、数据库与启动脚本在 https://github.com/kkzyx/smartcanteen_backend 。

## 先启动后端

按后端 README 启动 MySQL、Redis Stack、MongoDB、MinIO 和 Java 服务，默认端口 8848。新数据库初始管理账号 admin / admin123。

## Vue 3 管理端

建议 Node.js 22 LTS，npm。进入 admin/，运行 npm ci，然后 npm run dev，访问 http://localhost:9527 。

打包运行 npm run build。生产静态站点需要反向代理 /prod-api 到后端（移除 /prod-api 前缀），并代理 /ws/ 的 WebSocket。npm run preview 仅用于静态预览，没有后端代理。开发模式已经配置 /dev-api 代理。

保留原有 npm run build:prod（包含严格类型检查），单独类型检查使用 npm run type-check。当前代码已有多处 TypeScript 类型错误，严格检查尚未通过；Vite 页面构建和严格类型检查是分别报告的，不代表所有业务功能已验证。

## uni-app 微信客户端

在仓库根目录运行 npm ci，然后 npm run dev:mp-weixin。微信开发者工具导入 dist/dev/mp-weixin；或用 HBuilderX 打开本项目。微信登录需要自己的小程序 AppID，并在后端配置对应 AppID / AppSecret；src/manifest.json 的 mp-weixin.appid 需改为自己的 AppID。

H5 页面开发可运行 npm run dev:h5，生产构建 npm run build:h5；微信授权登录流程需要在微信小程序中测试。

## 换服务器或真机调试

根目录和 admin/ 各自有 .env.example，分别复制为 .env.development.local，调整 VITE_APP_API_URL 和 VITE_APP_WS_URL，重启开发服务。真机上的 localhost 指手机本身，必须使用运行后端设备的局域网 IP；确保网络、防火墙和微信域名配置允许访问。生产环境使用 .env.production.local 配置部署地址。

客服和 AI 页面的 HTTP/WebSocket 地址已经改用 VITE_APP_API_URL，避免写死原设备地址。VITE_ 变量会公开在浏览器构建产物中，禁止放入云 API Key、微信 AppSecret 或数据库密码。

node_modules、dist、unpackage、IDE 缓存和 *.local 环境文件不纳入版本控制。依赖锁文件已提交，换设备用 npm ci 安装。真实业务数据库、上传图片和知识库文件需要另外私密迁移，详见后端 README。
