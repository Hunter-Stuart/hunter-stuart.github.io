---
title: 这台 Arch，装什么我说了算
description: 喜欢 Arch 给我的安装自由，也怀念 Windows 上双击安装包就能开工的日子。
date: 2026-11-18
category: 日常
tags: [Arch Linux, KDE Plasma, Linux]
---

我喜欢arch的点在于，想用哪个就装哪个，不想要的应用一开始就不用装，装完系统也不用特地花一下午清理预装软件。连 qBittorrent 都只是一个单独放着的 AppImage。哪天用不着了，我知道该去哪里找它。

桌面用的是 KDE Plasma 6，跑在 Wayland 上。我给它挑了 WhiteSur Dark，GTK 3 的按钮和菜单还用 Breeze，只有图标跟着换了。两边看着有点出入，我也懒得再抠。平常打开最多的是 Dolphin 和 Konsole，终端里的 JetBrains Mono 看着顺眼。中文用 Noto CJK，输入法是 Fcitx 5 的拼音，Rime 插件也装着。根分区用了 ext4，音频交给 PipeWire 和 WirePlumber。这些选定以后，桌面怎么长、机器里留哪些东西，我自己有数。

应用倒没少装。写代码用 VS Code，Node.js、npm、CMake 和 Ninja 都在 pacman 的清单里。Octave 也在，MATLAB 单独装。Edge、QQ、Obsidian 和 XMind 是 Flatpak，VYM、ONLYOFFICE、Adobe Reader 和 KRDC 也走这一路。网络这边有 Clash Verge Rev 和 Tailscale，机器上还装了 Paru。下次重装，`pacman -Qqe` 和 `pacman -Qqm` 我都想留一份，再补上 `flatpak list --app`。qBittorrent Enhanced Edition 和 MATLAB 的来源得另外记。

## 有时候真想双击就完事

要是手头急着打开一个工程文件，我还是会想念 Windows。软件多，碰到老师指定的软件，往往能直接找到 Windows 安装包。做工科也绕不开授权的钱。学生手头紧，作业又指定商业软件，Windows 上不少工科软件容易找到盗版，用起来确实少一道门槛。

Win10 的左右分屏我就挺喜欢，左边放资料，右边写代码，按 `Win + 方向键` 就够了。要同时留着 PDF、编辑器和终端，Win11 的 `Win + Z` 可以直接选格子。赶着做手头的事时，有这种现成的安排很舒服。[微软的窗口贴靠说明](https://support.microsoft.com/en-gb/windows/experience/snap-your-windows)

## 卡住的时候

翻日志时，Flathub 有超时，也有 SSL 连接错误。Clash 在机器上装着，浏览器也可能照常打开网页，但光凭这两点还看不出 Flatpak 当时走的哪条路。下次再卡，我想先在终端对着同一个远端试一次。等着装软件的时候，看进度条不动已经够烦了，再凭感觉乱切几个代理开关，回头更难说清到底是哪一项起了作用。

qBittorrent 和一个 MathWorks 进程都留下过 core dump。下次闪退，我会先记一下刚点了什么，用 `coredumpctl list` 和 `coredumpctl info` 对时间。qBittorrent 就从终端直接启动平常用的那个 AppImage，至少退出前说过的话还能看见。这两次记录到崩溃，原因还没找出来。

开机日志里也有 ACPI 的 `AE_NOT_FOUND` 和 `AE_ALREADY_EXISTS`。目前没把它们和一次具体的休眠或外设故障对上。真碰到唤醒异常，再翻 `journalctl -k -b`。这台装了 `linux` 和 `linux-lts`，引导菜单有对应入口的话，可以换一个内核试试，进系统后用 `uname -r` 确认。

这些事挺烦的，尤其是我只想打开个文件，最后却在看下载日志。真到重装，我还是想自己挑一遍软件。先让网络和声音正常，再打开 Obsidian 打一句中文。WhiteSur Dark 可以等到有空再装。至于系统更新，我会先看 Arch 公告，刷新包数据库时做全量升级。[ArchWiki 的系统维护说明](https://wiki.archlinux.org/title/System_maintenance)
