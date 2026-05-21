# 字体文件说明

本项目支持离线使用，字体文件可以存放在此目录作为后备方案。

## 字体文件列表

### Maruko Gothic CJK SC
- `MarukoGothicCJKsc-Regular.woff2` - 常规字重
- `MarukoGothicCJKsc-Medium.woff2` - 中等字重
- `MarukoGothicCJKsc-Bold.woff2` - 粗体字重
- `MarukoGothicCJKsc-Black.woff2` - 黑体字重

### Nunito
- `Nunito-Regular.woff2` - 常规字重 (400)
- `Nunito-Medium.woff2` - 中等字重 (500)
- `Nunito-SemiBold.woff2` - 半粗体字重 (600)
- `Nunito-Bold.woff2` - 粗体字重 (700)
- `Nunito-ExtraBold.woff2` - 特粗字重 (800)
- `Nunito-Black.woff2` - 黑体字重 (900)

### Noto Sans SC
- `NotoSansSC-Regular.woff2` - 常规字重 (400)
- `NotoSansSC-Medium.woff2` - 中等字重 (500)
- `NotoSansSC-Bold.woff2` - 粗体字重 (700)

## 下载字体文件

### Maruko Gothic CJK SC
访问以下链接下载：
- https://cdn.jsdmirror.com/gh/max32002/maruko-gothic@1.015/webfont/CJK%20SC/

将以下文件下载到 `public/fonts/` 目录：
- MarukoGothicCJKsc-Regular.woff2
- MarukoGothicCJKsc-Medium.woff2
- MarukoGothicCJKsc-Bold.woff2
- MarukoGothicCJKsc-Black.woff2

### Nunito
访问 Google Fonts 下载或使用以下链接：
- https://fonts.google.com/specimen/Nunito

将以下文件下载到 `public/fonts/` 目录（需要转换格式为 woff2）：
- Nunito-Regular.woff2
- Nunito-Medium.woff2
- Nunito-SemiBold.woff2
- Nunito-Bold.woff2
- Nunito-ExtraBold.woff2
- Nunito-Black.woff2

### Noto Sans SC
访问 Google Fonts 下载或使用以下链接：
- https://fonts.google.com/specimen/Noto+Sans+SC

将以下文件下载到 `public/fonts/` 目录（需要转换格式为 woff2）：
- NotoSansSC-Regular.woff2
- NotoSansSC-Medium.woff2
- NotoSansSC-Bold.woff2

## 字体加载策略

CSS 中的字体加载策略为：
1. 优先使用本地字体文件 (`/fonts/`)
2. 如果本地文件不存在，使用 CDN 字体
3. 如果 CDN 不可用，使用系统默认字体

因此，即使不下载本地字体文件，项目也能通过 CDN 正常运行。下载本地字体文件主要是为了：
- 支持完全离线环境
- 提升加载速度
- 避免网络问题导致的字体加载失败
