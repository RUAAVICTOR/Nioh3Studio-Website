// Accessible, independent tab group. Without JS all three sections stay readable.
(() => {
  const windowElement=document.querySelector('.engine-window');
  if(!windowElement)return;
  const tabs=[...windowElement.querySelectorAll('[data-engine-tab]')];
  const panels=tabs.map(tab=>document.getElementById(`engine-${tab.dataset.engineTab}`));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let current=-1;
  const select=(index,{focus=false,animate=true}={})=>{
    if(index===current){if(focus)tabs[index].focus();return;}
    current=index;
    tabs.forEach((tab,i)=>{
      tab.setAttribute('aria-selected',String(i===index));
      tab.tabIndex=i===index?0:-1;
      panels[i].getAnimations().forEach(animation=>animation.cancel());
      panels[i].inert=i!==index;
      panels[i].setAttribute('aria-hidden',String(i!==index));
      panels[i].classList.toggle('is-active',i===index);
    });
    if(focus)tabs[index].focus();
    if(animate&&!reduced.matches)panels[index].animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'ease-out'});
  };
  windowElement.querySelector('.engine-tabs').setAttribute('role','tablist');
  tabs.forEach((tab,index)=>{
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',panels[index].id);
    panels[index].setAttribute('role','tabpanel');
    panels[index].setAttribute('aria-labelledby',tab.id);
    panels[index].tabIndex=0;
    tab.addEventListener('click',event=>{event.preventDefault();select(index);});
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();select(next,{focus:true});}
    });
  });
  const hashIndex=panels.findIndex(panel=>`#${panel.id}`===location.hash);
  select(hashIndex<0?0:hashIndex,{animate:false});
  windowElement.classList.add('engine-enhanced');
  addEventListener('hashchange',()=>{
    const index=panels.findIndex(panel=>`#${panel.id}`===location.hash);
    if(index>=0)select(index);
  });
})();
