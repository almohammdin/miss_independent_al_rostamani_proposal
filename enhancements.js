'use strict';
// English on entry; an explicit ?lang=ar remains available for a shared Arabic view.
function showLang(requested){
  const lang=requested==='ar'?'ar':'en';
  const oldHash=location.hash;
  document.documentElement.lang=lang==='ar'?'ar-SA':'en';
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.body.classList.toggle('en-mode',lang==='en');
  document.querySelectorAll('.lang-panel').forEach(el=>el.hidden=el.dataset.lang!==lang);
  document.querySelectorAll('[data-i18n]').forEach(el=>el.hidden=el.dataset.i18n!==lang);
  document.querySelectorAll('[data-lang-btn]').forEach(btn=>{
    btn.classList.toggle('primary',btn.dataset.langBtn===lang);
    btn.setAttribute('aria-pressed',String(btn.dataset.langBtn===lang));
  });
  document.querySelectorAll('[data-nav-base]').forEach(a=>a.href='#'+(lang==='en'?'en-':'')+a.dataset.navBase);
  document.querySelectorAll('[data-href-ar]').forEach(a=>a.href=lang==='ar'?a.dataset.hrefAr:a.dataset.hrefEn);
  if(oldHash){
    const base=oldHash.replace(/^#(?:en-)?/,'');
    const next='#'+(lang==='en'?'en-':'')+base;
    if(document.getElementById(next.slice(1)))history.replaceState(null,'',location.pathname+location.search+next);
  }
  document.querySelectorAll('.sponsor-tools').forEach(form=>filterSponsors(form));
  openHash();
}
function openHash(){
  const target=document.getElementById(location.hash.slice(1));
  if(!target||target.closest('.lang-panel')?.hidden)return;
  let parent=target;
  while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
  target.scrollIntoView({block:'start',behavior:'instant'});
}
function filterSponsors(form){
  const panel=form.closest('.lang-panel');
  const query=form.querySelector('input').value.trim().toLocaleLowerCase();
  const category=form.querySelector('select').value;
  const cards=[...panel.querySelectorAll('.sponsor-card')];
  let visible=0;
  cards.forEach(card=>{
    const match=(!query||card.textContent.toLocaleLowerCase().includes(query))&&(category==='all'||card.dataset.category===category);
    card.hidden=!match;if(match)visible++;
  });
  const ar=panel.dataset.lang==='ar';
  panel.querySelector('.results-status').textContent=ar?`عرض ${visible} من ${cards.length} جهة — افتحي البطاقة لقراءة التفاصيل`:`Showing ${visible} of ${cards.length} prospects — expand a card for details`;
  panel.querySelector('.empty-state').hidden=visible!==0;
}
function showToast(msg){
  const t=document.getElementById('toast');if(!t)return;
  t.textContent=msg;t.classList.add('show');
  clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),1800);
}
document.addEventListener('DOMContentLoaded',()=>{
  showLang(new URLSearchParams(location.search).get('lang')==='ar'?'ar':'en');
  document.querySelectorAll('.sponsor-tools').forEach(form=>{
    form.addEventListener('submit',e=>e.preventDefault());
    form.addEventListener('input',()=>filterSponsors(form));
    form.addEventListener('change',()=>filterSponsors(form));
  });
});
document.addEventListener('pointerdown',()=>document.body.dataset.input='pointer');
document.addEventListener('keydown',()=>document.body.dataset.input='keyboard');
window.addEventListener('hashchange',openHash);
document.addEventListener('click',event=>{
  const anchor=event.target.closest('a[href^="#"]');
  if(!anchor)return;
  let target=document.getElementById(anchor.hash.slice(1));
  while(target){if(target.tagName==='DETAILS')target.open=true;target=target.parentElement;}
});
let printState=[];
window.addEventListener('beforeprint',()=>{
  printState=[...document.querySelectorAll('.lang-panel:not([hidden]) details')].map(el=>[el,el.open]);
  printState.forEach(([el])=>el.open=true);
});
window.addEventListener('afterprint',()=>{printState.forEach(([el,open])=>el.open=open);printState=[];});
