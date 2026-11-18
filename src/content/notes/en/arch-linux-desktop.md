---
title: On this Arch desktop, I decide what gets installed
description: Why I like choosing what goes on my Arch machine, and what I still miss about Windows.
date: 2026-11-18
category: Daily
tags: [Arch Linux, KDE Plasma, Linux]
---

My Arch machine has Edge and QQ on it. That’s exactly what I like about the setup. I can install the apps I want and skip the ones I’d only have to remove later. qBittorrent is a standalone AppImage. If I ever stop using it, I know where to find it.

I run KDE Plasma 6 on Wayland. I picked WhiteSur Dark for Plasma and kept Breeze for GTK 3 buttons and menus, with WhiteSur Dark icons. The menus still look a little different. I can live with that. Most days I open Dolphin and Konsole. JetBrains Mono looks good in the terminal, Noto CJK handles Chinese text, and Fcitx 5 defaults to Pinyin with the Rime add-on installed. The root filesystem is ext4, and PipeWire and WirePlumber handle audio.

There’s plenty installed. VS Code, Node.js, npm, CMake, Ninja, and Octave are in the pacman package list. MATLAB is installed separately. Edge, QQ, Obsidian, XMind, VYM, ONLYOFFICE, Adobe Reader, and KRDC are Flatpaks. I also have Clash Verge Rev, Tailscale, and Paru. For a reinstall, I’d save the output of `pacman -Qqe`, `pacman -Qqm`, and `flatpak list --app`, plus a note on where the qBittorrent Enhanced Edition AppImage and MATLAB came from.

## Sometimes I just want to double-click an installer

If I’m in a hurry to open an engineering project, I still miss Windows. There’s a lot of software for it, and when a course calls for a particular tool, there’s often a Windows installer ready to go. License costs matter, too. When you’re a student on a tight budget and the assignment calls for commercial software, the fact that pirated copies of many Windows engineering tools are easy to find makes them easier to get started with.

I like Windows 10 for a simple two-window split. Put the reference on the left and the code on the right with `Win + Arrow`. With a PDF, editor, and terminal all open, I’d reach for `Win + Z` in Windows 11 and pick a preset layout. That’s handy when I just want to get back to work. [Microsoft’s guide to snapping windows](https://support.microsoft.com/en-gb/windows/experience/snap-your-windows)

## When something gets stuck

The Flathub logs show timeouts and an SSL connection error. Having Clash installed tells me very little about the route Flatpak took that day. Next time it stalls, I’d try the same remote from a terminal before touching the proxy settings. It’s tempting to flip a few switches when the progress bar sits there. By the time the download works, I’d have no idea which change mattered.

qBittorrent and a MathWorks process both left core dumps. If it happens again, I’ll write down what I just clicked, then match the time in `coredumpctl list` and `coredumpctl info`. For qBittorrent, I’d start my usual AppImage from a terminal so I can still see what it printed when the window disappears. The existing records pin down the crashes and leave the causes open.

The kernel log also has ACPI messages containing `AE_NOT_FOUND` and `AE_ALREADY_EXISTS`. I haven’t tied either to a specific problem with sleep or a peripheral. If the machine has trouble waking up, that’s when I’d check `journalctl -k -b`. Both `linux` and `linux-lts` are installed. With boot entries for both, I can try the other kernel and check which one I’m running with `uname -r`.

This is the part that gets on my nerves. I just want to open a file and somehow I’m reading download logs. If I had to reinstall, I’d still want to pick the software myself. I’d get networking and sound working, then open Obsidian and type a sentence in Chinese. WhiteSur Dark can wait until I have time. For system updates, I check Arch News first and do a full upgrade when I refresh the package database. [ArchWiki system maintenance guide](https://wiki.archlinux.org/title/System_maintenance)
