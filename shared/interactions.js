// Tabs crossfade within one stable workspace. No horizontal panel scrolling.
const menu=document.querySelector('.mobile-menu');
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.open=false;}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus();}
});
document.addEventListener('click',event=>{if(menu?.open&&!menu.contains(event.target))menu.open=false;});

const showcase=document.querySelector('.showcase');
if(showcase){
  const track=showcase.querySelector('.showcase-track');
  const tabsRoot=showcase.querySelector('.showcase-tabs');
  const tabs=[...showcase.querySelectorAll('.showcase-tab')];
  const slides=[...showcase.querySelectorAll('.showcase-slide')];
  const indicator=showcase.querySelector('.tab-indicator');
  const count=showcase.querySelector('.slide-count');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let current=-1,revision=0,touchStart=null;
  const placeIndicator=()=>{
    if(current<0)return;
    const tab=tabs[current];
    indicator.style.setProperty('--tab-width',tab.offsetWidth+'px');
    indicator.style.setProperty('--tab-x',tab.offsetLeft+'px');
  };
  const stopAnimations=()=>{
    revision++;
    for(const slide of slides){
      slide.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
      slide.classList.remove('is-outgoing');
    }
  };
  const go=(index,{animate=true,focus=false}={})=>{
    const next=(index+slides.length)%slides.length;
    if(next===current){if(focus)tabs[next].focus({preventScroll:true});return;}
    const previous=slides[current];
    stopAnimations();
    const activeRevision=revision;
    current=next;
    tabs.forEach((tab,i)=>{
      tab.setAttribute('aria-selected',String(i===next));
      tab.tabIndex=i===next?0:-1;
      if(i===next)tab.setAttribute('aria-current','true');else tab.removeAttribute('aria-current');
      slides[i].inert=i!==next;
      slides[i].setAttribute('aria-hidden',String(i!==next));
      slides[i].classList.toggle('is-active',i===next);
    });
    count.textContent=String(next+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
    placeIndicator();
    const tab=tabs[next],left=tabsRoot.scrollLeft,right=left+tabsRoot.clientWidth;
    if(tab.offsetLeft<left||tab.offsetLeft+tab.offsetWidth>right)
      tabsRoot.scrollTo({left:Math.max(0,tab.offsetLeft-(tabsRoot.clientWidth-tab.offsetWidth)/2),behavior:'instant'});
    if(focus)tab.focus({preventScroll:true});
    if(!previous||!animate||reduced.matches)return;
    previous.classList.add('is-outgoing');
    const incoming=slides[next],animations=[
      previous.animate([{opacity:1},{opacity:0}],{duration:120,easing:'ease-out',fill:'forwards'}),
      incoming.querySelector('figure').animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'}),
      incoming.querySelector('.showcase-copy').animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,delay:35,easing:'ease-out',fill:'backwards'})
    ];
    Promise.allSettled(animations.map(animation=>animation.finished)).then(()=>{
      if(revision!==activeRevision)return;
      previous.classList.remove('is-outgoing');
      animations.forEach(animation=>animation.cancel());
    });
  };
  tabsRoot.setAttribute('role','tablist');
  tabs.forEach((tab,i)=>{
    tab.setAttribute('role','tab');
    tab.id='tab-'+slides[i].id;
    tab.setAttribute('aria-controls',slides[i].id);
    slides[i].setAttribute('role','tabpanel');
    slides[i].setAttribute('aria-labelledby',tab.id);
    tab.addEventListener('click',event=>{event.preventDefault();go(i);});
    tab.addEventListener('keydown',event=>{
      const destination={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:slides.length-1}[event.key];
      if(destination!==undefined){event.preventDefault();go(destination,{focus:true});}
    });
  });
  showcase.querySelectorAll('.slide-arrow').forEach(button=>button.addEventListener('click',()=>go(current+Number(button.dataset.direction))));
  track.addEventListener('keydown',event=>{
    if(event.target!==track)return;
    const destination={ArrowRight:current+1,ArrowLeft:current-1,Home:0,End:slides.length-1}[event.key];
    if(destination!==undefined){event.preventDefault();go(destination);}
  });
  track.addEventListener('pointerdown',event=>{
    if(event.pointerType==='touch')touchStart={x:event.clientX,y:event.clientY};
  },{passive:true});
  track.addEventListener('pointerup',event=>{
    if(!touchStart)return;
    const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;
    touchStart=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)go(current+(dx<0?1:-1));
  },{passive:true});
  track.addEventListener('pointercancel',()=>{touchStart=null;},{passive:true});
  const selectHash=()=>{
    const index=slides.findIndex(slide=>'#'+slide.id===location.hash);
    if(index>=0)go(index,{animate:false});
  };
  go(Math.max(0,slides.findIndex(slide=>'#'+slide.id===location.hash)),{animate:false});
  indicator.hidden=false;
  showcase.querySelector('.showcase-controls').hidden=false;
  showcase.classList.add('is-enhanced');
  new ResizeObserver(placeIndicator).observe(tabsRoot);
  document.fonts.ready.then(placeIndicator);
  addEventListener('hashchange',selectHash);
  reduced.addEventListener('change',event=>{if(event.matches)stopAnimations();});
  document.addEventListener('nioh:localechange',()=>{stopAnimations();placeIndicator();});
}
