# 🏫 KMK Campus Heritage Map
### Peta Kenangan Kolej Matrikulasi Kedah

一个 3D 互动校园记忆地图，让 KMK 学生留下并分享他们的回忆。

**在线预览：** [点击这里查看](https://你的用户名.github.io/你的仓库名/)

---

## 功能特色

- 🗺️ **3D 校园地图** — 基于真实 KMK 校园地理数据
- 🏠 **24 栋建筑** — 宿舍、食堂、讲堂、图书馆等
- 💬 **记忆墙** — 点击建筑留下你的回忆
- 📅 **年份筛选** — 按届次浏览回忆
- 🔗 **可嵌入** — 支持 iframe 嵌入到其他网站

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发预览（会自动打开浏览器）
npm run dev

# 打包成单文件
npm run build
```

## 嵌入到其他网站

```html
<iframe
  src="https://你的用户名.github.io/你的仓库名/"
  width="100%"
  height="700px"
  style="border:none; border-radius:12px;">
</iframe>
```

## 技术栈

- React 19 + TypeScript
- Three.js（@react-three/fiber）
- Framer Motion
- Tailwind CSS v4
- Zustand
- Vite + vite-plugin-singlefile

---
*Changlun, Kedah · KMK Heritage Map*
