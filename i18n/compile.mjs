// Annotate the controlled static template; translations never replace HTML.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const catalog=JSON.parse(await fs.readFile(path.join(root,'catalog.json'),'utf8'));
const han=value=>/\p{Script=Han}/u.test(value);
const records={},used=new Set();
for(const [source,{en,tw}] of Object.entries(catalog)) {
  if(!en||!tw)throw Error(`Incomplete translation: ${source}`);
  const key='m'+createHash('sha256').update(source).digest('hex').slice(0,10);
  if(records[key])throw Error('Translation key collision');
  records[key]=[source,tw,en];
}
const keys=new Map(Object.entries(records).map(([key,[source]])=>[source,key]));
export function registerTranslations(entries){
  for(const [source,{en,tw}] of Object.entries(entries)){
    if(!source||!en||!tw)throw Error('Incomplete data-driven translation.');
    const key='m'+createHash('sha256').update(source).digest('hex').slice(0,10);
    if(records[key]&&records[key][0]!==source)throw Error('Translation key collision');
    records[key]=[source,tw,en];
    keys.set(source,key);
    // Labels are escaped before entering the controlled HTML template.
    keys.set(source.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;'),key);
  }
  return Object.fromEntries(Object.keys(entries).map(source=>[source,keys.get(source)]));
}
const keyFor=source=>{
  const key=keys.get(source);
  if(!key)throw Error(`Add a complete translation to i18n/catalog.json: ${source}`);
  used.add(key);return key;
};
export function localizeTemplate(html) {
  html=html.replace(/<title>([^<]*)<\/title>/,(_,value)=>`<title data-l10n="${keyFor(value)}">${value}</title>`);
  html=html.replace(/<[^!\/][^>]*>/g,tag=>{
    const attrs=[];
    tag.replace(/\b(aria-label|title|alt|content)="([^"]*)"/g,(_,name,value)=>{
      if(han(value))attrs.push(`data-l10n-${name}="${keyFor(value)}"`);
      return _;
    });
    return attrs.length?tag.replace(/>$/,` ${attrs.join(' ')}>`):tag;
  });
  const offset=html.indexOf('<body');
  const stack=[],voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const body=html.slice(offset).replace(/<[^>]*>|[^<]+/g,token=>{
    if(token.startsWith('<')) {
      const tag=token.match(/^<\/?([a-z][\w-]*)/i)?.[1]?.toLowerCase();
      if(!tag)return token;
      if(token.startsWith('</')) {stack.pop();return token;}
      const skip=stack.at(-1)?.skip||/\bdata-locale=|\bdata-l10n=|\blanguage-label\b|\btranslate="no"/.test(token)||['script','style','svg'].includes(tag);
      if(!voidTags.has(tag)&&!token.endsWith('/>'))stack.push({tag,skip});
      return token;
    }
    const value=token.trim();
    if(stack.at(-1)?.skip||!han(value))return token;
    const key=keyFor(value);
    return token.replace(value,`<span data-l10n="${key}">${value}</span>`);
  });
  return html.slice(0,offset)+body;
}
export async function writeTranslations() {
  await fs.writeFile(path.join(root,'../shared/translations.js'),`// Generated from i18n/catalog.json. Order: Simplified Chinese, Traditional Chinese, English.\nwindow.NiohStudioTranslations=${JSON.stringify(records)};\n`);
  await fs.writeFile(path.join(root,'coverage.json'),JSON.stringify({catalogEntries:Object.keys(records).length,templateEntries:used.size,source:'apps/workshop/ui-locales.json plus reviewed website copy and display-only item labels',locales:['zh-CN','zh-TW','en-US']},null,2));
}
export function renderLocale(html,locale){
  const index=['zh-CN','zh-TW','en-US'].indexOf(locale);
  if(index<0)throw Error('Unsupported static locale');
  const escape=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  html=html.replace(/(<(?:span|title)\b[^>]*\bdata-l10n="([^"]+)"[^>]*>)[^<]*(<\/(?:span|title)>)/g,(_,open,key,close)=>open+escape(records[key][index])+close);
  html=html.replace(/<[^!\/][^>]*>/g,tag=>{
    for(const name of ['aria-label','title','alt','content']){
      const key=tag.match(new RegExp(`data-l10n-${name}="([^"]+)"`))?.[1];
      if(key)tag=tag.replace(new RegExp(`(?<![\\w-])${name}="[^"]*"`),`${name}="${escape(records[key][index])}"`);
    }
    return tag;
  });
  return html.replace('<html lang="zh-CN"',`<html lang="${locale}" data-page-locale="${locale}"`);
}
