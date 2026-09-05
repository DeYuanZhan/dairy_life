# 一日手账 · DAY LEDGER

> 早上规划，晚上复盘。一页手账装下一整天：工作、学习、睡眠、健身、形象、生活、活动、记录与心情，九维加权自动打分。

数据保存在你自己的浏览器里（localStorage），不上传、不注册、离线可用。

---

## ✨ 产品架构

小程序式四页签结构，配合「晨间规划 / 晚间复盘」双时段设计——分时段分步填写，而不是一次性铺满所有输入框。

| 页签 | 内容 |
| --- | --- |
| 🏠 **首页** | 今日卡片（日期 / 心情打卡 / 天气 / 地点 / 实时评分环 / 连续复盘统计）、早上规划 & 晚上复盘分段切换、右下角悬浮速记按钮 |
| 📅 **日历** | 月历视图：分数色阶着色、情绪色点、点击任意一天进入「日档案」补记，`← / →` 键翻页 |
| 📈 **统计** | 7/30 天综合分趋势图（情绪色点）、本周复盘看板与短板建议、近 7 晚睡眠柱图、打卡勋章墙、标签检索 |
| ⚙️ **设置** | 九个模块开关、消费记账开关、打分权重滑杆（自动归一化）、晨间/晚间提醒、JSON 导出/导入备份 |

## 🧩 九大记录模块

- **工作**：待办 + 高/中/低优先级 + 任务标签、1~3 条核心目标、一键迁移昨日未完成任务、复盘三件套（完成情况 / 卡点 / 明日调整）
- **学习**：规划分钟 → 实际分钟（+25/+45 快捷）→ 检查 → 掌握情况 → 待复习清单；「下一步计划」次日自动提醒带入
- **睡眠**：昨晚计划 / 实际 / 明日规划、快速时长预设、质量 1~5 星、近 7 晚睡眠柱状图（含 8h 目标线）
- **健身**：训练类型、组数时长、体重选填、身体感受、下一步安排
- **形象**（差异化模块）：护肤 / 发型 / 穿搭 × 学习 / 实际 / 下一步，附穿搭照片上传
- **生活**：三餐分记、饮水杯数点击计数、忌口备注、出行 / 居住 / 采购清单、当日简易记账（可关闭）
- **活动**：聚餐 / 电影 / 逛街等 8 类，时间、参与人、感想
- **记录**：多图上传（自动压缩）、#标签系统、「私密 ↔ 可对外展示」隐私切换
- **心情**：开心 / 平静 / 失落 / 焦虑 / 疲惫 + 能量值 + 触发因素

## 🎯 综合打分

九个维度加权自动计算（权重可在设置中自定义，自动归一化到 100），评分明细透明展示；支持手动修正与一句话总结，评级印章（优秀 / 不错 / 尚可 / 需调整）。状态分首次冲上 85+ 会触发一次撒花庆祝。

## 🛠 技术栈

| 层 | 技术 |
| --- | --- |
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS 4（@theme 设计令牌 + 自定义动效） |
| 存储 | localStorage（按日分键 + 索引表），JSON 全量导出/导入 |
| 图表 | 手写 SVG（趋势曲线 / 进度环 / 柱图 / 热力月历） |
| 其他 | canvas-confetti（庆祝）、Notification API（提醒）、Canvas 图片压缩 |

---

## 🚀 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 3. 类型检查（可选）
npm run typecheck

# 4. 生产构建，产物输出到 dist/
npm run build

# 5. 本地预览构建产物
npm run preview
```

## 🌐 部署上线

这是一个**纯静态单页应用**（无后端、无环境变量），构建后把 `dist/` 目录部署到任意静态托管即可。

### 方案一：Vercel（推荐，最快）

1. 将项目推送到 GitHub / GitLab。
2. 打开 [vercel.com](https://vercel.com) → **Add New → Project** → 导入仓库。
3. 框架自动识别为 **Vite**，确认配置：
   - Build Command：`npm run build`
   - Output Directory：`dist`
4. 点击 **Deploy**，约 1 分钟后获得 `xxx.vercel.app` 线上地址；绑定自定义域名在 Settings → Domains 中完成。

也可用 CLI：

```bash
npm i -g vercel
vercel            # 首次部署
vercel --prod     # 发布到生产
```

### 方案二：Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**。
2. Build command：`npm run build`，Publish directory：`dist`。
3. 部署完成即获得 `xxx.netlify.app` 地址。

或直接把本地 `dist/` 文件夹拖进 Netlify 的 Drop 页面（[app.netlify.com/drop](https://app.netlify.com/drop)）即可上线。

### 方案三：GitHub Pages

```bash
npm run build

# 用 gh-pages 发布（首次需安装：npm i -D gh-pages）
npx gh-pages -d dist
```

然后在仓库 Settings → Pages 中选择 `gh-pages` 分支。
若部署在 `https://用户名.github.io/仓库名/` 子路径下，需在 `vite.config.ts` 中加入 `base: '/仓库名/'` 后重新构建（本项目为根路径部署时无需此步）。

### 方案四：Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**。
2. Build command：`npm run build`，Build output directory：`dist`。
3. 免费额度内含全球 CDN 与 HTTPS。

### 方案五：自有服务器 / 任意静态托管

构建后 `dist/` 是纯静态文件，直接丢进 Nginx / Caddy / 对象存储（阿里云 OSS、腾讯云 COS）并开启静态网站托管即可。Nginx 参考配置：

```nginx
server {
    listen 80;
    server_name ledger.example.com;
    root /var/www/day-ledger/dist;
    index index.html;

    # 单页应用路由回退（本项目无前端路由，此条为保险项）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 带 hash 的静态资源长缓存
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### 部署核对清单

- [x] 构建零错误、零告警（`npm run build`）
- [x] 无后端依赖、无密钥、无环境变量
- [x] 产物体积：JS gzip ≈ 88.5 kB，CSS gzip ≈ 9.7 kB
- [x] 数据存于用户浏览器 localStorage，服务端零存储，天然符合隐私要求

---

## 💾 数据说明

- **存储位置**：浏览器 localStorage，键前缀 `dayledger:d:YYYY-MM-DD`（按日）+ `dayledger:index`（索引）+ `dayledger:settings`（设置）。
- **备份**：设置页「导出 JSON」一键下载全量备份；「导入」可恢复并自动重建索引。
- **版本迁移**：v1 旧数据打开时自动迁移到 v2 结构，不丢记录。
- **换设备**：数据不会自动同步，请先导出 JSON，再在新设备导入。
- **注意**：清除浏览器站点数据会删除记录，请养成导出备份的习惯。

## 📁 目录结构

```
src/
├── App.tsx                    # 应用外壳：页签栏、双时段、速记、提醒、庆祝
├── lib/core.ts                # 数据模型 / 迁移 / 存储 / 评分 / 洞察 / 勋章 / 标签
└── components/
    ├── ui.tsx                 # 设计系统：图标、表情、天气、图表、卡片、控件
    ├── Header.tsx             # 顶栏 + 今日 Hero（分段切换 / 心情 / 评分环）
    ├── ModulesA.tsx           # 工作 / 学习 / 睡眠 / 心情 / 健身
    ├── ModulesB.tsx           # 生活 / 活动 / 记录 / 形象 / 综合打分
    ├── CalendarPage.tsx       # 月历 + 日档案头部
    ├── StatsPage.tsx          # 趋势图 / 周复盘 / 睡眠 / 勋章 / 标签检索
    └── SettingsPage.tsx       # 模块开关 / 权重 / 提醒 / 备份
```

## ❓ 常见问题

**Q：提醒没有弹出？**
A：需要在设置页打开提醒开关，并在浏览器地址栏授予「通知」权限；且浏览器标签页需保持打开。

**Q：照片会占很多空间吗？**
A：上传时已用 Canvas 压缩（长边 1000px、JPEG 0.78）；localStorage 上限约 5MB，建议定期导出备份、控制单日照片数量。

**Q：可以多设备同步吗？**
A：当前版本为本地优先设计，通过「导出 / 导入 JSON」手动同步；云端同步（Supabase）在路线图中。

## 🗺 路线图

- 云同步与多设备漫游（Supabase）
- AI 周复盘：自动生成个性化总结与建议
- 内嵌番茄钟，到时自动写入学习实际分钟
- PWA 离线安装 + 桌面提醒
- 历史记录全文搜索、照片相册按标签归档

---

*认真过好的每一天，都值得被打分。*
