// Produce a local static hosting folder only. Never deploys or uploads anything.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderLocale} from './i18n/compile.mjs';
import {locales,routes,seoHead,sitemap,validateSiteUrl} from './seo.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
const option=name=>{const index=args.indexOf(name);return index>=0?args[index+1]:undefined;};
const config=JSON.parse(await fs.readFile(path.join(root,'seo.config.json'),'utf8'));
const variant=option('--variant')??config.variant;
if(variant!=='a')throw Error('The website repository contains only the selected A design.');
const siteUrl=validateSiteUrl(option('--site-url')??config.siteUrl);
const output=path.resolve(option('--out')??path.join(root,'dist'));
if(output===root||output===path.dirname(root))throw Error('Output must be a dedicated site directory.');
await fs.mkdir(output,{recursive:true});
const original=await fs.readFile(path.join(root,variant,'index.html'),'utf8');
for(const locale of locales){
  const route=routes[locale],prefix=route?'../':'';
  let html=renderLocale(original,locale);
  // Remove the prototype metadata head; retain its styling and local scripts.
  html=html.replace(/<meta[^>]+(?:name="(?:description|robots|author|twitter:[^"]+)"|property="og:[^"]+")[^>]*>\n?/g,'')
    .replace(/<title[^>]*>[\s\S]*?<\/title>\n?/,'')
    .replace(/<script[^>]*data-software-schema[^>]*>[\s\S]*?<\/script>\n?/,'');
  html=html.replace('</head>',seoHead(locale,{siteUrl,imagePrefix:prefix+'shared/assets/'})+'\n</head>');
  html=html.replaceAll('../shared/',prefix+'shared/').replace('href="style.css"',`href="${prefix}style.css"`);
  html=html.replace(/<button\b[^>]*data-locale="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g,(_,code,label)=>`<a data-locale="${code}" lang="${code}" hreflang="${code}" href="${prefix+routes[code]}index.html"${code===locale?' aria-current="true"':''}>${label}</a>`);
  // These entries are hidden in the English HTML even with scripts disabled.
  if(locale==='en-US')html=html.replace(/<details class="(header-popover qq-menu|domestic-download)"/g,'<details hidden class="$1"');
  // Remove the obsolete build-only translation key from the software head.
  const directory=path.join(output,route);await fs.mkdir(directory,{recursive:true});
  await fs.writeFile(path.join(directory,'index.html'),html);
}
const shared=['tokens.css','base.css','enhancements.css','demo-ui.css','engine.css','engine.js','preferences.js','interactions.js','i18n.js','translations.js','seo.js'];
await fs.mkdir(path.join(output,'shared/assets'),{recursive:true});
for(const file of shared)await fs.copyFile(path.join(root,'shared',file),path.join(output,'shared',file));
for(const file of ['studio-logo.png','social-card.png'])await fs.copyFile(path.join(root,'shared/assets',file),path.join(output,'shared/assets',file));
await fs.copyFile(path.join(root,variant,'style.css'),path.join(output,'style.css'));
await fs.copyFile(path.join(root,'ARC_LICENSE.txt'),path.join(output,'ARC_LICENSE.txt'));
await fs.copyFile(path.join(root,'LICENSE'),path.join(output,'LICENSE'));
await fs.writeFile(path.join(output,'.nojekyll'),'');
await fs.copyFile(path.join(root,'THIRD_PARTY_NOTICES.md'),path.join(output,'THIRD_PARTY_NOTICES.md'));
await fs.writeFile(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\n${siteUrl?`\nSitemap: ${new URL('sitemap.xml',siteUrl).href}\n`:''}`);
if(siteUrl)await fs.writeFile(path.join(output,'sitemap.xml'),sitemap(siteUrl));
else await fs.rm(path.join(output,'sitemap.xml'),{force:true});
const report={variant,siteUrl,output:path.relative(root,output).replaceAll(path.sep,"/"),locales,readyForDomainConfiguration:!siteUrl,absoluteUrlMetadataComplete:!!siteUrl,pending:siteUrl?[]:['Set seo.config.json siteUrl to the confirmed HTTPS public URL; rebuild for canonical, hreflang, sitemap and absolute social-image URLs.'],published:false};
await fs.writeFile(path.join(output,'build-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
