(() => {
  const $=(q,root=document)=>root.querySelector(q), $$=(q,root=document)=>[...root.querySelectorAll(q)];
  const body=document.body;
  const boot=$("#boot");
  window.addEventListener("load",()=>setTimeout(()=>boot.classList.add("hidden"),900));

  // Cursor + magnetic micro-interactions
  const dot=$(".cursor-dot"), ring=$(".cursor-ring");
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;dot&&dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
  const cursorLoop=()=>{rx+=(mx-rx)*.16;ry+=(my-ry)*.16;if(ring)ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(cursorLoop)};cursorLoop();
  $$(".magnetic").forEach(el=>{
    el.addEventListener("mouseenter",()=>ring?.classList.add("big"));
    el.addEventListener("mouseleave",()=>{ring?.classList.remove("big");el.style.transform=""});
    el.addEventListener("mousemove",e=>{const r=el.getBoundingClientRect(),dx=(e.clientX-(r.left+r.width/2))*.14,dy=(e.clientY-(r.top+r.height/2))*.14;el.style.transform=`translate3d(${dx}px,${dy}px,0)`});
  });

  // Reveal system
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});
  $$(".reveal").forEach(el=>io.observe(el));

  // Theme intensity
  $("#themeBtn")?.addEventListener("click",()=>body.classList.toggle("glow-low"));

  // Canvas: stars + linked particles + slow parallax
  const canvas=$("#scene"),ctx=canvas?.getContext("2d"); let W,H,dpr,pts=[],scrollY=0;
  const resize=()=>{if(!canvas||!ctx)return;dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0);pts=Array.from({length:Math.min(105,W<700?55:105)},()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random(),vx:(Math.random()-.5)*.16,vy:(Math.random()-.5)*.16,r:Math.random()*1.3+.2}));};
  const draw=()=>{if(!ctx)return;ctx.clearRect(0,0,W,H);const sy=scrollY*.08;
    for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<-5)p.x=W+5;if(p.x>W+5)p.x=-5;if(p.y<-5)p.y=H+5;if(p.y>H+5)p.y=-5;
      const yy=p.y-sy*(0.5+p.z);ctx.beginPath();ctx.fillStyle=`rgba(255,255,255,${.16+.5*p.z})`;ctx.arc(p.x,yy,p.r,0,Math.PI*2);ctx.fill();
    }
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<125){ctx.strokeStyle=`rgba(182,255,0,${(1-d/125)*.055})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}
    requestAnimationFrame(draw)
  };
  resize();draw();addEventListener("resize",resize);addEventListener("scroll",()=>scrollY=window.scrollY,{passive:true});

  // Hero orbit parallax
  const orbit=$(".hero-orbit"); addEventListener("mousemove",e=>{if(!orbit)return;const x=(e.clientX-innerWidth/2)/innerWidth,y=(e.clientY-innerHeight/2)/innerHeight;orbit.style.transform=`translateY(-50%) translate3d(${x*12}px,${y*12}px,0)`},{passive:true});

  // Project spotlight
  const projects=[
    {index:"01",title:"AVERIS",heading:"A dark enterprise healthcare coordination experience.",desc:"A polished front-end simulation built around operational clarity: queues, schedules, capacity, incidents, insights and an assistant layer — all designed to feel like a real product without using real patient data.",chips:["HTML","CSS","JavaScript","UX systems"],live:"https://mahitech580.github.io/averis/",repo:"https://github.com/mahitech580/averis",label:"HEALTHCARE COORDINATION · SIMULATED / LOCAL",tone:"purple"},
    {index:"02",title:"CYRUS",heading:"An autonomous agentic intelligence direction.",desc:"A growing systems project exploring agentic workflows, orchestration, reasoning loops and an operator-grade interface for turning complex tasks into observable flows.",chips:["Python","Agents","Automation","AI"],live:"https://github.com/mahitech580/CYRUS-Autonomous-Agentic-Intelligence-System",repo:"https://github.com/mahitech580/CYRUS-Autonomous-Agentic-Intelligence-System",label:"AGENTIC INTELLIGENCE · BUILDING",tone:"green"},
    {index:"03",title:"VOXGEN AI",heading:"Voice-first experimentation for useful GenAI.",desc:"A product-minded GenAI project exploring voice, language models and natural interaction patterns — built to move beyond a plain chat box into an actual experience.",chips:["GenAI","LLMs","Python","Voice UX"],live:"https://github.com/mahitech580/VoxGen-AI",repo:"https://github.com/mahitech580/VoxGen-AI",label:"GENERATIVE AI · VOICE",tone:"pink"},
    {index:"04",title:"TRIPPILOT",heading:"Travel planning presented like a product.",desc:"A visual travel planner combining destination discovery, itinerary structure and a story-led interface. Built as a static web experience with a strong emphasis on flow and visual rhythm.",chips:["HTML","CSS","JavaScript","Design"],live:"https://mahitech580.github.io/TripPilot-Travel-Planner/",repo:"https://github.com/mahitech580/TripPilot-Travel-Planner",label:"TRAVEL PRODUCT · LIVE",tone:"cyan"}
  ];
  let active=0;
  const setProject=i=>{
    active=(i+projects.length)%projects.length;const p=projects[active];
    $("#spotlightIndex").textContent=p.index;$("#spotlightTitle").textContent=p.title;$("#spotlightHeading").textContent=p.heading;$("#spotlightDesc").textContent=p.desc;$("#spotlightLabel").textContent=p.label;
    $("#spotlightLive").href=p.live;$("#spotlightRepo").href=p.repo;$("#spotlightCode").textContent="mahitech580 / "+p.title.toLowerCase().replaceAll(" ","-");
    $("#spotlightVisual").dataset.tone=p.tone;$("#spotProgress").style.width=((active+1)/projects.length*100)+"%";
    $("#spotlightChips").innerHTML=p.chips.map(c=>`<span class="chip">${c}</span>`).join("");
  };
  $("[data-spot-next]")?.addEventListener("click",()=>setProject(active+1));$("[data-spot-prev]")?.addEventListener("click",()=>setProject(active-1));setProject(0);
  $$(".project-card").forEach(card=>card.addEventListener("click",()=>setProject(Number(card.dataset.project)-1)));

  // GitHub public signal
  async function loadGithub(){
    const user=await fetch("https://api.github.com/users/mahitech580").then(r=>r.json());
    const repos=await fetch("https://api.github.com/users/mahitech580/repos?per_page=100&sort=updated").then(r=>r.json());
    if(user?.public_repos!=null)$("#ghRepos").textContent=user.public_repos;
    if(user?.followers!=null)$("#ghFollowers").textContent=user.followers;
    if(Array.isArray(repos)){
      const stars=repos.reduce((n,r)=>n+(r.stargazers_count||0),0);$("#ghStars").textContent=stars;
      const latest=repos[0]?.name||"—";$("#ghUpdated").textContent=latest.length>14?latest.slice(0,14)+"…":latest;
      $("#repoTicker").innerHTML=repos.slice(0,10).map(r=>`<a href="${r.html_url}" target="_blank" rel="noreferrer">${r.name.replaceAll("_"," ")} · ${r.language||"code"}</a>`).join("");
    }
  }
  loadGithub().catch(()=>{$("#repoTicker").innerHTML="<span class='loading-pill'>GitHub signal unavailable right now — source still linked above.</span>"});

  // Copy GitHub link
  $("#copyGithub")?.addEventListener("click",async()=>{
    const url="https://github.com/mahitech580";
    try{await navigator.clipboard.writeText(url);$("#copyNote").textContent="GitHub link copied.";setTimeout(()=>$("#copyNote").textContent="",2200)}
    catch{window.prompt("Copy this GitHub link:",url)}
  });

  // Smooth card tilt
  $$(".project-card,.github-panel,.contact-card").forEach(card=>{
    card.addEventListener("mousemove",e=>{if(innerWidth<900)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1000px) rotateX(${-y*2.5}deg) rotateY(${x*2.5}deg) translateY(-4px)`});
    card.addEventListener("mouseleave",()=>card.style.transform="");
  });
})();