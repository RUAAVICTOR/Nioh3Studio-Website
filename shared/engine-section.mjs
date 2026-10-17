// Build-time excerpts only. The website never imports or executes the solver.
import fs from 'node:fs/promises';
import {renderCodeFragments} from './code-excerpts.mjs';
const repo='https://github.com/Master-Bayesian/Nioh3-Scroll-Generator';
const excerpts=JSON.parse(await fs.readFile(new URL('./engine-excerpts.json',import.meta.url),'utf8'));
const source=id=>{
  const panel=excerpts.panels[id],first=panel.fragments[0],last=panel.fragments.at(-1);
  const file=panel.source.split('/').at(-1);
  return '<a class="engine-source" href="'+repo+'/blob/'+panel.revision+'/'+panel.source+'#L'+first.startLine+'-L'+last.endLine+'" target="_blank" rel="noopener"><span>'+file+'</span><span aria-hidden="true">↗</span></a>';
};
const code=id=>renderCodeFragments(excerpts.panels[id],{tabWidth:excerpts.tabWidth});

export const engineSection=`<section class="engine-section wrap" id="generation-engine" aria-labelledby="engine-title">
  <div class="engine-copy">
    <p class="engine-eyebrow">绘卷生成引擎</p>
    <h2 id="engine-title">从目标词条，<br>反推生成起点。</h2>
    <p>传统修改器可以直接修改绘卷的词条，但这些修改后的词条并不一定符合游戏原本的生成结果，因此往往无法通过联机分享给其他玩家。</p>
    <p class="engine-emphasis"><strong>Nioh3Studio 采用了完全不同的技术路线。</strong></p>
    <p>我们通过逆向工程，还原了《仁王3》的绘卷生成机制。玩家只需指定想要的恩宠、主副词条及其他条件，程序就会反向搜索能够生成目标绘卷的随机种子（Seed），并调用游戏原生生成函数，将对应的绘卷添加到玩家背包中。</p>
    <p class="engine-emphasis"><strong>我们不是将词条强行拼接到绘卷上，而是让游戏按照自身的规则，生成一张原本就有可能存在的绘卷。</strong></p>
    <p>这意味着，生成的绘卷不仅符合已还原的游戏规则，还能够通过正常的联机机制分享给其他玩家。</p>
    <ul class="engine-tags" aria-label="引擎要点"><li>32-BIT RNG</li><li>CONSTRAINT SOLVING</li><li>NATIVE RULE REPLAY</li></ul>
  </div>
  <div class="engine-window">
    <div class="engine-window-heading"><span class="engine-window-mark" aria-hidden="true">{ }</span><span>NATIVE GENERATION ENGINE</span></div>
    <nav class="engine-tabs" aria-label="生成引擎原理">
      <a id="engine-tab-seed" href="#engine-seed" data-engine-tab="seed">Seed 逆向</a>
      <a id="engine-tab-equipment-seeds" href="#engine-equipment-seeds" data-engine-tab="equipment-seeds">装备种子搜索</a>
      <a id="engine-tab-equipment-effects" href="#engine-equipment-effects" data-engine-tab="equipment-effects">装备词条生成</a>
    </nav>
    <div class="engine-panels">
      <article class="engine-panel" id="engine-seed" aria-labelledby="engine-heading-seed">
        <div class="engine-panel-intro"><h3 id="engine-heading-seed">随机种子逆向求解</h3><p>32 位线性同余运算可向前推进，也可沿同一条随机序列回溯。</p></div>
        <div class="engine-equations" aria-label="随机状态递推与逆运算公式"><code>S[n+1] = (a · S[n] + 1) mod 2³²<br>S[n] = a⁻¹ · (S[n+1] − 1) mod 2³²</code></div>
        <div class="engine-code-heading"><span>PYTHON</span><span>源码节选</span></div>
        <pre class="engine-code" tabindex="0" aria-label="随机数推进与回溯源码">${code('seed')}</pre>
        ${source('seed')}
      </article>
      <article class="engine-panel" id="engine-equipment-seeds" aria-labelledby="engine-heading-equipment-seeds">
        <div class="engine-panel-intro"><h3 id="engine-heading-equipment-seeds">装备生成 · 种子搜索</h3><p>逐个生成候选装备，跳过空结果，保留同时满足目标词条的种子。</p></div>
        <div class="engine-code-heading"><span>RUST</span><span>源码节选</span></div>
        <pre class="engine-code" tabindex="0" aria-label="装备种子搜索源码">${code('equipment-seeds')}</pre>
        ${source('equipment-seeds')}
      </article>
      <article class="engine-panel" id="engine-equipment-effects" aria-labelledby="engine-heading-equipment-effects">
        <div class="engine-panel-intro"><h3 id="engine-heading-equipment-effects">装备生成 · 词条生成</h3><p>按候选词条的权重抽选，再生成数值并写入装备词条。</p></div>
        <div class="engine-code-heading"><span>RUST</span><span>源码节选</span></div>
        <pre class="engine-code" tabindex="0" aria-label="装备词条生成源码">${code('equipment-effects')}</pre>
        ${source('equipment-effects')}
      </article>
    </div>
  </div>
</section>`;
