// Build-time data only. The public page needs no configuration fetch.
import {escapeHTML} from '../seo.mjs';

export function validateDownloads(config){
  if(!Array.isArray(config?.channels)||!config.channels.length)throw Error('downloads.json: channels must be a nonempty array.');
  const ids=new Set();
  for(const channel of config.channels){
    if(typeof channel?.id!=='string'||!/^[a-z][a-z\d-]*$/.test(channel.id)||ids.has(channel.id))throw Error('downloads.json: channel IDs must be unique lowercase identifiers.');
    ids.add(channel.id);
    for(const locale of ['zh-CN','zh-TW','en-US']){
      if(typeof channel.name?.[locale]!=='string'||!channel.name[locale].trim())throw Error(`downloads.json: ${channel.id} needs a ${locale} name.`);
    }
    let url;
    try{if(typeof channel.url!=='string')throw Error();url=new URL(channel.url);}catch{throw Error(`downloads.json: ${channel.id} has an invalid URL.`);}
    if(url.protocol!=='https:'||url.username||url.password)throw Error(`downloads.json: ${channel.id} needs an HTTPS URL without embedded credentials.`);
    if(channel.password!==undefined&&typeof channel.password!=='string')throw Error(`downloads.json: ${channel.id} password must be a string.`);
    if(channel.passwordQuery!==undefined&&!/^[a-zA-Z][\w.-]*$/.test(channel.passwordQuery))throw Error(`downloads.json: ${channel.id} has an invalid passwordQuery.`);
  }
  return config;
}

export function downloadHref(channel){
  const url=new URL(channel.url);
  if(channel.passwordQuery){
    if(channel.password)url.searchParams.set(channel.passwordQuery,channel.password);
    else url.searchParams.delete(channel.passwordQuery);
  }
  return url.href;
}

export function renderDomesticDownloads(config,chevron,nameKeys={}){
  const name=channel=>{
    const text=channel.name['zh-CN'],key=nameKeys[text];
    return key?`<span data-l10n="${escapeHTML(key)}">${escapeHTML(text)}</span>`:escapeHTML(text);
  };
  return `<details class="domestic-download"><summary class="secondary">国内下载 ${chevron}</summary><div class="download-panel">${config.channels.map(channel=>`<div class="download-channel" data-download-channel="${escapeHTML(channel.id)}"><a href="${escapeHTML(downloadHref(channel))}" target="_blank" rel="noopener"><b>${name(channel)}</b><span aria-hidden="true">↗</span></a>${channel.password?(channel.passwordQuery?'<p>提取码已填入链接</p>':`<div class="download-password"><span>密码</span><code id="${escapeHTML(channel.id)}-password" data-download-password translate="no">${escapeHTML(channel.password)}</code><button type="button" data-copy-download-password aria-label="复制提取码">复制</button></div>`):''}</div>`).join('')}<span class="sr-only" data-download-status role="status"></span></div></details>`;
}
