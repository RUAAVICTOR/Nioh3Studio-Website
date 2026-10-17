// Keep sharing metadata consistent when switching the one-URL local prototype.
(() => {
  function sync(){
    const locale=window.NiohStudio.i18n.locale;
    const codes={'zh-CN':'zh_CN','zh-TW':'zh_TW','en-US':'en_US'};
    const meta=document.querySelector('meta[property="og:locale"]');if(meta)meta.content=codes[locale];
    document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((node,index)=>{node.content=Object.values(codes).filter(code=>code!==codes[locale])[index];});
    const script=document.querySelector('[data-software-schema]');
    if(script){
      const data=JSON.parse(script.textContent);
      data.description=document.querySelector('meta[name="description"]').content;
      data.author.name=document.querySelector('meta[name="author"]').content;
      script.textContent=JSON.stringify(data);
    }
  }
  document.addEventListener('nioh:localechange',sync);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
