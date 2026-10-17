import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeIndent} from '../shared/code-excerpts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(process.env.WEBSITE_TEST_DIST??path.join(root,'dist'));
const report=JSON.parse(await fs.readFile(path.join(output,'build-report.json'),'utf8'));
const source=JSON.parse(await fs.readFile(path.join(root,'shared/engine-excerpts.json'),'utf8'));

for(const [locale,route] of [['zh-CN',''],['zh-TW','zh-hant/'],['en-US','en/']]){
  test(`crawlable ${locale} page and assets`,async()=>{
    const directory=path.join(output,route),html=await fs.readFile(path.join(directory,'index.html'),'utf8');
    assert.ok(html.includes(`<html lang="${locale}"`));
    assert.equal((html.match(/<h1\b/g)||[]).length,1);
    assert.ok(html.includes('name="robots" content="index,follow'));
    assert.equal((html.match(/class="feature-number"/g)||[]).length,6);
    assert.equal((html.match(/class="showcase-slide"/g)||[]).length,5);
    assert.ok(!html.includes('class="du-header"'));
    assert.ok(!html.includes('data-engine-tab="conflict"'));
    assert.ok(!html.includes('data-engine-tab="replay"'));
    assert.ok(html.includes('data-engine-tab="equipment-seeds"'));
    assert.ok(html.includes('data-engine-tab="equipment-effects"'));
    assert.equal((html.match(/class="engine-code-line"/g)||[]).length,50);
    assert.ok(html.includes('https://github.com/Master-Bayesian/Nioh3-Scroll-Generator/releases/latest'));
    if(locale==='en-US'){
      assert.ok(html.includes('<details hidden class="header-popover qq-menu"'));
      assert.ok(html.includes('<details hidden class="domestic-download"'));
      const prose=html.match(/<div class="engine-copy">([\s\S]*?)<div class="engine-window">/)[1];
      assert.ok(!/\p{Script=Han}/u.test(prose));
    }
    for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
      const ref=match[1];
      if(ref.startsWith('#')||/^[a-z][a-z\d+.-]*:/i.test(ref))continue;
      const asset=path.resolve(directory,ref.split('#')[0]);
      assert.ok(asset.startsWith(output+path.sep),`Asset escapes output: ${ref}`);
      await fs.access(asset);
    }
    if(report.siteUrl){
      const canonical=new URL(route,report.siteUrl).href;
      assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
      assert.equal((html.match(/rel="alternate" hreflang=/g)||[]).length,4);
      assert.ok(html.includes(new URL('shared/assets/social-card.png',report.siteUrl).href));
    }
  });
}

test('deployment output contains only public website files',async()=>{
  await fs.access(path.join(output,'.nojekyll'));
  for(const name of ['generate.mjs','package.json','.git','.github','engine-excerpts.json','node_modules','README.md']){
    assert.equal(await fs.access(path.join(output,name)).then(()=>true,()=>false),false,name);
  }
  const robots=await fs.readFile(path.join(output,'robots.txt'),'utf8');
  assert.ok(robots.includes('Allow: /'));
  if(report.siteUrl){
    const sitemap=await fs.readFile(path.join(output,'sitemap.xml'),'utf8');
    for(const route of ['','zh-hant/','en/'])assert.ok(sitemap.includes(`<loc>${new URL(route,report.siteUrl).href}</loc>`));
    assert.ok(robots.includes(new URL('sitemap.xml',report.siteUrl).href));
  }
});

test('source normalization preserves nesting and string whitespace',()=>{
  assert.equal(normalizeIndent('    for seed in seeds {\n        let text = "a  b";\n        if ok {\n            continue;\n        }\n    }'),'for seed in seeds {\n    let text = "a  b";\n    if ok {\n        continue;\n    }\n}');
  assert.equal(normalizeIndent('\tfor seed in seeds {\n\t\tlet text = "a\tb";\n\t}'),'for seed in seeds {\n    let text = "a\tb";\n}');
  assert.equal(normalizeIndent('   \n\t\n'),'\n\n');
});

test('snapshots preserve the requested original source ranges',()=>{
  const search=source.panels['equipment-seeds'].fragments[0];
  assert.equal(search.startLine,202);assert.equal(search.endLine,215);
  const text=normalizeIndent(search.text);
  assert.ok(text.startsWith('for seed in start..end {\n    let entries ='));
  assert.ok(text.includes('\n        found.empty += 1;\n        continue;'));
  assert.equal(text.split('\n').length,14);
  const effects=source.panels['equipment-effects'].fragments[0];
  assert.equal(effects.startLine,692);assert.equal(effects.endLine,715);
});
