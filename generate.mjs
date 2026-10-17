import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {demoUI} from './shared/demo-ui.mjs';
import {engineSection} from './shared/engine-section.mjs';
import {seoHead} from './seo.mjs';
import {localizeTemplate,writeTranslations,registerTranslations} from './i18n/compile.mjs';
import {validateDownloads,renderDomesticDownloads} from './shared/downloads.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const repo='https://github.com/Master-Bayesian/Nioh3-Scroll-Generator';
const options=[{id:'a'}];
const features=[
  ['绘卷搜索与添加','按词条、恩宠和敌人筛选，预览并添加选中的绘卷。'],
  ['绘卷编辑','修改已有绘卷的基础属性与特殊效果。'],
  ['装备与道具','查看存档中的物品，编辑装备等级、属性与词条。'],
  ['装备生成','按目标词条搜索种子，预览并批量添加生成的装备。'],
  ['收藏栏','收藏绘卷与装备，快速查找，也可导入或分享装备配装码。'],
  ['存档备份与恢复','备份本地存档，也可从已有备份恢复。']
];
const qqUrl='https://qm.qq.com/cgi-bin/qm/qr?k=0qS7eJtELBBcN8_ne4B7qG-c63Ze6pIo&jump_from=webapi&authKey=OMNXRYe8Ns3exbv9xiDr6HOQca3C/F+f5dVguJS7d2NFCf5URf308buzPfPXaf2G';
const icon=(paths,extra='')=>`<svg ${extra} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const githubIcon=icon('<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.57 9.57 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" fill="currentColor" stroke="none"/>');
const bookIcon=icon('<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M5 17h15M8 3v14"/>');
const peopleIcon=icon('<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>');
const translateIcon=icon('<path d="M3 5h12M9 3v2M5 5c1 5 4 8 8 10M13 5c-1 5-4 8-9 11M14 21l4-10 4 10m-6.7-3h5.4"/>');
const themeIcon=icon('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>','class="icon-moon"')+icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>','class="icon-sun"');
const headerActions=`<nav class="header-actions" aria-label="链接与偏好"><a class="header-link header-github" href="${repo}" aria-label="GitHub">${githubIcon}<span class="header-link-label">GitHub</span></a><a class="header-link header-docs" href="${repo}#readme" aria-label="文档">${bookIcon}<span class="header-link-label">文档</span></a><details class="header-popover qq-menu"><summary aria-label="QQ群" title="QQ群">${peopleIcon}<span class="header-link-label">QQ 群</span></summary><div class="popover-panel qq-panel"><p>QQ 交流群</p><div class="group-number"><code id="qq-number">1106302479</code><button type="button" data-copy-group>复制</button></div><a class="group-join" href="${qqUrl.replaceAll('&','&amp;')}" target="_blank" rel="noopener">加入QQ群 <span aria-hidden="true">↗</span></a><span class="sr-only" data-copy-status role="status"></span></div></details><span class="header-divider" aria-hidden="true"></span><details class="header-popover language-menu"><summary class="round-control" aria-label="选择语言" title="选择语言">${translateIcon}<span class="language-label sr-only">简体中文</span></summary><div class="popover-panel language-panel" role="group" aria-label="语言"><button type="button" data-locale="zh-CN" aria-current="true">简体中文</button><button type="button" data-locale="zh-TW" lang="zh-Hant">繁體中文</button><button type="button" data-locale="en-US" lang="en">English</button></div></details><button class="theme-toggle icon-button round-control" type="button" aria-label="切换到深色模式" aria-pressed="false" hidden>${themeIcon}</button></nav>`;
const downloads=validateDownloads(JSON.parse(await fs.readFile(path.join(root,'downloads.json'),'utf8')));
const downloadNameKeys=registerTranslations(Object.fromEntries(downloads.channels.map(channel=>[channel.name['zh-CN'],{en:channel.name['en-US'],tw:channel.name['zh-TW']}])));
const domesticDownload=renderDomesticDownloads(downloads,icon('<path d="m6 9 6 6 6-6"/>','class="download-chevron"'),downloadNameKeys);
const screens=[
  {id:'equipment',label:'装备与道具',title:'查看与编辑装备',copy:'分类浏览存档中的装备与道具，查看物品详情，修改装备等级、属性和词条。',image:'equipment.png',width:1568,height:918,alt:'装备与道具界面：左侧为武器列表，右侧为装备属性与词条。'},
  {id:'search',label:'绘卷搜索',title:'搜索与添加绘卷',copy:'按词条、恩宠和敌人筛选绘卷，预览结果后选择游戏内实时添加，或添加到存档。',image:'search.png',width:1568,height:918,alt:'绘卷搜索界面：筛选条件、搜索结果及绘卷详细效果。'},
  {id:'editor',label:'绘卷编辑',title:'编辑已有绘卷',copy:'修改绘卷等级、主副词条和当前可挑战次数，也可查看洗词条与添画预测。',image:'editor.jpg',width:1602,height:1002,alt:'绘卷编辑界面：已有绘卷列表、基础信息编辑和修改预览。'},
  {id:'favorites',label:'收藏夹',title:'收藏、比较与批量添加',copy:'收藏需要的绘卷，按 ID、词条、恩宠或敌人查找，再加入购物车比较、选择和批量添加。',image:'favorites.jpg',width:1602,height:1002,alt:'收藏夹界面：多张已收藏绘卷并排展示，可搜索或加入购物车。'},
  {id:'backups',label:'存档管理',title:'备份、恢复与存档改签',copy:'查看自动备份，恢复选中的存档；也可导入其他账号的角色存档，改签后在当前账号下读取。',image:'backups.jpg',width:1602,height:1002,alt:'存档管理界面：备份时间与操作记录，以及存档改签入口。'}
];
const gallery=`<section class="interface-section wrap" id="interfaces" aria-labelledby="interfaces-title">
  <div class="section-heading"><h2 id="interfaces-title" data-i18n="sections.features">功能介绍</h2><span class="demo-label">界面演示</span></div>
  <div class="showcase" role="region" aria-label="工具界面与介绍">
    <div class="showcase-toolbar"><div class="showcase-tabs" aria-label="选择工具界面"><span class="tab-indicator" aria-hidden="true" hidden></span>${screens.map((s,i)=>`<a class="showcase-tab" data-slide="${i}" href="#screen-${s.id}"${i===0?' aria-current="true"':''}>${s.label}</a>`).join('')}</div><div class="showcase-controls" hidden><span class="slide-count" aria-live="polite" aria-atomic="true">01 / 05</span><button class="slide-arrow" type="button" data-direction="-1" aria-label="上一个工具界面">←</button><button class="slide-arrow" type="button" data-direction="1" aria-label="下一个工具界面">→</button></div></div>
    <div class="showcase-track" tabindex="0" aria-label="工具界面，可用左右方向键切换">
      ${screens.map(s=>`<article class="showcase-slide" id="screen-${s.id}" aria-labelledby="${s.id}-title"><figure class="detail-screen demo-screen">${demoUI(s.id,{label:s.alt})}</figure><div class="showcase-copy"><h3 id="${s.id}-title" data-i18n="features.${s.id}.title">${s.title}</h3><p data-i18n="features.${s.id}.description">${s.copy}</p></div></article>`).join('')}
    </div>
  </div>
</section>`;
for(const option of options){
  const dir=path.join(root,option.id);await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,'index.html'),localizeTemplate(`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><script src="../shared/translations.js"></script><script src="../shared/i18n.js"></script><script src="../shared/preferences.js"></script>${seoHead('zh-CN')}<link rel="icon" href="../shared/assets/studio-logo.png"><link rel="stylesheet" href="../shared/tokens.css"><link rel="stylesheet" href="../shared/base.css"><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="../shared/enhancements.css"><link rel="stylesheet" href="../shared/demo-ui.css"><link rel="stylesheet" href="../shared/engine.css"><script src="../shared/engine.js" defer></script><script src="../shared/interactions.js" defer></script><script src="../shared/seo.js" defer></script></head>
<body class="option-${option.id}"><a class="skip" href="#main">跳到主要内容</a><header class="site-header wrap"><a class="brand" href="#main"><img class="brand-logo" src="../shared/assets/studio-logo.png" width="512" height="512" alt="">独脚踏鞴工作室</a>${headerActions}</header>
<main id="main"><section class="hero" aria-labelledby="product-title">
  <div class="hero-scene" aria-hidden="true"><div class="scene-window">${demoUI('search',{hero:true})}</div></div>
  <div class="hero-inner wrap"><div class="hero-copy"><p class="eyebrow">《仁王3》PC 玩家工具箱</p><h1 id="product-title" lang="en">Nioh <span class="title-number">3</span> <span class="title-studio">Studio</span></h1><p class="hero-lead">仁王3修改器 · 装备与绘卷编辑工具</p>
    <ul class="hero-features">${features.map(([name,description],i)=>`<li><span class="feature-number" aria-hidden="true">0${i+1}</span><div><h2 data-i18n="summary.${i}.title">${name}</h2><p>${description}</p></div></li>`).join('')}</ul>
    <div class="hero-actions"><a class="primary" href="${repo}/releases/latest">前往 GitHub 下载 <span aria-hidden="true">↗</span></a>${domesticDownload}<a class="secondary" href="#interfaces">查看功能 <span aria-hidden="true">↓</span></a></div><p class="platform">Windows x64</p>
  </div></div>
</section>
${gallery}
${engineSection}
</main><footer class="site-footer wrap"><div><span>独脚踏鞴工作室 · Nioh 3 Studio</span><p>本工具由社区开发，与游戏官方无关联。</p></div><nav aria-label="项目链接"><a href="${repo}/releases">更新日志</a><a href="${repo}/issues">问题反馈</a></nav></footer></body></html>`));
}
await writeTranslations();
console.log('Generated Nioh 3 Studio website source.');
