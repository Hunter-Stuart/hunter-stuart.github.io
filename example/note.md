---
# ── 日常模板：复制到 src/content/notes/{zh,en}/<slug>.md ──
# 文件名就是 URL：clean-desk.md → /notes/clean-desk
# 中英各写一份，英文放 en/ 目录

# title：显示在第五章的卡片和详情页大标题
title: 标题写成一个具体的观察，而不是笼统的话题

# description：摘要。它是 <meta description> / og:description / JSON-LD 三处共用的，
# 留空则三处都空，分享到群里也是空白摘要。一句话，40–80 字。
description: 一句话摘要，会显示在列表和搜索结果里

# date：ISO 格式 YYYY-MM-DD
date: 2026-10-18

# category：自由写——日常 / 阅读 / 身体 / 音乐 ……
category: 日常

# tags：尽量填。会逐条输出成 article:tag，并合成 JSON-LD 的 keywords。
tags: [习惯, 专注]
---

开头一段，说清这篇想记下什么。

## 具体经过

日常类的内容，价值在细节而不在结论。「桌面收拾干净后写代码变快了」是结论，
「记了一个月，平均专注时长从 42 分钟到 58 分钟」才是内容。

| 状态 | 平均专注时长 | 每天中断次数 |
| --- | --- | --- |
| 桌面堆满 | 42 分钟 | 9 |
| 桌面清空 | 58 分钟 | 5 |

## 想到的

结论不一定非要有。想不通的地方如实写「还没想明白」，比硬给一个答案诚实。

---

<!-- 发布前自检，写完这篇就整段删掉 -->

## 发布前自检

- [ ] `description` 写了 —— 三处 SEO 字段共用，空了一处等于三处都空
- [ ] `tags` 填了
- [ ] `date` 是 `YYYY-MM-DD`
- [ ] 文件名用英文（URL 里不会出现编码乱码）
