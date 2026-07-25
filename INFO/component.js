
class Component extends DCLogic {
  constructor(props){
    super(props);
    this.PROJECTS = [
      {id:'oqdaryo', name:'Oq Daryo', cls:'Komfort+', district:'Yunusobod', deadline:'IV chorak 2026', status:'sotuvda', statusLabel:'Sotuvda', floors:9, blocks:['A','B','C'], entrances:2, priceFrom:420, seed:3, tag:'Yopiq hovli', ppm2:11},
      {id:'yangihayot', name:'Yangi Hayot', cls:'Biznes', district:'Mirzo Ulug\u2018bek', deadline:'II chorak 2027', status:'start', statusLabel:'Sotuv boshlandi', floors:12, blocks:['A','B'], entrances:3, priceFrom:610, seed:7, tag:'Biznes-klass', ppm2:14},
      {id:'chorbog', name:'Chorbog\u2018 Park', cls:'Komfort', district:'Chilonzor', deadline:'Topshirilgan', status:'topshirilgan', statusLabel:'Topshirilgan', floors:7, blocks:['A','B','C'], entrances:2, priceFrom:360, seed:5, tag:'Tayyor uy', ppm2:9}
    ];
    this.state = {
      screen:'home', lang:'uz', heroIndex:0,
      projectId:'oqdaryo', chessStep:'A', blockId:null, entrance:1,
      apt:null, aptBlock:null, chessView:'grid',
      flt:{rooms:[], area:130, price:2000, floor:1},
      mort:{price:600, down:30, term:20},
      mg:{price:600, down:30, term:20},
      catCls:'all', catStatus:'all',
      hsearch:'', hcls:'all', hrooms:'all', hprice:1500,
      toast:null
    };
    this.STATUS = {
      bosh:{label:'Bo\u2018sh', color:'var(--free)', bg:'var(--free-bg)', ln:'var(--free)'},
      band:{label:'Band', color:'var(--busy)', bg:'var(--busy-bg)', ln:'var(--busy)'},
      sotilgan:{label:'Sotilgan', color:'var(--sold)', bg:'var(--sold-bg)', ln:'var(--sold-ln)'}
    };
  }

  /* ---------- helpers ---------- */
  fmt(n){ return Math.round(n).toLocaleString('ru-RU'); }
  proj(){ return this.PROJECTS.find(p=>p.id===this.state.projectId) || this.PROJECTS[0]; }
  projStatusColor(p){ return p.status==='sotuvda'?{bg:'var(--free-bg)',c:'var(--free)'}:p.status==='start'?{bg:'var(--blue-050)',c:'var(--blue)'}:{bg:'var(--sold-bg)',c:'var(--sold)'}; }

  genFloors(p, block, entrance){
    const roomsByCol=[0,1,2,3,2];
    const areaByRooms={0:34,1:47,2:60,3:85};
    const bIdx = (p.blocks||['A']).indexOf(block)+1;
    const floors=[];
    for(let f=p.floors; f>=1; f--){
      const cells=[];
      for(let c=0;c<5;c++){
        const rooms=roomsByCol[c];
        const area = (c===4?56:areaByRooms[rooms]) + (f%3) + (c===2?2:0);
        const price = Math.round(area*p.ppm2 + f*4 + bIdx*3);
        let key=(f*5 + c*3 + p.seed + bIdx*2 + (entrance||1))%12;
        if(f<=2) key = key%4;
        const status = key<3?'sotilgan' : key<5?'band' : 'bosh';
        const orient=['Janub','Sharq','G\u2018arb','Shimol','Janubi-sharq'][c];
        cells.push({ id:p.id+'-'+block+'-'+f+'-'+c, f, c, block, rooms,
          roomsShort: rooms===0?'S':rooms+'x', roomsLabel: rooms===0?'Studiya':rooms+' xonali',
          area, price, ppm2:(price/area).toFixed(1), status, orient,
          priceLabel:this.fmt(price)+' mln', floorLabel:f+'-qavat' });
      }
      floors.push({floor:f, cells});
    }
    return floors;
  }
  blockFree(p, block){ return this.genFloors(p, block, 1).reduce((s,r)=>s+r.cells.filter(c=>c.status==='bosh').length,0); }
  projTotalFree(p){ return (p.blocks||['A']).reduce((s,b)=>s+this.blockFree(p,b),0); }

  cellPassesFilter(c){
    const f=this.state.flt;
    if(f.rooms.length && !f.rooms.includes(c.rooms)) return false;
    if(c.area > f.area) return false;
    if(c.price > f.price) return false;
    if(c.f < f.floor) return false;
    return true;
  }
  cellStyle(c, active){
    const st=this.STATUS[c.status];
    const clickable = c.status!=='sotilgan';
    return {
      width:'100%', minWidth:'62px', height:'50px', border:'1.5px solid '+st.ln,
      background:st.bg, color:st.color, borderRadius:'9px',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1px',
      cursor: clickable?'pointer':'not-allowed',
      opacity: active?1:0.22, transition:'all .18s ease',
      pointerEvents: active?'auto':'none', boxShadow:'none'
    };
  }

  /* ---------- nav ---------- */
  _top(){ requestAnimationFrame(()=>{ try{ const s=document.scrollingElement||document.documentElement; s.scrollTop=0; }catch(e){} }); }
  go(screen){ if(screen==='project'){ this.setState({screen:'project'}); } else this.setState({screen}); this._top(); if(this._mob) this._mob.style.display='none'; }
  openProject(id){ this._pjIdx=0; this.setState({screen:'project', projectId:id}); this._top(); }
  startChess(){ this.setState({screen:'chess', chessStep:'A', blockId:null}); this._top(); }
  selBlock(b){ this.setState({chessStep:'B', blockId:b, entrance:1}); this._top(); }
  selEntrance(e){ this.setState({chessStep:'C', entrance:e, flt:{rooms:[],area:130,price:2000,floor:1}}); this._top(); }
  openApt(cell){ const p=this.proj(); this.setState({screen:'apartment', apt:cell, aptBlock:cell.block, mort:{price:cell.price, down:30, term:20}}); this._top(); this._syncRanges(cell.price); }
  _syncRanges(price){ requestAnimationFrame(()=>{ const d=document.querySelector('#mk-root [data-mort=down]'); if(d)d.value=30; const t=document.querySelector('#mk-root [data-mort=term]'); if(t)t.value=20; }); }

  toggleRoom(r){ const rooms=this.state.flt.rooms.slice(); const i=rooms.indexOf(r); if(i>=0)rooms.splice(i,1); else rooms.push(r); this.setState({flt:{...this.state.flt, rooms}}); }
  resetFilters(){ this.setState({flt:{rooms:[],area:130,price:2000,floor:1}}); const root=document.getElementById('mk-root'); if(root){ const a=root.querySelector('[data-flt=area]'); if(a)a.value=130; const pr=root.querySelector('[data-flt=price]'); if(pr)pr.value=2000; const fl=root.querySelector('[data-flt=floor]'); if(fl)fl.value=1; } }

  mortMonthly(m){ const P=m.price*(1-m.down/100)*1e6; const r=0.16/12; const n=m.term*12; const val = r? P*r/(1-Math.pow(1+r,-n)) : P/n; return val; }

  showToast(msg){ this.setState({toast:msg}); const box=document.querySelector('#mk-root [data-toastbox]'); const txt=document.querySelector('#mk-root [data-toasttext]'); if(box){ if(txt) txt.textContent=msg; box.style.transform='translateX(-50%) translateY(0)'; clearTimeout(this._tt); this._tt=setTimeout(()=>{ box.style.transform='translateX(-50%) translateY(140%)'; },2600); } }

  componentDidMount(){
    const root=document.getElementById('mk-root'); if(!root) return; this._root=root;
    this._mob=root.querySelector('[data-mobmenu]');
    // nav buttons (data-nav)
    root.addEventListener('click',(e)=>{
      const nb=e.target.closest('[data-nav]'); if(nb){ const s=nb.getAttribute('data-nav'); if(s==='project'){ this.openProject(this.state.projectId); } else this.go(s); return; }
      const tb=e.target.closest('[data-toast]'); if(tb){ this.showToast(tb.getAttribute('data-toast')); return; }
      const lg=e.target.closest('[data-lang]'); if(lg){ this.setLang(lg.getAttribute('data-lang')); return; }
      const bg=e.target.closest('[data-burger]'); if(bg){ if(this._mob) this._mob.style.display = this._mob.style.display==='flex'?'none':'flex'; return; }
      // hero controls
      if(e.target.closest('[data-hero-prev]')){ this.heroGo(-1); this._heroRestart(); return; }
      if(e.target.closest('[data-hero-next]')){ this.heroGo(1); this._heroRestart(); return; }
      if(e.target.closest('[data-pjhero-prev]')){ this.pjHeroGo(-1); return; }
      if(e.target.closest('[data-pjhero-next]')){ this.pjHeroGo(1); return; }
      const dot=e.target.closest('[data-hero-dot]'); if(dot){ this.heroSet(parseInt(dot.getAttribute('data-hero-dot'))); this._heroRestart(); return; }
    });
    // range inputs
    root.addEventListener('input',(e)=>{
      const t=e.target;
      if(t.dataset.flt){ this.setState({flt:{...this.state.flt, [t.dataset.flt]: parseFloat(t.value)}}); }
      else if(t.dataset.mort){ this.setState({mort:{...this.state.mort, [t.dataset.mort]: parseFloat(t.value)}}); }
      else if(t.dataset.mg){ this.setState({mg:{...this.state.mg, [t.dataset.mg]: parseFloat(t.value)}}); }
      else if(t.hasAttribute('data-hsearch')){ this.setState({hsearch:t.value}); }
      else if(t.hasAttribute('data-hprice')){ this.setState({hprice:parseFloat(t.value)}); }
    });
    // forms
    root.addEventListener('submit',(e)=>{ e.preventDefault(); this.showToast('Arizangiz qabul qilindi — tez orada bog\u2018lanamiz'); e.target.reset&&e.target.reset(); });
    // responsive
    const onResize=()=>{ const m=innerWidth<900; if(m!==this.state.isMobile) this.setState({isMobile:m}); this._applyResponsive(m); };
    this._applyResponsive=(m)=>{ const nl=root.querySelector('[data-navlinks]'); const cta=root.querySelector('header [data-nav=catalog]'); const bur=root.querySelector('[data-burger]');
      if(nl) nl.style.display=m?'none':'flex'; if(bur) bur.style.display=m?'block':'none';
      root.querySelectorAll('[data-projgrid],[data-mortgrid],[data-aptgrid],[data-projcontact]').forEach(g=>{ g.style.gridTemplateColumns=m?'1fr':''; });
      const pg=root.querySelector('[data-projgallery]'); if(pg){ pg.style.gridTemplateColumns=m?'1fr':'2fr 1fr'; pg.style.gridTemplateRows=m?'auto':'1fr 1fr'; pg.style.height=m?'auto':''; }
      const cg=root.querySelector('[data-chessgrid]'); if(cg) cg.style.gridTemplateColumns=m?'1fr':'250px minmax(0,1fr)';
      const fc=root.querySelector('[data-footcols]'); if(fc) fc.style.gridTemplateColumns=m?'1fr 1fr':'';
    };
    addEventListener('resize',onResize); onResize();
    // hero dots
    const dotsBox=root.querySelector('[data-hero-dots]');
    if(dotsBox){ for(let i=0;i<this.heroCount();i++){ const d=document.createElement('button'); d.setAttribute('data-hero-dot',i); d.style.cssText='height:9px;width:'+(i===0?'26px':'9px')+';border-radius:20px;border:none;background:'+(i===0?'#fff':'rgba(255,255,255,.5)')+';cursor:pointer;transition:all .3s ease;padding:0;box-shadow:0 1px 4px rgba(0,0,0,.2);'; dotsBox.appendChild(d); } }
    // hero autoplay
    this._heroRestart=()=>{ clearInterval(this._hero); this._hero=setInterval(()=>{ if(this.state.screen==='home') this.heroGo(1); },5000); };
    this._heroRestart();
    this.applyLang();
  }
  componentDidUpdate(){ this.applyLang(); if(this._applyResponsive) this._applyResponsive(innerWidth<900); }

  /* ---------- news ---------- */
  newsList(){ return [
    {id:'n1', cat:'Sotuvlar', date:'8 Iyul 2026', img:'uploads/DJI_20260625064133_0060_D_edd307f13b.jpg', title:'Oq Daryo majmuasida yangi blok sotuvi boshlandi', excerpt:'C blokdagi studiyadan 4 xonaligacha kvartiralar endi shaxmatka orqali onlayn tanlash uchun ochiq.', body:['Oq Daryo turar-joy majmuasining C bloki sotuvga chiqarildi. Blok 9 qavatdan iborat bo\u2018lib, studiyadan to\u2018rt xonali kvartiralargacha bo\u2018lgan planirovkalarni o\u2018z ichiga oladi.','Xaridorlar endi saytdagi interaktiv shaxmatka orqali qavat, pod\u2018yezd va kvartirani mustaqil tanlashlari, narx va maydonni ko\u2018rishlari mumkin. Boshlang\u2018ich narx 420 mln so\u2018mdan.','Ochilish munosabati bilan iyul oyi davomida band qilganlar uchun maxsus to\u2018lov jadvali amal qiladi.']},
    {id:'n2', cat:'Tadbirlar', date:'1 Iyul 2026', img:'uploads/IMGL_0248_2_755a5bdd99.jpg', title:'Yangi savdo-xizmat markazi tantanali ochildi', excerpt:'Majmua hududida rezidentlar uchun yangi ijtimoiy infratuzilma ob\u2019ekti foydalanishga topshirildi.', body:['Karvon Stroy navbatdagi ijtimoiy ob\u2019ektni ochdi. Tantanali marosimda kompaniya rahbariyati va hamkorlar ishtirok etdi.','Yangi markaz rezidentlarga kundalik xizmatlar, do\u2018konlar va maishiy xizmat nuqtalarini bir joyda taqdim etadi.','Bu majmua infratuzilmasini yanada qulay va to\u2018liq qilish yo\u2018lidagi keyingi qadamdir.']},
    {id:'n3', cat:'Kompaniya', date:'24 Iyun 2026', img:'uploads/N016751_a341688bb7.jpg', title:'Karvon Stroy hamkor banklar ro\u2018yxatini kengaytirdi', excerpt:'Endi yetakchi banklar bilan hamkorlikda 15% boshlang\u2018ich to\u2018lov bilan ipoteka rasmiylashtirish mumkin.', body:['Karvon Stroy mijozlar uchun ipoteka imkoniyatlarini kengaytirdi. Yangi hamkorlik doirasida boshlang\u2018ich to\u2018lov 15% dan boshlanadi, muddat esa 25 yilgacha.','Ariza saytimiz orqali onlayn topshiriladi va menejer 24 soat ichida bog\u2018lanadi.','Kalkulyator yordamida oylik to\u2018lovni oldindan hisoblab olishingiz mumkin.']}
  ]; }
  openNews(id){ this.setState({screen:'news', newsId:id}); this._top(); if(this._mob) this._mob.style.display='none'; }

  /* ---------- hero (image carousel) ---------- */
  heroCount(){ return 5; }
  heroGo(d){ const n=this.heroCount(); this.heroSet((this.state.heroIndex+d+n)%n); }
  heroSet(i){ this.setState({heroIndex:i}); const root=this._root; if(!root)return;
    root.querySelectorAll('[data-hero-slide]').forEach((el,j)=>{ el.style.opacity=j===i?'1':'0'; });
    root.querySelectorAll('[data-hero-dot]').forEach((d,j)=>{ d.style.width=j===i?'26px':'9px'; d.style.background=j===i?'#fff':'rgba(255,255,255,.5)'; });
  }

  /* ---------- project hero ---------- */
  pjHeroGo(d){ const root=this._root; if(!root)return; const slides=root.querySelectorAll('[data-pjhero-slide]'); if(!slides.length)return; const n=slides.length; this._pjIdx=((this._pjIdx||0)+d+n)%n; slides.forEach((el,j)=>{ el.style.opacity=j===this._pjIdx?'1':'0'; }); }

  /* ---------- lang ---------- */
  setLang(l){ this.setState({lang:l}); const root=this._root; if(root){ root.querySelectorAll('[data-lang]').forEach(b=>{ const on=b.getAttribute('data-lang')===l; b.style.background=on?'var(--blue)':'transparent'; b.style.color=on?'#fff':'var(--slate)'; }); } }
  applyLang(){ const root=this._root||document.getElementById('mk-root'); if(!root) return; const ru=this.state.lang==='ru';
    root.querySelectorAll('[data-ru]').forEach(el=>{ if(el.dataset.uz===undefined) el.dataset.uz=el.textContent; el.textContent = ru? el.getAttribute('data-ru') : el.dataset.uz; });
  }

  /* ---------- render ---------- */
  renderVals(){
    const s=this.state, p=this.proj(), R=this;
    const scr=(x)=>s.screen===x;
    const psc=this.projStatusColor(p);

    // quicklinks
    const quicklinks=[
      {icon:'\u2726', label:'KARVON+ ta\u2019mirli', onClick:()=>this.go('catalog')},
      {icon:'\u25A9', label:'Loyihalar', onClick:()=>this.go('catalog')},
      {icon:'\u25A4', label:'Yangiliklar', onClick:()=>this.openNews('n1')},
      {icon:'\u25AD', label:'Parkinglar', onClick:()=>this.go('catalog')}
    ];

    const imgEl=(src)=>src?React.createElement('img',{src, alt:'', style:{width:'100%',height:'100%',objectFit:'cover',display:'block'}}):null;
    const projImgs={ oqdaryo:'uploads/668_A9925_1_aaed991233.jpg', yangihayot:'uploads/C_01_6_6c21b0e612.jpg', chorbog:'uploads/C_07_8_8f034d1248.jpg' };
    const mapProj=(pp, slotPrefix)=>{ const c=this.projStatusColor(pp); return {
      id:pp.id, name:pp.name, cls:pp.cls, district:pp.district, deadline:pp.deadline, priceFrom:pp.priceFrom,
      statusLabel:pp.statusLabel, statusBg:c.bg, statusColor:c.c, freeCount:this.projTotalFree(pp),
      img:projImgs[pp.id]||'', imgEl:imgEl(projImgs[pp.id]),
      address:'Toshkent, '+pp.district+' tumani', floorsLabel:pp.floors+' qavatgacha',
      openChess:()=>{ this.setState({projectId:pp.id, screen:'chess', chessStep:'A', blockId:null}); this._top(); },
      slot:slotPrefix+'-'+pp.id, slotCat:'cat-'+pp.id, open:()=>this.openProject(pp.id)
    };};
    // home search + filter
    const projHasRoom=(pp,r)=>(pp.blocks||['A']).some(b=>this.genFloors(pp,b,1).some(row=>row.cells.some(cc=>cc.rooms===r && cc.status!=='sotilgan')));
    const q=(s.hsearch||'').trim().toLowerCase();
    const homeFiltered=this.PROJECTS.filter(pp=>{
      if(q && !((pp.name+' '+pp.district).toLowerCase().includes(q))) return false;
      if(s.hcls!=='all' && pp.cls!==s.hcls) return false;
      if(pp.priceFrom > s.hprice) return false;
      if(s.hrooms!=='all' && !projHasRoom(pp, s.hrooms)) return false;
      return true;
    });
    const homeProjects=homeFiltered.map(pp=>mapProj(pp,'home'));
    const homeResultCount=homeProjects.length;
    const hchip=(active)=>({ border:'1px solid '+(active?'var(--blue)':'var(--line)'), background:active?'var(--blue)':'#fff', color:active?'#fff':'var(--ink)', fontSize:'13px', fontWeight:600, padding:'9px 15px', borderRadius:'10px', cursor:'pointer', transition:'all .2s ease' });
    const homeClsOpts=[['all','Barchasi'],['Komfort','Komfort'],['Komfort+','Komfort+'],['Biznes','Biznes']].map(([v,l])=>({label:l, style:hchip(s.hcls===v), onClick:()=>this.setState({hcls:v})}));
    const homeRoomOpts=[['all','Barchasi'],[0,'Studiya'],[1,'1'],[2,'2'],[3,'3'],[4,'4+']].map(([v,l])=>({label:l, style:hchip(s.hrooms===v), onClick:()=>this.setState({hrooms:v})}));
    const homeResetFilters=()=>{ this.setState({hsearch:'',hcls:'all',hrooms:'all',hprice:1500}); const root=document.getElementById('mk-root'); if(root){ const si=root.querySelector('[data-hsearch]'); if(si)si.value=''; const pr=root.querySelector('[data-hprice]'); if(pr)pr.value=1500; } };
    const homePriceLabel=s.hprice>=1500?'∞':s.hprice;
    // catalog filter
    let catalogProjects=this.PROJECTS.filter(pp=> (s.catCls==='all'||pp.cls===s.catCls) && (s.catStatus==='all'||pp.status===s.catStatus)).map(pp=>mapProj(pp,'cat'));
    const chip=(active)=>({ border:'1px solid '+(active?'var(--blue)':'var(--line)'), background:active?'var(--blue)':'#fff', color:active?'#fff':'var(--ink)', fontSize:'13px', fontWeight:600, padding:'9px 15px', borderRadius:'10px', cursor:'pointer' });
    const catClassOpts=[['all','Barcha klass'],['Komfort','Komfort'],['Komfort+','Komfort+'],['Biznes','Biznes']].map(([v,l])=>({label:l, style:chip(s.catCls===v), onClick:()=>this.setState({catCls:v})}));
    const catStatusOpts=[['all','Barchasi'],['sotuvda','Sotuvda'],['start','Start'],['topshirilgan','Topshirilgan']].map(([v,l])=>({label:l, style:chip(s.catStatus===v), onClick:()=>this.setState({catStatus:v})}));

    // project extras
    const amenities=[
      {icon:'\uD83C\uDF33', label:'Landshaft dizayn'},{icon:'\uD83D\uDEDD', label:'Bolalar maydoni'},
      {icon:'\uD83D\uDCAA', label:'Workout zona'},{icon:'\uD83D\uDCF9', label:'24/7 kuzatuv'},
      {icon:'\uD83D\uDEB2', label:'Mashinasiz hovli'},{icon:'\uD83C\uDD7F\uFE0F', label:'Yer osti parking'}
    ];
    const projView={ ...p, statusBg:psc.bg, statusColor:psc.c, blockCount:(p.blocks||[]).length, totalFree:this.projTotalFree(p),
      g1:'pj-'+p.id+'-1', g2:'pj-'+p.id+'-2', g3:'pj-'+p.id+'-3', gen:'pj-'+p.id+'-gen', c1:'pj-'+p.id+'-c1', c2:'pj-'+p.id+'-c2' };
    // rich detail extras
    const gpool=[projImgs[p.id]||'uploads/C_01_6_6c21b0e612.jpg','uploads/C_07_8_8f034d1248.jpg','uploads/668_A9925_1_aaed991233.jpg'];
    projView.address='Toshkent, '+p.district+' tumani';
    projView.floorsLabel=p.floors+' qavat';
    projView.shift='3 m'; projView.minArea=30; projView.maxArea=131;
    projView.heroMain=imgEl(gpool[0]); projView.heroT1=imgEl(gpool[1]); projView.heroT2=imgEl(gpool[2]);
    projView.imgHovli=imgEl('uploads/668_A9925_1_aaed991233.jpg');
    projView.imgHall=imgEl('uploads/IMGL_0248_2_755a5bdd99.jpg');
    projView.imgCowork=imgEl('uploads/C_01_6_6c21b0e612.jpg');
    projView.imgLoc=imgEl('uploads/DJI_20260625064133_0060_D_edd307f13b.jpg');
    projView.imgC1=imgEl('uploads/C_07_8_8f034d1248.jpg');
    projView.imgC2=imgEl('uploads/668_A9925_1_aaed991233.jpg');
    const svgI=(inner)=>React.createElement('svg',{width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round',strokeLinejoin:'round',style:{display:'block'},dangerouslySetInnerHTML:{__html: inner.indexOf('<')>=0 ? inner : '<path d="'+inner+'"/>'}});
    const IC={
      tree:'M12 22v-6M8 16a4 4 0 0 1-1.5-7.7A4 4 0 0 1 12 3a4 4 0 0 1 5.5 5.3A4 4 0 0 1 16 16z',
      shield:'M20 13c0 5-3.5 7.5-7.7 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.81 17 5 19 5a1 1 0 0 1 1 1zM9 12l2 2 4-4',
      palette:'<circle cx="13.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="10.5" r="1.2"/><circle cx="8.5" cy="7.5" r="1.2"/><circle cx="6.5" cy="12.5" r="1.2"/><path d="M12 2a10 10 0 0 0 0 20 2.5 2.5 0 0 0 2-4 2.5 2.5 0 0 1 2-4h2a4 4 0 0 0 4-4 10 10 0 0 0-10-8z"/>',
      flame:'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z',
      kids:'<circle cx="12" cy="4.5" r="2"/><path d="M12 6.5V13M8 9l4-1 4 1M9 21l3-8 3 8"/>',
      sport:'M6.5 6.5l11 11M20.5 3.5l-2 2M3.5 20.5l2-2M18 4l2 2-3 3-2-2zM6 14l2 2-3 3-2-2z',
      elevator:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 6l-2 3h4zM12 18l-2-3h4z"/>',
      sofa:'M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2M2 11a2 2 0 0 1 2 2v3h16v-3a2 2 0 1 1 2-2v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM4 18v2M20 18v2',
      access:'<circle cx="16" cy="4" r="1.4"/><path d="M18 19l-2.5-4.5L18 13l-4-1.5-1 5M11 12l-1.5 7"/>',
      door:'M13 4h3a2 2 0 0 1 2 2v14M2 20h20M14 12v.01M10 20V6a2 2 0 0 1 2-2h2',
      mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>',
      laptop:'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9H3zM2 17h20l-1.2 3H3.2z',
      film:'<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M7 4v16M17 4v16M2.5 9h4.5M2.5 15h4.5M17 9h4.5M17 15h4.5"/>',
      book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z',
      coffee:'M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 1v3M10 1v3M14 1v3',
      gamepad:'M8 11h4M10 9v4M15 11h.01M18 13h.01M17.3 5H6.7a4 4 0 0 0-3.98 3.6C2.6 9.4 2 14.5 2 16a3 3 0 0 0 5 2l1.4-1.4a2 2 0 0 1 1.42-.6h4.36a2 2 0 0 1 1.42.6L17 18a3 3 0 0 0 5-2c0-1.5-.6-6.6-.72-7.4A4 4 0 0 0 17.3 5z',
      users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.1a4 4 0 0 1 0 7.75'
    };
    const projFeatHovli=[{k:'tree',t:'Boy yashil hudud'},{k:'shield',t:'24/7 xavfsizlik'},{k:'palette',t:'Landshaft dizayn'},{k:'flame',t:'Barbekyu zonasi'},{k:'kids',t:'Bolalar maydonchalari'},{k:'sport',t:'Sport maydonlari'}].map(f=>({...f,iconEl:svgI(IC[f.k])}));
    const projFeatHall=[{k:'elevator',t:'Shovqinsiz liftlar'},{k:'palette',t:'Dizaynerlik hollari'},{k:'sofa',t:'Yumshoq kutish zonasi'},{k:'access',t:'To\u2018siqsiz muhit'},{k:'door',t:'Alohida kirishlar'},{k:'mail',t:'Pochta zonasi'}].map(f=>({...f,iconEl:svgI(IC[f.k])}));
    const projFeatCowork=[{k:'laptop',t:'Kovorking zona'},{k:'film',t:'Kinoroom'},{k:'book',t:'Kutubxona'},{k:'coffee',t:'Kofe-point'},{k:'gamepad',t:'O\u2018yin zonasi'},{k:'users',t:'Uchrashuv xonalari'}].map(f=>({...f,iconEl:svgI(IC[f.k])}));

    // chess
    const stepMeta=[['A','Blok'],['B','Pod\u2019yezd'],['C','Kvartira']];
    const order={A:0,B:1,C:2};
    const steps=stepMeta.map(([k,l],i)=>{ const done=order[s.chessStep]>=i; const cur=s.chessStep===k;
      return { label:l, num:i+1, sep:i<2?'\u203A':'',
        onClick:()=>{ if(k==='A')this.setState({chessStep:'A'}); else if(k==='B'&&s.blockId)this.setState({chessStep:'B'}); },
        style:{ display:'flex', alignItems:'center', gap:'8px', border:'1px solid '+(cur?'var(--blue)':'var(--line)'), background:cur?'var(--blue-050)':'#fff', color:cur||done?'var(--ink)':'var(--mute)', fontSize:'14px', fontWeight:600, padding:'8px 14px', borderRadius:'10px', cursor:'pointer' },
        numStyle:{ width:'22px', height:'22px', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, background:cur?'var(--blue)':done?'var(--free)':'var(--line)', color:(cur||done)?'#fff':'var(--slate)' } };
    });
    const blocks=(p.blocks||[]).map((b,i)=>{ const free=this.blockFree(p,b); const heights=[240,300,200,270]; return {
      name:b, free, floors:p.floors, onClick:()=>this.selBlock(b),
      style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', gap:'4px', width:'clamp(110px,15vw,150px)', height:heights[i%heights.length]+'px', paddingBottom:'18px', border:'none', borderRadius:'14px 14px 6px 6px', background:'linear-gradient(180deg,#3D7BFF,#0060FE)', cursor:'pointer', transition:'all .25s ease', boxShadow:'0 10px 30px rgba(0,96,254,.2)' }
    };});
    const facadeFloors=[]; for(let f=p.floors;f>=1;f--){ const win=[]; for(let w=0;w<8;w++){ const lit=((f*3+w*5+p.seed)%3===0); win.push({style:{ width:'26px', height:'20px', borderRadius:'3px', background:lit?'rgba(0,96,254,.28)':'rgba(15,24,38,.1)', border:'1px solid rgba(15,24,38,.08)' }}); } facadeFloors.push({win}); }
    const entrances=[]; for(let e=1;e<=p.entrances;e++){ entrances.push({ label:e+'', big:e+'-pod\u2019yezd', free:Math.round(this.blockFree(p,s.blockId||'A')/p.entrances), onClick:()=>this.selEntrance(e), style:{ flex:1, height:'40px', border:'1px solid var(--blue)', background:'var(--blue-050)', color:'var(--blue)', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', transition:'all .2s ease' } }); }

    // chessboard step C
    const rawFloors = s.chessStep==='C' ? this.genFloors(p, s.blockId||'A', s.entrance) : [];
    let freeCount=0; const listCells=[];
    const floors=rawFloors.map(row=>({ floor:row.floor, cells: row.cells.map(c=>{ const active=this.cellPassesFilter(c); if(active&&c.status==='bosh')freeCount++; if(active) listCells.push(c);
      return { ...c, onClick: c.status!=='sotilgan'?(()=>this.openApt(c)):(()=>{}), title:c.roomsLabel+' · '+c.area+' m² · '+this.STATUS[c.status].label, style:this.cellStyle(c,active) }; }) }));
    listCells.sort((a,b)=>a.price-b.price);
    const listCellsV=listCells.map(c=>({ ...c, onClick:c.status!=='sotilgan'?(()=>this.openApt(c)):(()=>{}), statusLabel:this.STATUS[c.status].label, statusColor:this.STATUS[c.status].color, dot:{width:'12px',height:'12px',borderRadius:'50%',background:this.STATUS[c.status].color,flexShrink:0} }));
    const roomOpts=[[0,'Studiya'],[1,'1'],[2,'2'],[3,'3'],[4,'4+']].map(([v,l])=>{ const on=s.flt.rooms.includes(v); return { label:l, onClick:()=>this.toggleRoom(v), style:{ border:'1px solid '+(on?'var(--blue)':'var(--line)'), background:on?'var(--blue)':'#fff', color:on?'#fff':'var(--ink)', fontSize:'13px', fontWeight:600, padding:'8px 12px', borderRadius:'9px', cursor:'pointer' } }; });
    const vbtn=(on)=>({ border:'none', background:on?'var(--blue)':'#fff', color:on?'#fff':'var(--slate)', fontSize:'13px', fontWeight:600, padding:'9px 14px', cursor:'pointer' });

    // apartment
    const apt=s.apt||{}; const aptStatus=apt.status?this.STATUS[apt.status]:this.STATUS.bosh;
    const miniRaw = s.apt ? this.genFloors(p, s.aptBlock||'A', s.entrance) : [];
    const miniFloors=miniRaw.map(row=>({ floor:row.floor, cells:row.cells.map(c=>{ const isSel=s.apt&&c.id===s.apt.id; const st=this.STATUS[c.status];
      return { miniStyle:{ width:'16px', height:'12px', borderRadius:'3px', background:isSel?'var(--blue)':st.bg, border:'1px solid '+(isSel?'var(--blue)':st.ln), boxShadow:isSel?'0 0 0 2px rgba(0,96,254,.25)':'none' } }; }) }));
    const similar = s.apt ? this.genFloors(p, s.aptBlock||'A', s.entrance).flatMap(r=>r.cells).filter(c=>c.rooms===apt.rooms && c.id!==apt.id).slice(0,4).map(c=>({ ...c, onClick:()=>this.openApt(c), statusLabel:this.STATUS[c.status].label, statusColor:this.STATUS[c.status].color, dot:{width:'10px',height:'10px',borderRadius:'50%',background:this.STATUS[c.status].color} })) : [];
    const mMonthly=this.mortMonthly(s.mort); const mLoan=s.mort.price*(1-s.mort.down/100);

    // mortgage page
    const banks=[
      {abbr:'IB', name:'Ipoteka Bank', color:'#1E7A46', down:'15%', rate:'16%', term:'20 yil'},
      {abbr:'AB', name:'Aloqa Bank', color:'#0060FE', down:'20%', rate:'17%', term:'15 yil'},
      {abbr:'KD', name:'Kapital Bank', color:'#8B1E3F', down:'25%', rate:'15%', term:'25 yil'},
      {abbr:'HB', name:'Hamkor Bank', color:'#E8901A', down:'15%', rate:'18%', term:'18 yil'}
    ];
    const mgMonthly=this.mortMonthly(s.mg); const mgLoan=s.mg.price*(1-s.mg.down/100);

    const onlineSteps=[
      {num:'01', icon:'\uD83D\uDCDD', title:'Ariza', desc:'Kvartirani tanlab, onlayn ariza qoldiring.'},
      {num:'02', icon:'\uD83D\uDCAC', title:'Konsultatsiya', desc:'Menejer siz bilan bog\u2018lanadi va shartlarni tushuntiradi.'},
      {num:'03', icon:'\u270D\uFE0F', title:'Shartnoma', desc:'Elektron raqamli imzo bilan shartnoma imzolanadi.'},
      {num:'04', icon:'\uD83D\uDCB3', title:'To\u2018lov', desc:'Xavfsiz onlayn to\u2018lov yoki ipoteka rasmiylashtiriladi.'}
    ];
    const reviews=[
      {abbr:'DA', name:'Dilnoza A.', role:'Oq Daryo, 2 xona', text:'Hammasi onlayn bo\u2018ldi, ofisga bir marta bordim xolos. Menejer juda yordam berdi.'},
      {abbr:'BT', name:'Bekzod T.', role:'Yangi Hayot, 3 xona', text:'Ipoteka rasmiylashtirish oson kechdi. Qurilish muddatida topshirildi.'},
      {abbr:'ML', name:'Malika L.', role:'Chorbog\u2018 Park, studiya', text:'Shaxmatka orqali qavatni o\u2018zim tanladim — juda qulay. Rahmat KARVON STROY!'}
    ];

    // news
    const news=this.newsList().map(n=>({ ...n, imgEl:imgEl(n.img), open:()=>this.openNews(n.id) }));
    const featuredNews=[news[0]];
    const sideNews=news.slice(1);
    const cur=news.find(n=>n.id===s.newsId)||news[0];
    const others=news.filter(n=>n.id!==cur.id).map(n=>({ ...n }));
    const newsView={ ...cur, others };

    return {
      isHome:scr('home'), isCatalog:scr('catalog'), isProject:scr('project'), isChess:scr('chess'), isApt:scr('apartment'), isMortgage:scr('mortgage'), isOnline:scr('online'), isNews:scr('news'),
      featuredNews, sideNews, news:newsView, backHome:()=>this.go('home'),
      homeClsOpts, homeRoomOpts, homePriceLabel, homeResultCount, homeResetFilters,
      quicklinks, homeProjects, catalogProjects, catClassOpts, catStatusOpts,
      proj:projView, amenities, projFeatHovli, projFeatHall, projFeatCowork, goChess:()=>this.startChess(), openProjBack:()=>this.openProject(p.id),
      steps, chessA:s.chessStep==='A', chessB:s.chessStep==='B', chessC:s.chessStep==='C',
      blocks, facadeFloors, entrances, blockId:s.blockId, entrance:s.entrance,
      floors, freeCount, listCells:listCellsV, isGridView:s.chessView==='grid', isListView:s.chessView==='list',
      setGrid:()=>this.setState({chessView:'grid'}), setList:()=>this.setState({chessView:'list'}),
      gridBtnStyle:vbtn(s.chessView==='grid'), listBtnStyle:vbtn(s.chessView==='list'),
      roomOpts, resetFilters:()=>this.resetFilters(),
      areaLabel:'\u2264 '+s.flt.area, priceLabel:'\u2264 '+s.flt.price, floorLabel:'\u2265 '+s.flt.floor,
      backToChess:()=>this.setState({screen:'chess', chessStep:'C'}),
      apt:{ ...apt, floor:apt.f, statusLabel:aptStatus.label, statusColor:aptStatus.color, statusBg:aptStatus.bg }, aptBlock:s.aptBlock,
      miniFloors, similar,
      mortDownLabel:s.mort.down+'%', mortTermLabel:s.mort.term+' yil',
      mortMonthly:(mMonthly/1e6).toFixed(1)+' mln', mortLoan:this.fmt(mLoan)+' mln',
      banks, mgPriceLabel:s.mg.price+' mln', mgDownLabel:s.mg.down+'%', mgTermLabel:s.mg.term+' yil',
      mgMonthly:(mgMonthly/1e6).toFixed(1)+' mln', mgLoan:this.fmt(mgLoan)+' mln',
      onlineSteps, reviews
    };
  }
}
