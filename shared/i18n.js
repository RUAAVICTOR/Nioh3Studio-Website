(() => {
  const root=document.documentElement;
  const namespace=window.NiohStudio=window.NiohStudio||{};
  const messages=window.NiohStudioTranslations;
  const locales=['zh-CN','zh-TW','en-US'];
  const names={'zh-CN':'简体中文','zh-TW':'繁體中文','en-US':'English'};
  const sources=new Map(Object.values(messages).map(values=>[values[0],values]));
  const pageLocale=root.dataset.pageLocale;
  let locale=locales.includes(pageLocale)?pageLocale:'zh-CN';
  if(!pageLocale)try {const saved=localStorage.getItem('nioh-studio.locale');if(locales.includes(saved))locale=saved;}catch{}
  let index=locales.indexOf(locale);
  const t=source=>sources.get(source)?.[index]??source;
  root.lang=locale;root.dataset.locale=locale;
  const translatedAttributes=['aria-label','title','alt','content'];
  function applyElement(element) {
    const key=element.getAttribute('data-l10n');
    if(key&&messages[key]) {
      const value=messages[key][index];
      if(element.textContent!==value)element.textContent=value;
    }
    for(const name of translatedAttributes) {
      const key=element.getAttribute(`data-l10n-${name}`);
      if(key&&messages[key]&&element.getAttribute(name)!==messages[key][index])element.setAttribute(name,messages[key][index]);
    }
  }
  const selector='[data-l10n],[data-l10n-aria-label],[data-l10n-title],[data-l10n-alt],[data-l10n-content]';
  function applyTree(node) {
    if(node.nodeType!==Node.ELEMENT_NODE)return;
    if(node.matches(selector))applyElement(node);
    node.querySelectorAll(selector).forEach(applyElement);
  }
  function refresh() {
    document.querySelectorAll('.language-panel [data-locale]').forEach(button=>{
      if(button.tagName==='BUTTON')button.disabled=false;
      if(button.dataset.locale===locale)button.setAttribute('aria-current','true');
      else button.removeAttribute('aria-current');
    });
    const label=document.querySelector('.language-label');if(label)label.textContent=names[locale];
    const chinese=locale.startsWith('zh-');
    document.querySelectorAll('.domestic-download,.site-header .qq-menu').forEach(item=>{item.hidden=!chinese;if(!chinese)item.open=false;});
  }
  namespace.i18n={
    get locale(){return locale;},
    get availableLocales(){return [...locales];},
    t,refresh,
    setLocale(code){
      if(!locales.includes(code))return false;
      if(pageLocale&&code!==pageLocale){
        const link=document.querySelector(`.language-panel a[data-locale="${code}"]`);
        if(!link)return false;
        try {localStorage.setItem('nioh-studio.locale',code);}catch{}
        const target=new URL(link.href);target.hash=location.hash;
        location.assign(target.href);return true;
      }
      locale=code;index=locales.indexOf(code);root.lang=code;root.dataset.locale=code;
      try {localStorage.setItem('nioh-studio.locale',code);}catch{}
      applyTree(root);refresh();
      document.querySelectorAll('[data-copy-group],[data-copy-download-password]').forEach(button=>{button.textContent=t('复制');});
      document.querySelectorAll('[data-copy-status],[data-download-status]').forEach(status=>{status.textContent='';});
      document.dispatchEvent(new CustomEvent('nioh:localechange',{detail:{locale:code}}));
      return true;
    }
  };
  // Translate parser-inserted content before paint when a saved locale exists.
  const observer=new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes) {
      if(node.nodeType===Node.ELEMENT_NODE)applyTree(node);
      else if(node.parentElement?.matches(selector))applyElement(node.parentElement);
    }
  });
  observer.observe(root,{childList:true,subtree:true});
  function ready(){applyTree(root);refresh();observer.disconnect();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
