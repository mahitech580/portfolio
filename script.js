(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const projectData = {
    'Averis': {
      category:'WEB PRODUCT',
      description:'A simulated healthcare-operations workspace designed as a connected product interface. It brings together people, journeys, queues, scheduling, capacity, workforce, messages, incidents, quality, reports and audit views. It uses synthetic/local interface data rather than real patient records.',
      stack:['HTML','CSS','JavaScript','Product UI','Local simulation'],
      repo:'https://github.com/mahitech580/averis',
      live:'https://mahitech580.github.io/averis/',
      art:'linear-gradient(145deg,#93b393,#3b6f5c)'
    },
    'CYRUS': {
      category:'AGENTIC INTELLIGENCE',
      description:'An evolving autonomous-agentic intelligence project exploring task orchestration, tool workflows and observable execution states. The repository is the source of truth for the current implementation and ongoing development.',
      stack:['Python','Agentic AI','Orchestration','Tool workflows'],
      repo:'https://github.com/mahitech580/CYRUS-Autonomous-Agentic-Intelligence-System',
      live:'',
      art:'linear-gradient(145deg,#426d68,#1f423d)'
    },
    'VoxGen AI': {
      category:'VOICE / GENERATIVE AI',
      description:'A local voice-assistant experiment connecting speech input and output with a local language-model workflow. Its technology direction includes Qwen3 8B, Ollama, Whisper, FastAPI and SQLite.',
      stack:['Python','Qwen3 8B','Ollama','Whisper','FastAPI','SQLite'],
      repo:'https://github.com/mahitech580/VoxGen-AI',
      live:'',
      art:'linear-gradient(145deg,#af9eaf,#725b78 55%,#3a4550)'
    },
    'Deepfake Detection': {
      category:'COMPUTER VISION',
      description:'A computer-vision project exploring deepfake classification from video, using deep-learning approaches such as CNN/ResNet50 with TensorFlow and OpenCV and incorporating frequency-domain ideas.',
      stack:['Python','TensorFlow','OpenCV','CNN / ResNet50','FFT'],
      repo:'https://github.com/mahitech580/deepfake-video-detection',
      live:'',
      art:'linear-gradient(145deg,#a6a08c,#546e66 60%,#304b43)'
    },
    'TripPilot': {
      category:'TRAVEL / WEB',
      description:'A visual travel planner centred around destination discovery and itinerary presentation. It focuses on making trip planning easier to browse through a responsive web interface.',
      stack:['HTML','CSS','JavaScript','Responsive UI'],
      repo:'https://github.com/mahitech580/TripPilot-Travel-Planner',
      live:'https://mahitech580.github.io/TripPilot-Travel-Planner/',
      art:'linear-gradient(145deg,#aec4bf,#668c8b 56%,#3e675b)'
    },
    'LastMileIQ-SQL': {
      category:'DATA / SQL ANALYTICS',
      description:'A PostgreSQL analytics project exploring last-mile delivery data, including routes, delays, customer and cost patterns, and operational risk questions.',
      stack:['PostgreSQL','SQL','Data analysis'],
      repo:'https://github.com/mahitech580/LastMileIQ-SQL',
      live:'',
      art:'linear-gradient(145deg,#c1c79d,#6f977d 63%,#456d61)'
    },
    'Banking System': {
      category:'DATABASE SYSTEM',
      description:'A relational MySQL project representing core banking data entities and transactions. It covers database structure and query work around customers, accounts, transactions and related operations.',
      stack:['MySQL','SQL','Relational design'],
      repo:'https://github.com/mahitech580/Banking-Financial-Transaction-Management-MySQL',
      live:'',
      art:'linear-gradient(145deg,#c6b18e,#7c8c73 59%,#456255)'
    }
  };

  const skills = {
    languages:{label:'Languages',count:'05 items',description:'Foundational programming and query languages used across coding practice, applications and database work.',items:['Python','SQL','JavaScript','HTML','CSS'],note:'Start with the basics. Make them dependable.'},
    backend:{label:'Backend & APIs',count:'05 items',description:'Application-layer tools to connect interfaces, business rules and data.',items:['Flask','FastAPI','REST APIs','Node.js','OOP'],note:'A useful interface needs a useful engine.'},
    data:{label:'Data & databases',count:'06 items',description:'Tools to query, shape, store and explore structured information.',items:['Pandas','NumPy','MySQL','PostgreSQL','SQLite','MongoDB'],note:'Good questions often start with well-shaped data.'},
    ai:{label:'AI / ML / GenAI',count:'08 items',description:'Machine-learning, computer-vision and language-model areas explored through practical projects.',items:['Scikit-learn','TensorFlow','OpenCV','CNNs','LLMs','Prompt engineering','Ollama','Whisper'],note:'Experiment, test assumptions, and keep the limits in view.'},
    web:{label:'Web & interfaces',count:'05 items',description:'Front-end tools for responsive pages, product layouts and useful interactions.',items:['HTML / CSS','JavaScript','Responsive design','GitHub Pages','Accessibility basics'],note:'The small details make the path easier to follow.'},
    workflow:{label:'Engineering habits',count:'06 items',description:'Everyday practices used while solving problems and growing projects.',items:['Git','GitHub','DSA practice','Debugging','Problem decomposition','SQL query design'],note:'Build, inspect, improve, repeat.'}
  };

  // Soft, low-cost fireflies. They pause on hidden tabs and respect motion preferences.
  (function fireflyField(){
    const canvas=$('#fireflies'),hero=$('#hero');
    if(!canvas||!hero||reduceMotion)return;
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx)return;
    let w=0,h=0,dpr=1,raf=0,last=0,paused=false,flies=[];
    const makeFly=(seeded=false)=>({
      x:Math.random()*w,y:seeded?Math.random()*h:h+Math.random()*80,
      vx:(Math.random()-.5)*.19,vy:-(.035+Math.random()*.13),
      radius:1+Math.random()*2.2,phase:Math.random()*Math.PI*2,
      glow:5+Math.random()*15,life:Math.random()*650+850,
      age:seeded?Math.random()*700:0,hue:Math.random()>.75?'#f4d9a0':'#fff0af'
    });
    function resize(){
      const r=hero.getBoundingClientRect();
      w=r.width;h=r.height;dpr=Math.min(window.devicePixelRatio||1,1.25);
      canvas.width=Math.max(1,Math.floor(w*dpr));canvas.height=Math.max(1,Math.floor(h*dpr));
      canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
      flies=Array.from({length:w<600?20:37},()=>makeFly(true));
    }
    function draw(time){
      raf=0;
      if(paused||document.hidden)return;
      if(time-last<28){raf=requestAnimationFrame(draw);return}
      last=time;ctx.clearRect(0,0,w,h);
      for(let i=flies.length-1;i>=0;i--){
        const p=flies[i];p.age+=1;p.phase+=.021;
        p.x+=p.vx+Math.sin(p.phase)*.19;p.y+=p.vy;
        const fade=Math.min(1,p.age/70,Math.max(0,(p.life-p.age)/100));
        const opacity=fade*(.22+.5*(.5+.5*Math.sin(p.phase*1.8)));
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.glow);
        g.addColorStop(0,'rgba(255,235,168,'+(opacity*.7)+')');
        g.addColorStop(.35,'rgba(250,214,138,'+(opacity*.26)+')');
        g.addColorStop(1,'rgba(250,214,138,0)');
        ctx.fillStyle=g;ctx.fillRect(p.x-p.glow,p.y-p.glow,p.glow*2,p.glow*2);
        ctx.beginPath();ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);ctx.fillStyle=p.hue;ctx.globalAlpha=opacity;ctx.fill();ctx.globalAlpha=1;
        if(p.age>p.life||p.y<-30||p.x<-25||p.x>w+25)flies[i]=makeFly();
      }
      raf=requestAnimationFrame(draw);
    }
    function start(){paused=false;if(!raf&&!document.hidden)raf=requestAnimationFrame(draw)}
    function stop(){paused=true;if(raf)cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,w,h)}
    resize();start();
    window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
    const toggle=$('#worldToggle'),label=$('#worldToggleText'),icon=$('.control-icon');
    if(toggle)toggle.addEventListener('click',()=>{
      const isPaused=!paused;
      if(isPaused)stop();else start();
      document.body.classList.toggle('paused',isPaused);
      toggle.setAttribute('aria-pressed',String(isPaused));
      toggle.setAttribute('aria-label',isPaused?'Resume the floating fireflies and clouds':'Pause the floating fireflies and clouds');
      if(label)label.textContent=isPaused?'Bring the world to life':'Pause the little world';
      if(icon)icon.textContent=isPaused?'▶':'Ⅱ';
    });
  })();

  // SVG landscape reacts to the pointer with very gentle depth; nothing fights native scroll.
  const heroArt=$('#heroArt');
  if(heroArt&&isFinePointer&&!reduceMotion){
    const layers=$$('[data-parallax]',heroArt);
    let raf=0,px=0,py=0;
    heroArt.addEventListener('pointermove',e=>{
      const r=heroArt.getBoundingClientRect();
      px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;
      if(raf)return;
      raf=requestAnimationFrame(()=>{
        layers.forEach(layer=>{
          const d=Number(layer.dataset.parallax)||0;
          layer.style.translate=(px*d*-95)+'px '+(py*d*-55)+'px';
        });
        raf=0;
      });
    },{passive:true});
    heroArt.addEventListener('pointerleave',()=>{
      layers.forEach(layer=>{layer.style.translate='0px 0px'});
    },{passive:true});
  }

  // Profile's moonlight mode.
  const moonToggle=$('#moonToggle');
  let moonlight=false;
  try{moonlight=localStorage.getItem('mahi-moonlight')==='on'}catch(e){}
  function setMoonlight(value){
    moonlight=value;document.body.classList.toggle('moonlight',value);
    if(moonToggle){moonToggle.setAttribute('aria-pressed',String(value));moonToggle.setAttribute('aria-label',value?'Switch to daylight mode':'Switch to moonlight mode');moonToggle.title=value?'Moonlight mode on':'Moonlight mode off'}
    try{localStorage.setItem('mahi-moonlight',value?'on':'off')}catch(e){}
    toast(value?'The valley is settling into moonlight.':'The valley is warming up for the day.');
  }
  document.body.classList.toggle('moonlight',moonlight);
  if(moonToggle){moonToggle.setAttribute('aria-pressed',String(moonlight));moonToggle.addEventListener('click',()=>setMoonlight(!moonlight))}

  // Mobile nav: close on selection, click-away or Escape.
  const menuToggle=$('#menuToggle'),mobileNav=$('#mobileNav');
  function closeMobileNav(){
    if(!mobileNav||!menuToggle)return;
    mobileNav.classList.remove('open');menuToggle.textContent='☰';menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open navigation');
  }
  if(menuToggle&&mobileNav){
    menuToggle.addEventListener('click',()=>{
      const open=mobileNav.classList.toggle('open');
      menuToggle.textContent=open?'×':'☰';menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    });
    $$('a',mobileNav).forEach(a=>a.addEventListener('click',closeMobileNav));
    document.addEventListener('click',e=>{if(!mobileNav.contains(e.target)&&!menuToggle.contains(e.target))closeMobileNav()});
  }

  // Header state, progress and deliberate reveal-on-scroll.
  const header=$('#siteHeader'),progressBar=$('#progressBar');
  function updateScroll(){
    if(header)header.classList.toggle('scrolled',window.scrollY>24);
    const max=document.documentElement.scrollHeight-window.innerHeight;
    if(progressBar)progressBar.style.width=(max>0?Math.min(100,window.scrollY/max*100):0)+'%';
  }
  window.addEventListener('scroll',updateScroll,{passive:true});window.addEventListener('resize',updateScroll,{passive:true});updateScroll();
  if('IntersectionObserver'in window&&!reduceMotion){
    const revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}});
    },{threshold:.12,rootMargin:'0px 0px -35px 0px'});
    $$('.reveal').forEach(el=>revealObserver.observe(el));
  }else{$$('.reveal').forEach(el=>el.classList.add('visible'))}

  // Skill shed drawer, using plain data so all controls remain honest and easy to update.
  $$('[data-skill]').forEach(btn=>btn.addEventListener('click',()=>{
    const skill=skills[btn.dataset.skill];if(!skill)return;
    $$('[data-skill]').forEach(tab=>{const active=tab===btn;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active))});
    const display=$('#toolDisplay');if(!display)return;
    display.replaceChildren();
    const top=document.createElement('div');top.className='tool-display-top';
    const eyebrow=document.createElement('span');eyebrow.className='eyebrow';eyebrow.textContent='DRAWER '+btn.querySelector('i').textContent+' / EVERYDAY TOOLS';
    const count=document.createElement('span');count.className='tool-count';count.textContent=skill.count;top.append(eyebrow,count);
    const title=document.createElement('h3');title.textContent=skill.label;
    const description=document.createElement('p');description.textContent=skill.description;
    const chips=document.createElement('div');chips.className='tool-chips';
    skill.items.forEach(item=>{const chip=document.createElement('span');chip.textContent=item;chips.appendChild(chip)});
    const note=document.createElement('div');note.className='tool-note';note.innerHTML='<span>✳</span>';
    const noteText=document.createTextNode(' '+skill.note);note.appendChild(noteText);
    display.append(top,title,description,chips,note);
  }));

  // Project filters.
  $$('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    const filter=btn.dataset.filter;
    $$('[data-filter]').forEach(chip=>{const active=chip===btn;chip.classList.toggle('active',active);chip.setAttribute('aria-pressed',String(active))});
    $$('.project-card').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter});
  }));

  // Real source links remain separate from card-opening interactions.
  const projectDialog=$('#projectDialog');
  function openProject(name){
    const item=projectData[name];if(!item||!projectDialog)return;
    $('#dialogEyebrow').textContent=item.category;
    $('#dialogTitle').textContent=item.category==='DATABASE SYSTEM'?'Banking Transaction Management':name;
    $('#dialogArtTitle').textContent=name.toUpperCase();
    $('#dialogDescription').textContent=item.description;
    $('#dialogArt').style.background=item.art;
    const tags=$('#dialogTags');tags.replaceChildren();
    item.stack.forEach(tag=>{const node=document.createElement('span');node.textContent=tag;tags.appendChild(node)});
    const repo=$('#dialogRepo');repo.href=item.repo;repo.hidden=!item.repo;
    const live=$('#dialogLive');live.href=item.live||'#';live.hidden=!item.live;
    if(typeof projectDialog.showModal==='function')projectDialog.showModal();else projectDialog.setAttribute('open','');
  }
  $$('.project-card').forEach(card=>{
    card.addEventListener('click',e=>{if(e.target.closest('a'))return;openProject(card.dataset.project)});
    card.addEventListener('keydown',e=>{if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openProject(card.dataset.project)}});
  });
  // Additional detailed cards open the project notebook; nested links keep their own behavior.
  $('#dialogClose').addEventListener('click',()=>projectDialog.close());
  projectDialog.addEventListener('click',e=>{if(e.target===projectDialog)projectDialog.close()});
  projectDialog.addEventListener('close',()=>{const active=document.activeElement;if(active&&active.matches('body'))return});

  // Surprise-me button makes a random project immediately explorable.
  $('#surpriseProject').addEventListener('click',()=>{
    const cards=$$('.project-card').filter(card=>!card.hidden);
    if(!cards.length)return;
    const selected=cards[Math.floor(Math.random()*cards.length)];
    selected.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});
    selected.classList.add('surprise-picked');
    window.setTimeout(()=>selected.classList.remove('surprise-picked'),1400);
    openProject(selected.dataset.project);
  });

  // Search command shelf (Ctrl/Cmd + K).
  const searchDialog=$('#searchDialog'),searchInput=$('#searchInput'),searchResults=$('#searchResults');
  const searchableSections=[
    {name:'The things I make',target:'#projects',desc:'Project notebooks, demos and source'},
    {name:'Tool shed',target:'#tool-shed',desc:'Python, SQL, AI/ML, web and tools'},
    {name:'Footsteps',target:'#journey',desc:'Education and learning journey'},
    {name:'About the maker',target:'#about',desc:'A note from Mahi'},
    {name:'Send a little note',target:'#contact',desc:'Contact and collaboration'}
  ];
  function doSearch(query){
    query=query.trim().toLowerCase();
    if(!searchResults)return;
    searchResults.replaceChildren();
    if(!query){const hint=document.createElement('p');hint.className='search-hint';hint.textContent='Search across projects, skills and sections.';searchResults.appendChild(hint);return}
    const results=[];
    searchableSections.forEach(section=>{if((section.name+' '+section.desc).toLowerCase().includes(query))results.push({name:section.name,type:'SECTION',desc:section.desc,target:section.target})});
    Object.entries(projectData).forEach(([name,project])=>{if((name+' '+project.category+' '+project.description+' '+project.stack.join(' ')).toLowerCase().includes(query))results.push({name:name,type:project.category,desc:project.stack.slice(0,3).join(' · '),project:name})});
    Object.entries(skills).forEach(([key,skill])=>{if((skill.label+' '+skill.items.join(' ')+' '+skill.description).toLowerCase().includes(query))results.push({name:skill.label,type:'TOOL SHED',desc:skill.items.join(' · '),skill:key})});
    if(!results.length){const empty=document.createElement('p');empty.className='search-hint';empty.textContent='No matches yet — try Python, SQL, AI, Averis or Journey.';searchResults.appendChild(empty);return}
    results.slice(0,12).forEach(result=>{
      const button=document.createElement('button');button.type='button';button.className='search-result';
      const title=document.createElement('strong');title.textContent=result.name;
      const type=document.createElement('span');type.textContent=result.type;
      button.append(title,type);
      button.addEventListener('click',()=>{
        searchDialog.close();
        if(result.project){openProject(result.project)}
        else if(result.skill){$('#tool-shed').scrollIntoView({behavior:reduceMotion?'auto':'smooth'});const tab=$('[data-skill="'+result.skill+'"]');if(tab)tab.click()}
        else if(result.target){const target=$(result.target);if(target)target.scrollIntoView({behavior:reduceMotion?'auto':'smooth'})}
      });
      searchResults.appendChild(button);
    });
  }
  $('#searchToggle').addEventListener('click',()=>{if(searchDialog&&typeof searchDialog.showModal==='function')searchDialog.showModal();else searchDialog.setAttribute('open','');searchInput.focus();});
  $('#searchClose').addEventListener('click',()=>searchDialog.close());
  searchDialog.addEventListener('click',e=>{if(e.target===searchDialog)searchDialog.close()});
  searchDialog.addEventListener('close',()=>{if(searchInput)searchInput.value='';doSearch('')});
  searchInput.addEventListener('input',()=>doSearch(searchInput.value));
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!searchDialog.open)searchDialog.showModal();searchInput.focus()}
    if(e.key==='Escape')closeMobileNav();
  });

  // Contact stays static-host friendly: prepare a message in the visitor's email app.
  $('#contactForm').addEventListener('submit',e=>{
    e.preventDefault();
    const name=$('#contactName').value.trim(),email=$('#contactEmail').value.trim();
    const reason=$('#contactReason').value,message=$('#contactMessage').value.trim();
    const subject=encodeURIComponent(reason+' — message from '+name);
    const body=encodeURIComponent('Name: '+name+'\nEmail: '+email+'\nTopic: '+reason+'\n\n'+message);
    toast('Opening your email app…');
    window.location.href='mailto:mahitech580@gmail.com?subject='+subject+'&body='+body;
  });
  function toast(message){
    const node=$('#toast');if(!node)return;
    node.textContent=message;node.classList.add('show');
    clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2500);
  }
  // Keep the functions declared before the first call as function declarations are hoisted.
  $('#year').textContent=String(new Date().getFullYear());
})();