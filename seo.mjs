// Shared build-time metadata. No invented domain, release, rating or review data.
export const repository='https://github.com/Master-Bayesian/Nioh3-Scroll-Generator';
export const locales=['zh-CN','zh-TW','en-US'];
export const routes={'zh-CN':'','zh-TW':'zh-hant/','en-US':'en/'};
export const metadata={
  'zh-CN':{
    title:'Nioh3Studio - 仁王3修改器 | 绘卷、装备与存档编辑',
    description:'Nioh3Studio 是一款免费的仁王3 PC 修改工具，支持绘卷搜索与生成、装备词条编辑、游戏内实时修改、存档管理及备份恢复。',
    imageAlt:'Nioh 3 Studio：装备、绘卷与存档编辑工具',author:'独脚踏鞴工作室',ogLocale:'zh_CN'
  },
  'zh-TW':{
    title:'Nioh3Studio - 仁王3修改器 | 繪卷、裝備與存檔編輯',
    description:'Nioh3Studio 是一款免費的仁王3 PC 修改工具，支援繪卷搜尋與生成、裝備詞條編輯、遊戲內即時修改、存檔管理及備份還原。',
    imageAlt:'Nioh 3 Studio：裝備、繪卷與存檔編輯工具',author:'獨腳踏鞴工作室',ogLocale:'zh_TW'
  },
  'en-US':{
    title:'Nioh3Studio - Nioh 3 Trainer | Scroll, Equipment & Save Editor',
    description:'Nioh3Studio is a free PC tool for Nioh 3. Find and generate scrolls, edit equipment effects, make in-game changes, and manage, back up or restore saves.',
    imageAlt:'Nioh 3 Studio: equipment, scroll and save editing tools',author:'Ippon-Datara Studio',ogLocale:'en_US'
  }
};
export const escapeHTML=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function validateSiteUrl(value){
  if(value===null||value===undefined||value==='')return null;
  const url=new URL(value);
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('siteUrl must be an HTTPS site root without credentials, query or fragment.');
  if(['localhost','127.0.0.1','0.0.0.0','[::1]'].includes(url.hostname))throw Error('A loopback URL is not a production site URL.');
  if(!url.pathname.endsWith('/'))url.pathname+='/';
  return url.href;
}
export function softwareSchema(locale,siteUrl=null){
  const m=metadata[locale];
  return {
    '@context':'https://schema.org','@type':'SoftwareApplication',name:'Nioh 3 Studio',alternateName:'Nioh3Studio',
    description:m.description,applicationCategory:'UtilitiesApplication',operatingSystem:'Windows x64',
    isAccessibleForFree:true,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'},
    author:{'@type':'Organization',name:m.author},downloadUrl:repository+'/releases/latest',sameAs:repository,
    ...(siteUrl?{url:new URL(routes[locale],siteUrl).href,image:new URL('shared/assets/social-card.png',siteUrl).href}:{})
  };
}
export function seoHead(locale,{siteUrl=null,imagePrefix='../shared/assets/'}={}){
  const m=metadata[locale];
  const meta=(key,value,property=false)=>`<meta ${property?'property':'name'}="${key}" content="${escapeHTML(value)}">`;
  const image=siteUrl?new URL('shared/assets/social-card.png',siteUrl).href:imagePrefix+'social-card.png';
  const url=siteUrl?new URL(routes[locale],siteUrl).href:null;
  return [
    meta('description',m.description),`<title>${escapeHTML(m.title)}</title>`,
    meta('robots','index,follow,max-image-preview:large'),meta('author',m.author),
    meta('og:type','website',true),meta('og:site_name','Nioh 3 Studio',true),meta('og:title',m.title,true),meta('og:description',m.description,true),
    meta('og:locale',m.ogLocale,true),...locales.filter(code=>code!==locale).map(code=>meta('og:locale:alternate',metadata[code].ogLocale,true)),
    meta('og:image',image,true),meta('og:image:width','1200',true),meta('og:image:height','630',true),meta('og:image:type','image/png',true),meta('og:image:alt',m.imageAlt,true),
    meta('twitter:card','summary_large_image'),meta('twitter:title',m.title),meta('twitter:description',m.description),meta('twitter:image',image),meta('twitter:image:alt',m.imageAlt),
    ...(url?[
      `<link rel="canonical" href="${escapeHTML(url)}">`,meta('og:url',url,true),
      ...locales.map(code=>`<link rel="alternate" hreflang="${code==='en-US'?'en':code}" href="${escapeHTML(new URL(routes[code],siteUrl).href)}">`),
      `<link rel="alternate" hreflang="x-default" href="${escapeHTML(siteUrl)}">`
    ]:[]),
    `<script type="application/ld+json" data-software-schema>${JSON.stringify(softwareSchema(locale,siteUrl)).replaceAll('<','\\u003c')}</script>`
  ].join('\n');
}
export function sitemap(siteUrl){
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locales.map(code=>`  <url><loc>${escapeHTML(new URL(routes[code],siteUrl).href)}</loc></url>`).join('\n')}\n</urlset>\n`;
}
