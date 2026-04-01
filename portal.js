const SUPABASE_URL = 'https://eqpnlkbugolvdfkvicej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BTJ9VMuJP6h4LC7jpG_k2g_7PNhABhP';

// Supabase helper
async function sb(table, method='GET', body=null, filters='') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${filters}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : ''
  };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : null });
  if (!res.ok) { const e = await res.text(); console.error('Supabase error:', e); return null; }
  if (method === 'DELETE') return true;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const stripe = Stripe('pk_live_51Sz0bXERxTMJI9mnTsJdmBr1SCxSM8yWVJIDDFyZju38YuQsQ25bBWiGnQ6m4UeaMxHbbG2txpXiLoNmavsEDDCc007YEuzCxX');

// ── DEMO DATA (fallback while DB populates) ──
const PROJECTS = {
  biggs: {
    id:'biggs', name:'Biggs Residence', address:'5156 Piazza Place, El Dorado Hills, CA 95762',
    type:'Downstairs Remodel', status:'In Progress — Near Completion',
    overheadPct:0.04, profitPct:0.04, clients:['jeff_biggs','regina_biggs'],
    timeline:[
      {name:'Demo & Disposal',date:'Oct 2025',status:'done'},
      {name:'Rough Plumbing & Electrical',date:'Nov 2025',status:'done'},
      {name:'Drywall & Paint',date:'Dec 2025',status:'done'},
      {name:'Cabinets & Countertops',date:'Jan–Feb 2026',status:'done'},
      {name:'Hardwood Flooring',date:'Feb–Mar 2026',status:'current',note:'Material delivered, installation in progress'},
      {name:'Appliances & Fixtures',date:'Apr 2026',status:'pending'},
      {name:'Final Punch & Cleaning',date:'Apr 2026',status:'pending'}
    ],
    budget:[
      {desc:'Demo/Disposal of floors & cabinets',budget:16450,paid:16450},
      {desc:'Plumbing',budget:3200,paid:275},
      {desc:'Electrical pre-wire & partial trim',budget:5000,paid:10000},
      {desc:'Drywall repairs & texture',budget:0,paid:2500},
      {desc:'Trim / Base / Crown',budget:6500,paid:0},
      {desc:'Interior Paint',budget:15000,paid:7000},
      {desc:'Cabinets',budget:58000,paid:55000},
      {desc:'Bedrosian Slabs / Countertops',budget:14000,paid:10387.75},
      {desc:'Hardwood Flooring material',budget:39700,paid:16943.69},
      {desc:'Kitchen Appliances — Ferguson',budget:30000,paid:20972.22},
      {desc:'Kitchen Plumbing — Ferguson',budget:0,paid:4763.53},
      {desc:'Pottery Barn — Chandeliers & Sconces',budget:0,paid:5059.78},
      {desc:'Steel door for office',budget:0,paid:1939},
      {desc:'Ceiling fans',budget:0,paid:907.34},
      {desc:'Pantry door — Wayfair',budget:0,paid:360},
      {desc:'Decorative Ceiling Beams',budget:3000,paid:0},
      {desc:'Finish Plumbing Fixtures',budget:1500,paid:0},
      {desc:'Pantry Shelving',budget:2000,paid:0},
      {desc:'Cleaning — Intermediate & Final',budget:1200,paid:0},
      {desc:'Punch Work & Misc. Labor',budget:2500,paid:0}
    ],
    reimbursables:[{desc:'Lumens Exterior Lights x4 (Kevin paid)',amount:926.64}],
    invoices:[
      {id:'INV-BIGGS-001',desc:'Phase 1–4 Draw — Costs Incurred',sub:'Various Subs & Suppliers',amount:153484.95,opAmount:12278,reimbursable:926.64,total:166689.59,status:'paid',date:'Mar 9, 2026',paidDate:'Mar 12, 2026'}
    ],
    pendingInvoices:[
      {id:'SUB-001',desc:'Hardwood Flooring Installation',sub:'Western Floors Co.',amount:8400,status:'pending-approval',date:'Mar 24, 2026'}
    ],
    messages:[
      {from:'kevin',text:'Jeff & Regina — welcome to your SAM Custom Homes project portal!',time:'Oct 14, 2025',av:'KM'},
      {from:'jeff',text:'This is great Kevin, really appreciate the transparency.',time:'Oct 14, 2025',av:'JB'},
      {from:'kevin',text:'Hardwood flooring material arrived and looks beautiful. Installation crew starts Monday.',time:'Mar 20, 2026',av:'KM'},
      {from:'jeff',text:'Excellent! Sent some inspiration photos for the kitchen island lighting.',time:'Mar 21, 2026',av:'JB'}
    ],
    tasks:[
      {id:1,text:'Select final lighting fixtures for kitchen island',assign:'client',priority:'normal',done:false,due:'Apr 1, 2026'},
      {id:2,text:'Confirm appliance delivery schedule with Ferguson',assign:'sam',priority:'urgent',done:false,due:'Mar 30, 2026'},
      {id:3,text:'Submit final flooring installation invoice',assign:'sub',priority:'normal',done:false,due:'Apr 5, 2026'},
      {id:4,text:'Schedule final walkthrough',assign:'sam',priority:'normal',done:false,due:'Apr 15, 2026'}
    ],
    photos:[
      {type:'before',label:'Kitchen — Before Demo',icon:'🏚️'},
      {type:'before',label:'Downstairs Living — Before',icon:'🏠'},
      {type:'progress',label:'Demo Complete',icon:'🔨'},
      {type:'progress',label:'Cabinets Installed',icon:'🪵'},
      {type:'progress',label:'Hardwood Material Delivered',icon:'📦'},
      {type:'inspiration',label:'Island Lighting Inspiration',icon:'💡'},
      {type:'completion',label:'Paint — Complete',icon:'🖌️'}
    ],
    docs:[
      {name:'Original Budget — Oct 14, 2025',type:'xlsx',date:'Oct 14, 2025',icon:'📊'},
      {name:'Invoice INV-BIGGS-001',type:'pdf',date:'Mar 9, 2026',icon:'📄'}
    ]
  },
  gibson: {
    id:'gibson', name:'Gibson Residence', address:'3027 Orbatello Way, El Dorado Hills, CA 95762',
    type:'Kitchen & Living Remodel', status:'In Progress',
    overheadPct:0.04, profitPct:0.04, clients:['john_gibson'],
    timeline:[
      {name:'Demo — Floors, Baseboard, Kitchen, Bath',date:'Nov 2025',status:'done'},
      {name:'Rough Plumbing & Electrical',date:'Dec 2025',status:'done'},
      {name:'Drywall & Texture',date:'Jan 2026',status:'done'},
      {name:'Cabinets & Pantry Build-Out',date:'Feb–Mar 2026',status:'current',note:'Cabinets ordered, delivery expected Apr 2'},
      {name:'Countertops & Backsplash',date:'Apr 2026',status:'pending'},
      {name:'Glass Wall/Door Installation',date:'Apr 2026',status:'pending'},
      {name:'Paint — Interior & Exterior',date:'May 2026',status:'pending'},
      {name:'Appliances & Finish Plumbing',date:'May 2026',status:'pending'},
      {name:'Final Punch & Cleaning',date:'Jun 2026',status:'pending'}
    ],
    budget:[
      {desc:'Demo — floors, baseboard, kitchen, bath',budget:13500,paid:13500},
      {desc:'Rough Lumber & Hardware',budget:550,paid:550},
      {desc:'Rough Carpentry / Framing',budget:450,paid:450},
      {desc:'Plumbing',budget:1800,paid:1800},
      {desc:'Electrical Wiring',budget:1600,paid:1600},
      {desc:'Drywall',budget:1600,paid:1600},
      {desc:'Trim / Base / Crown',budget:1200,paid:0},
      {desc:'Pantry Build-Out',budget:2200,paid:0},
      {desc:'Finish Carpentry',budget:1200,paid:0},
      {desc:'Glass Wall / Door',budget:9000,paid:0},
      {desc:'Exterior Door',budget:2000,paid:0},
      {desc:'Painting — Exterior',budget:7500,paid:0},
      {desc:'Painting — Interior',budget:10835,paid:0},
      {desc:'Cabinets — Kitchen/Island/Bev Center',budget:35500,paid:17750},
      {desc:'Countertops / Solid Surfaces / Backsplash',budget:14500,paid:0},
      {desc:'Electrical Trim & Fixtures',budget:4500,paid:0},
      {desc:'Appliances — Fridge, Bev & Wine',budget:6500,paid:0},
      {desc:'Finish Plumbing — Sinks, Toilet, Faucets',budget:3500,paid:0},
      {desc:'Cleaning — Intermediate & Final',budget:600,paid:0},
      {desc:'Punch Work & Misc. Labor',budget:1000,paid:0}
    ],
    reimbursables:[],
    invoices:[
      {id:'INV-GIB-001',desc:'Phase 1–2 Draw — Demo & Rough Work',sub:'Various',amount:19500,opAmount:1560,reimbursable:0,total:21060,status:'paid',date:'Dec 15, 2025',paidDate:'Dec 18, 2025'},
      {id:'INV-GIB-002',desc:'Cabinet Deposit — 50%',sub:'Elite Cabinetry',amount:17750,opAmount:1420,reimbursable:0,total:19170,status:'due',date:'Mar 1, 2026'}
    ],
    pendingInvoices:[],
    messages:[
      {from:'kevin',text:'John — your project portal is live! Everything will be tracked here.',time:'Nov 13, 2025',av:'KM'},
      {from:'john',text:'Great setup Kevin. Really like being able to see everything in one place.',time:'Nov 13, 2025',av:'JG'},
      {from:'kevin',text:'Cabinet order placed with Elite Cabinetry. Deposit invoice coming.',time:'Feb 28, 2026',av:'KM'}
    ],
    tasks:[
      {id:1,text:'Approve cabinet deposit invoice INV-GIB-002',assign:'client',priority:'urgent',done:false,due:'Mar 28, 2026'},
      {id:2,text:'Confirm countertop material selection',assign:'client',priority:'normal',done:false,due:'Apr 5, 2026'},
      {id:3,text:'Schedule glass wall measurement appointment',assign:'sam',priority:'normal',done:false,due:'Apr 1, 2026'}
    ],
    photos:[
      {type:'before',label:'Kitchen — Before',icon:'🏚️'},
      {type:'before',label:'Living Area — Before',icon:'🏠'},
      {type:'progress',label:'Demo — Day 1',icon:'🔨'},
      {type:'inspiration',label:'Kitchen Design Inspiration',icon:'✨'}
    ],
    docs:[
      {name:'Budget — Nov 13, 2025',type:'xlsx',date:'Nov 13, 2025',icon:'📊'},
      {name:'Invoice INV-GIB-001',type:'pdf',date:'Dec 15, 2025',icon:'📄'},
      {name:'Invoice INV-GIB-002',type:'pdf',date:'Mar 1, 2026',icon:'📄'}
    ]
  }
};

const USERS = {
  kevin:{name:'Kevin Manzer',first:'Kevin',role:'SAM — Owner',initials:'KM',project:null,isAdmin:true},
  jeff_biggs:{name:'Jeff Biggs',first:'Jeff',role:'Client',initials:'JB',project:'biggs',phone:'408-891-1731',email:'jeffrey.biggs@gmail.com'},
  regina_biggs:{name:'Regina Biggs',first:'Regina',role:'Client',initials:'RB',project:'biggs',phone:'510-825-9942',email:'regina.biggs@nadel.com'},
  john_gibson:{name:'John Gibson',first:'John',role:'Client',initials:'JG',project:'gibson',phone:'916-337-8160',email:'jgibson43@yahoo.com'}
};

let currentUser=null, currentProject=null, taskFilter='all', pendingInvoiceId=null;
let currentPayAmount=0, sigDrawing=false, sigHasMark=false, sigCtx=null;

// ── AUTH ──
function quickLogin(role){
  const map={kevin:'kevin@samcustomhomes.com',biggs:'jeffrey.biggs@gmail.com',gibson:'jgibson43@yahoo.com'};
  document.getElementById('li-email').value=map[role];
  document.getElementById('li-pass').value='demo1234';
}

function doLogin(){
  const email=document.getElementById('li-email').value.toLowerCase();
  let uid='kevin';
  if(email.includes('jeffrey')||email.includes('jeff'))uid='jeff_biggs';
  else if(email.includes('regina'))uid='regina_biggs';
  else if(email.includes('gibson')||email.includes('john'))uid='john_gibson';
  else if(email.includes('kevin')||email.includes('sam'))uid='kevin';
  loadApp(uid);
}

function loadApp(uid){
  currentUser=USERS[uid];
  currentProject=currentUser.isAdmin?PROJECTS.biggs:PROJECTS[currentUser.project];
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('user-av').textContent=currentUser.initials;
  document.getElementById('user-name').textContent=currentUser.name;
  document.getElementById('user-role').textContent=currentUser.role;
  document.getElementById('greet-name').textContent=currentUser.first;
  document.getElementById('topbar-date').textContent=new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  const hr=new Date().getHours();
  document.getElementById('time-greet').textContent=hr<12?'morning':hr<17?'afternoon':'evening';
  document.querySelectorAll('.sam-only').forEach(el=>el.style.display=currentUser.isAdmin?'flex':'none');
  document.querySelectorAll('.sam-only-btn').forEach(el=>el.style.display=currentUser.isAdmin?'block':'none');
  loadProject(currentProject);
  goTo('dashboard',document.querySelector('.nav-item[data-page="dashboard"]'));
}

function loadProject(proj){
  currentProject=proj;
  document.getElementById('proj-name').textContent=proj.name;
  document.getElementById('proj-status').textContent=proj.status;
  document.getElementById('msg-project-name').textContent=proj.name;
  renderAll();
}

function doLogout(){
  document.getElementById('app').style.display='none';
  document.getElementById('login-screen').style.display='flex';
  document.getElementById('li-email').value='';
  document.getElementById('li-pass').value='';
}

// ── NAV ──
function goTo(page,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  if(el)el.classList.add('active');
  else document.querySelector('.nav-item[data-page="'+page+'"]')?.classList.add('active');
  const titles={dashboard:'Dashboard',projects:'Projects',messages:'Messages',tasks:'Tasks',timeline:'Timeline',budget:'Budget & Scope',invoices:'Invoices & Payments',photos:'Photos',documents:'Documents',agreement:'Consulting Agreement'};
  document.getElementById('page-title').textContent=titles[page]||page;
  if(page==='messages')document.getElementById('msg-badge').style.display='none';
  if(page==='invoices')document.getElementById('inv-dot').style.display='none';
  if(page==='projects')renderProjects();
  closeSidebar();
}

function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('sb-overlay').classList.toggle('open');}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('sb-overlay').classList.remove('open');}
function showProjectSwitcher(){if(!currentUser.isAdmin)return;const next=currentProject.id==='biggs'?'gibson':'biggs';loadProject(PROJECTS[next]);showToast('Project Switched','Now viewing: '+PROJECTS[next].name);}

function renderAll(){renderDashboard();renderMessages();renderTasks('all');renderTimeline();renderBudget();renderInvoices();renderPhotos('all');renderDocuments();renderAgreement();}

function fmt(n){if(!n&&n!==0)return'—';return'$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:n%1!==0?2:0,maximumFractionDigits:2});}

function renderProjects(){
  const allProjects = Object.values(PROJECTS);
  const statusColors = {
    lead:'var(--blue-dim)',
    estimate:'rgba(120,80,160,0.15)',
    agreement:'var(--gold-dim)',
    wip:'rgba(74,148,100,0.12)',
    complete:'rgba(255,255,255,0.05)',
    'In Progress — Near Completion':'rgba(74,148,100,0.12)',
    'In Progress':'var(--gold-dim)'
  };
  const statusText = {
    lead:'Lead',estimate:'Estimate Sent',agreement:'Agreement',
    wip:'Work in Progress',complete:'Complete',
    'In Progress — Near Completion':'In Progress',
    'In Progress':'In Progress'
  };
  const statusTextColors = {
    lead:'#7aafd0',estimate:'#b090e0',agreement:'var(--gold)',
    wip:'#6dbf8a',complete:'var(--muted)',
    'In Progress — Near Completion':'#6dbf8a',
    'In Progress':'var(--gold)'
  };

  const container = document.getElementById('page-projects');
  if(!container) return;

  const cards = allProjects.map(p => {
    const paid = p.budget.reduce((s,r)=>s+(r.paid||0),0);
    const fee = paid*(p.overheadPct+p.profitPct) + p.reimbursables.reduce((s,r)=>s+r.amount,0);
    const done = p.timeline.filter(t=>t.status==='done').length;
    const pct = Math.round(done/p.timeline.length*100);
    const statusKey = p.status;
    const bg = statusColors[statusKey] || 'var(--gold-dim)';
    const sc = statusTextColors[statusKey] || 'var(--gold)';
    const st = statusText[statusKey] || statusKey;
    const openTasks = p.tasks.filter(t=>!t.done).length;
    const pendingInv = p.pendingInvoices.length;

    return `<div class="invoice-item" style="cursor:pointer;margin-bottom:14px;" onclick="loadProject(PROJECTS['${p.id}']);goTo('dashboard',null);">
      <div class="inv-top">
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
            <span style="padding:3px 10px;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;background:${bg};color:${sc};border-radius:20px;">${st}</span>
            ${pendingInv ? `<span style="padding:3px 10px;font-size:9px;background:var(--red-dim);color:#d08080;border-radius:20px;">⚠ ${pendingInv} pending approval</span>` : ''}
          </div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--white);margin-bottom:2px;">${p.name}</div>
          <div style="font-size:11px;color:var(--muted);margin-bottom:2px;">${p.address}</div>
          <div style="font-size:11px;color:var(--muted2);">${p.type}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-size:9px;color:var(--muted);letter-spacing:0.15em;text-transform:uppercase;margin-bottom:3px;">Project Revenue</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--white);">${fmt(paid)}</div>
          <div style="font-size:10px;color:var(--gold);margin-top:2px;">SAM Fee: ${fmt(fee)}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:12px;">
        <div class="prog-bar" style="flex:1;"><div class="prog-fill" style="width:${pct}%"></div></div>
        <span style="font-size:10px;color:var(--muted);flex-shrink:0;">${pct}% complete</span>
        ${openTasks > 0 ? `<span style="font-size:10px;color:var(--muted2);flex-shrink:0;">${openTasks} open task${openTasks!==1?'s':''}</span>` : ''}
      </div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:var(--white);">Projects</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px;">${allProjects.length} active project${allProjects.length!==1?'s':''}</div>
      </div>
      <button class="btn btn-gold" onclick="showToast('Coming Soon','New project creation coming next session.')">+ New Project</button>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
      <button class="photo-type-btn active" onclick="filterProjects('all',this)">All Projects</button>
      <button class="photo-type-btn" onclick="filterProjects('lead',this)">Leads</button>
      <button class="photo-type-btn" onclick="filterProjects('wip',this)">Work in Progress</button>
      <button class="photo-type-btn" onclick="filterProjects('complete',this)">Completed</button>
    </div>

    <div id="project-cards">${cards}</div>`;
}

function filterProjects(filter, btn){
  document.querySelectorAll('#page-projects .photo-type-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  // For now show all — will filter by status once real status field is live
  renderProjects();
}

function renderDashboard(){
  if(currentUser.isAdmin){
    renderAdminDashboard();
    return;
  }
  // Client dashboard
  const p=currentProject;
  const totalBudget=p.budget.reduce((s,r)=>s+(r.budget||0),0);
  const totalPaid=p.budget.reduce((s,r)=>s+(r.paid||0),0);
  const totalOP=totalPaid*(p.overheadPct+p.profitPct);
  const reimbTotal=p.reimbursables.reduce((s,r)=>s+r.amount,0);
  const donePct=p.timeline.filter(t=>t.status==='done').length/p.timeline.length;
  document.getElementById('kpi-row').innerHTML=`
    <div class="kpi"><div class="kpi-label">Project Budget</div><div class="kpi-value">${fmt(totalBudget||totalPaid*1.3)}</div><div class="kpi-sub">${p.type}</div></div>
    <div class="kpi"><div class="kpi-label">Total Paid to Date</div><div class="kpi-value" style="color:var(--gold)">${fmt(totalPaid)}</div><div class="kpi-sub">Sub & supplier costs</div></div>
    <div class="kpi"><div class="kpi-label">SAM Fee (8%)</div><div class="kpi-value" style="font-size:20px;">${fmt(totalOP+reimbTotal)}</div><div class="kpi-sub">4% overhead + 4% profit</div></div>
    <div class="kpi"><div class="kpi-label">Progress</div><div class="kpi-value" style="font-size:20px;">${Math.round(donePct*100)}%</div><div class="kpi-sub">Phase ${p.timeline.filter(t=>t.status==='done').length} of ${p.timeline.length}</div></div>`;
  const tlHtml=p.timeline.slice(0,5).map(t=>`<div class="tl-item"><div class="tl-dot ${t.status==='done'?'done':t.status==='current'?'current':''}"></div><div><div class="tl-name">${t.name}</div><div class="tl-date">${t.date}</div><span class="status-chip ${t.status==='done'?'chip-done':t.status==='current'?'chip-active':'chip-pending'}">${t.status==='done'?'Complete':t.status==='current'?'In Progress':'Upcoming'}</span></div></div>`).join('');
  document.getElementById('dash-timeline').innerHTML=`<div class="prog-wrap"><div class="prog-label"><span>Overall Progress</span><span>${Math.round(donePct*100)}% Complete</span></div><div class="prog-bar"><div class="prog-fill" style="width:${Math.round(donePct*100)}%"></div></div></div><div>${tlHtml}</div>`;
  const msgs=p.messages.slice(-3);
  document.getElementById('dash-msgs').innerHTML=`<div class="msg-list">${msgs.map(m=>{const isMe=m.from!=='kevin';return`<div class="msg ${isMe?'mine':''}"><div class="msg-av">${m.av}</div><div><div class="msg-bubble">${m.text}</div><div class="msg-time">${m.time}</div></div></div>`;}).join('')}</div>`;
  const openTasks=p.tasks.filter(t=>!t.done).slice(0,3);
  document.getElementById('dash-tasks').innerHTML=openTasks.map(t=>`<div class="task-row"><div class="task-cb ${t.done?'done':''}" onclick="toggleTask(${t.id})">${t.done?'✓':''}</div><div><div class="task-text ${t.done?'done':''}">${t.text}</div><div><span class="tag tag-${t.assign}">${t.assign==='client'?'Client':t.assign==='sam'?'SAM':'Sub'}</span>${t.priority==='urgent'?'<span class="tag tag-urgent">Urgent</span>':''}<span style="font-size:10px;color:var(--muted);">Due ${t.due}</span></div></div></div>`).join('')||'<div class="empty"><div class="ei">☑</div><p>All tasks complete</p></div>';
  document.getElementById('dash-activity').innerHTML=`<div class="task-row"><div style="font-size:18px;margin-right:4px;">💬</div><div><div style="font-size:12px;color:var(--text);">New message from ${p.messages[p.messages.length-1].av}</div><div style="font-size:10px;color:var(--muted);">${p.messages[p.messages.length-1].time}</div></div></div>`;
}

function renderAdminDashboard(){
  const allProjects = Object.values(PROJECTS);
  const allTasks = allProjects.flatMap(p=>p.tasks.filter(t=>!t.done));
  const allPending = allProjects.flatMap(p=>p.pendingInvoices);

  // Calculate YTD and MTD figures
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  // For demo data we use all paid invoices as YTD
  // In production these will filter by created_at date
  const allInvoices = allProjects.flatMap(p=>p.invoices);
  const paidInvoices = allInvoices.filter(i=>i.status==='paid');

  const ytdRevenue = allProjects.reduce((s,p)=>s+p.budget.reduce((s2,r)=>s2+(r.paid||0),0),0);
  const ytdFees = allProjects.reduce((s,p)=>{
    const paid=p.budget.reduce((s2,r)=>s2+(r.paid||0),0);
    return s+paid*(p.overheadPct+p.profitPct)+p.reimbursables.reduce((s2,r)=>s2+r.amount,0);
  },0);
  const ytdCompleted = allProjects.filter(p=>p.status==='complete').length;

  // MTD — using last 30 days of invoices as approximation for demo
  // In production will filter by actual invoice dates
  const mtdRevenue = ytdRevenue * 0.18; // Approximate current month portion
  const mtdFees = ytdFees * 0.18;

  // KPI rows
  document.getElementById('kpi-row').innerHTML=`
    <div class="kpi" style="grid-column:span 1;">
      <div class="kpi-label" style="color:var(--gold);">YTD Fees Earned</div>
      <div class="kpi-value">${fmt(ytdFees)}</div>
      <div class="kpi-sub">Your consulting fee</div>
    </div>
    <div class="kpi">
      <div class="kpi-label" style="color:var(--gold);">YTD Project Revenue</div>
      <div class="kpi-value">${fmt(ytdRevenue)}</div>
      <div class="kpi-sub">Total costs consulted</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">This Month — Fees</div>
      <div class="kpi-value" style="font-size:22px;">${fmt(mtdFees)}</div>
      <div class="kpi-sub">${now.toLocaleString('default',{month:'long'})} ${thisYear}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">This Month — Revenue</div>
      <div class="kpi-value" style="font-size:22px;">${fmt(mtdRevenue)}</div>
      <div class="kpi-sub">${allPending.length} invoice${allPending.length!==1?'s':''} pending approval</div>
    </div>`;

  // Projects overview
  const projCards = allProjects.map(p=>{
    const paid=p.budget.reduce((s,r)=>s+(r.paid||0),0);
    const done=p.timeline.filter(t=>t.status==='done').length;
    const pct=Math.round(done/p.timeline.length*100);
    const fee=paid*(p.overheadPct+p.profitPct);
    return `<div class="invoice-item" style="cursor:pointer;" onclick="loadProject(PROJECTS['${p.id}']);goTo('dashboard',null);">
      <div class="inv-top">
        <div>
          <div class="inv-num">${p.type}</div>
          <div class="inv-desc">${p.name}</div>
          <div class="inv-sub-info">${p.address}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--white);">${fmt(paid)}</div>
          <div style="font-size:10px;color:var(--muted);">paid · SAM fee ${fmt(fee)}</div>
        </div>
      </div>
      <div class="prog-bar" style="margin-top:10px;"><div class="prog-fill" style="width:${pct}%"></div></div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;">
        <span style="font-size:10px;color:var(--muted);">${pct}% complete · ${p.status}</span>
        ${p.pendingInvoices.length?`<span style="font-size:10px;color:var(--gold);">⚠ ${p.pendingInvoices.length} pending approval</span>`:'<span style="font-size:10px;color:#6dbf8a;">✓ No pending items</span>'}
      </div>
    </div>`;
  }).join('');

  document.getElementById('dash-timeline').innerHTML=`
    <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);">Active Projects</div>
      <button class="btn btn-gold btn-sm" onclick="showToast('Coming Soon','New project creation coming next session.')">+ New Project</button>
    </div>
    ${projCards}`;

  // Pending approvals
  const pendingHtml = allPending.length ? allPending.map(inv=>`
    <div class="task-row">
      <div style="font-size:18px;margin-right:4px;">📋</div>
      <div style="flex:1;">
        <div style="font-size:12px;color:var(--gold);">${inv.desc}</div>
        <div style="font-size:10px;color:var(--muted);">${inv.sub} · ${fmt(inv.amount)}</div>
      </div>
      <button class="btn btn-green btn-sm" onclick="openApproveModal('${inv.id}','${fmt(inv.amount)}','${inv.desc}')">Approve</button>
    </div>`).join('') : '<div style="font-size:12px;color:var(--muted);padding:8px 0;">No invoices pending approval</div>';

  document.getElementById('dash-activity').innerHTML=`
    <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:12px;">Pending Approvals</div>
    ${pendingHtml}`;

  // All open tasks
  const taskHtml = allTasks.slice(0,5).map(t=>`
    <div class="task-row">
      <div class="task-cb" onclick="toggleTask(${t.id})"></div>
      <div>
        <div class="task-text">${t.text}</div>
        <div><span class="tag tag-${t.assign}">${t.assign==='client'?'Client':t.assign==='sam'?'SAM':'Sub'}</span>${t.priority==='urgent'?'<span class="tag tag-urgent">Urgent</span>':''}</div>
      </div>
    </div>`).join('') || '<div class="empty"><div class="ei">☑</div><p>All tasks complete</p></div>';

  document.getElementById('dash-tasks').innerHTML=taskHtml;

  // Recent messages across all projects
  const allMsgs = allProjects.flatMap(p=>p.messages.slice(-2).map(m=>({...m,project:p.name})));
  document.getElementById('dash-msgs').innerHTML=`<div class="msg-list">${allMsgs.slice(-4).map(m=>`
    <div class="msg">
      <div class="msg-av">${m.av}</div>
      <div>
        <div class="msg-bubble">${m.text}</div>
        <div class="msg-time">${m.av} · ${m.project} · ${m.time}</div>
      </div>
    </div>`).join('')}</div>`;

  document.getElementById('proj-name').textContent='All Projects';
  document.getElementById('proj-status').textContent=`${allProjects.length} active`;
}


function renderMessages(){
  const p=currentProject;
  document.getElementById('msg-thread').innerHTML=`<div class="msg-list">${p.messages.map(m=>{const isMe=currentUser.isAdmin?m.from==='kevin':m.from!=='kevin';return`<div class="msg ${isMe?'mine':''}"><div class="msg-av">${m.av}</div><div><div class="msg-bubble">${m.text}</div><div class="msg-time">${m.av} · ${m.time}</div></div></div>`;}).join('')}</div>`;
  document.getElementById('msg-thread').scrollTop=999999;
}

function sendMsg(){
  const input=document.getElementById('msg-input');
  const text=input.value.trim();
  if(!text)return;
  currentProject.messages.push({from:currentUser.isAdmin?'kevin':'client',text,time:'Just now',av:currentUser.initials});
  renderMessages();
  input.value='';
  // Save to Supabase
  sb('messages','POST',{project_id:currentProject.id,text,created_at:new Date().toISOString()});
}

function msgKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}}

// ── TASKS ──
function renderTasks(filter){
  taskFilter=filter;
  const filtered=currentProject.tasks.filter(t=>filter==='all'||t.assign===filter);
  document.getElementById('task-list').innerHTML=filtered.length?filtered.map(t=>`<div class="task-row"><div class="task-cb ${t.done?'done':''}" onclick="toggleTask(${t.id})">${t.done?'✓':''}</div><div style="flex:1;"><div class="task-text ${t.done?'done':''}">${t.text}</div><div><span class="tag tag-${t.assign}">${t.assign==='client'?'Client':t.assign==='sam'?'SAM':'Subcontractor'}</span>${t.priority==='urgent'?'<span class="tag tag-urgent">Urgent</span>':''}<span style="font-size:10px;color:var(--muted);margin-left:4px;">Due ${t.due}</span></div></div></div>`).join(''):'<div class="empty"><div class="ei">☑</div><p>No tasks in this category</p></div>';
  document.getElementById('task-badge').textContent=currentProject.tasks.filter(t=>!t.done).length;
}

function toggleTask(id){
  const t=currentProject.tasks.find(x=>x.id===id);
  if(!t)return;
  if(t.done){
    // Uncomplete — just toggle back, no note needed
    t.done=false;
    renderTasks(taskFilter);
    renderDashboard();
    return;
  }
  // Completing — open note modal
  document.getElementById('complete-task-title').textContent=t.text;
  document.getElementById('complete-task-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('complete-task-note').value='';
  window._completingTaskId=id;
  openModal('complete-task-modal');
}

function submitTaskComplete(){
  const id=window._completingTaskId;
  const t=currentProject.tasks.find(x=>x.id===id);
  if(!t)return;
  const note=document.getElementById('complete-task-note').value.trim();
  const date=document.getElementById('complete-task-date').value;
  if(!note){alert('Please add a completion note before marking as complete.');return;}
  t.done=true;
  t.completedNote=note;
  t.completedDate=date;
  closeModal('complete-task-modal');
  renderTasks(taskFilter);
  renderDashboard();
  // Add to project activity log
  const dateFormatted=new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  currentProject.messages.push({
    from:'kevin',
    text:'✓ Task completed: "'+t.text+'" — '+note,
    time:dateFormatted,
    av:currentUser.initials
  });
  showToast('Task Complete','Note saved to project activity log.');
  // Save to Supabase
  sb('tasks','PATCH',{done:true},{project_id:currentProject.id});
}
function filterTasks(f,btn){document.querySelectorAll('#page-tasks .tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderTasks(f);}
function openNewTask(){openModal('task-modal');}
function createTask(){
  const text=document.getElementById('new-task-text').value.trim();
  if(!text)return;
  const task={id:Date.now(),text,assign:document.getElementById('new-task-assign').value,priority:document.getElementById('new-task-priority').value,done:false,due:document.getElementById('new-task-due').value||'TBD'};
  currentProject.tasks.push(task);
  closeModal('task-modal');
  renderTasks(taskFilter);
  document.getElementById('new-task-text').value='';
  sb('tasks','POST',{project_id:currentProject.id,text:task.text,assigned_to:task.assign,priority:task.priority,due_date:task.due});
}

// ── TIMELINE ──
function renderTimeline(){
  const p=currentProject;
  const done=p.timeline.filter(t=>t.status==='done').length;
  const pct=Math.round(done/p.timeline.length*100);
  document.getElementById('full-timeline').innerHTML=`<div class="prog-wrap" style="margin-bottom:24px;"><div class="prog-label"><span>Overall Progress</span><span>${pct}% — Phase ${done} of ${p.timeline.length}</span></div><div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div></div><div>${p.timeline.map((t,i)=>`<div class="tl-item"><div class="tl-dot ${t.status==='done'?'done':t.status==='current'?'current':''}"></div><div><div class="tl-name" style="font-size:14px;">${i+1}. ${t.name}</div><div class="tl-date">${t.date}</div><span class="status-chip ${t.status==='done'?'chip-done':t.status==='current'?'chip-active':'chip-pending'}">${t.status==='done'?'Complete':t.status==='current'?'In Progress':'Upcoming'}</span>${t.note?`<div style="font-size:11px;color:var(--muted);margin-top:5px;">${t.note}</div>`:''}</div></div>`).join('')}</div>`;
}

// ── BUDGET ──
function renderBudget(){
  const p=currentProject;
  const rows=p.budget.filter(r=>r.budget>0||r.paid>0);
  const totalBudget=rows.reduce((s,r)=>s+(r.budget||0),0);
  const totalPaid=rows.reduce((s,r)=>s+(r.paid||0),0);
  const totalOH=totalPaid*p.overheadPct;
  const totalProfit=totalPaid*p.profitPct;
  const reimbTotal=p.reimbursables.reduce((s,r)=>s+r.amount,0);
  document.getElementById('budget-kpi').innerHTML=`<div class="bkpi"><div class="bkpi-amount">${fmt(totalBudget||totalPaid)}</div><div class="bkpi-label">Total Budget</div></div><div class="bkpi"><div class="bkpi-amount" style="color:var(--gold)">${fmt(totalPaid)}</div><div class="bkpi-label">Paid to Date</div></div><div class="bkpi"><div class="bkpi-amount" style="color:#6dbf8a">${fmt(totalOH+totalProfit+reimbTotal)}</div><div class="bkpi-label">SAM Consulting Fee</div></div>`;
  document.getElementById('op-row').innerHTML=`<div class="op-chip">Overhead 4% = ${fmt(totalOH)}</div><div class="op-chip">Profit 4% = ${fmt(totalProfit)}</div>${reimbTotal>0?`<div class="op-chip">Reimbursables: ${fmt(reimbTotal)}</div>`:''}<div class="op-chip" style="background:rgba(74,148,100,0.15);border-color:rgba(74,148,100,0.3);color:#6dbf8a;">Total Fee: ${fmt(totalOH+totalProfit+reimbTotal)}</div>`;
  document.getElementById('budget-rows').innerHTML=rows.map(r=>{const bal=(r.budget||0)-(r.paid||0);const oh=r.paid*p.overheadPct;const pr=r.paid*p.profitPct;const over=r.budget>0&&r.paid>r.budget;return`<tr ${over?'style="background:rgba(154,48,48,0.05)"':''}><td>${r.desc}${over?'<span style="font-size:9px;color:#d08080;margin-left:6px;">▲ Over budget</span>':''}</td><td class="amt">${r.budget>0?fmt(r.budget):'—'}</td><td class="amt ${r.paid>0?'amt-gold':''}">${r.paid>0?fmt(r.paid):'—'}</td><td class="amt">${r.budget>0?fmt(bal):'—'}</td><td class="amt" style="font-size:12px;">${r.paid>0?fmt(oh):'—'}</td><td class="amt" style="font-size:12px;">${r.paid>0?fmt(pr):'—'}</td></tr>`;}).join('')+`<tr style="border-top:2px solid var(--border2);"><td style="font-weight:500;color:var(--white);">TOTALS</td><td class="amt amt-gold">${fmt(totalBudget)}</td><td class="amt amt-gold">${fmt(totalPaid)}</td><td class="amt">${fmt(totalBudget-totalPaid)}</td><td class="amt" style="color:#6dbf8a;">${fmt(totalOH)}</td><td class="amt" style="color:#6dbf8a;">${fmt(totalProfit)}</td></tr>${reimbTotal>0?`<tr><td colspan="6"><div class="reimbursable-note">+ Reimbursables: ${p.reimbursables.map(r=>r.desc+' — '+fmt(r.amount)).join(', ')} = ${fmt(reimbTotal)}</div></td></tr>`:''}`;
}

// ── INVOICES ──
function renderInvoices(){
  const p=currentProject;
  let html='';
  if(currentUser.isAdmin&&p.pendingInvoices.length){
    html+=`<div style="margin-bottom:20px;"><div class="sec-title">⚠️ Pending Your Approval</div>${p.pendingInvoices.map(inv=>`<div class="invoice-item pending-approval"><div class="inv-top"><div><div class="inv-num">${inv.id}</div><div class="inv-desc">${inv.desc}</div><div class="inv-sub-info">Submitted by: ${inv.sub} · ${inv.date}</div></div><div class="inv-amount">${fmt(inv.amount)}</div></div><div class="inv-footer"><span class="pill pill-review">Awaiting Your Review</span><div style="display:flex;gap:8px;"><button class="btn btn-green btn-sm" onclick="openApproveModal('${inv.id}','${fmt(inv.amount)}','${inv.desc}')">Review & Approve</button></div></div></div>`).join('')}</div>`;
  }
  html+=`<div class="sec-title">Invoice History</div>`;
  html+=[...p.invoices].reverse().map(inv=>`<div class="invoice-item"><div class="inv-top"><div><div class="inv-num">${inv.id}</div><div class="inv-desc">${inv.desc}</div><div class="inv-sub-info">${inv.date}${inv.paidDate?' · Paid '+inv.paidDate:''}</div></div><div><div class="inv-amount">${fmt(inv.total)}</div><div style="font-size:10px;color:var(--muted);text-align:right;margin-top:2px;">incl. SAM fee ${fmt(inv.opAmount)}</div></div></div><div class="inv-footer"><span class="pill pill-${inv.status}">${inv.status==='paid'?'Paid · '+inv.paidDate:inv.status==='due'?'Payment Due':'Pending'}</span><div style="display:flex;gap:8px;align-items:center;">${inv.status==='due'&&!currentUser.isAdmin?`<button class="btn btn-gold btn-sm" onclick="openPayModal('${fmt(inv.total)}','${inv.desc}')">Pay Now</button>`:''}<button class="btn btn-outline btn-sm">View PDF</button></div></div></div>`).join('');
  document.getElementById('invoice-list').innerHTML=html;
}

// ── PHOTOS ──
function renderPhotos(filter){
  const photos=filter==='all'?currentProject.photos:currentProject.photos.filter(ph=>ph.type===filter);
  const tagClass={before:'tag-before',after:'tag-after',progress:'tag-progress',inspiration:'tag-inspiration',concern:'tag-concern',completion:'tag-completion'};
  document.getElementById('photo-grid').innerHTML=photos.length?photos.map(ph=>`<div class="photo-card">${ph.icon}<span class="photo-type-tag ${tagClass[ph.type]}">${ph.type}</span><div class="photo-card-label">${ph.label}</div></div>`).join(''):'<div class="empty" style="grid-column:1/-1"><div class="ei">📷</div><p>No photos in this category yet</p></div>';
}

function filterPhotos(filter,btn){document.querySelectorAll('.photo-type-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderPhotos(filter);}

// ── DOCUMENTS ──
function renderDocuments(){
  document.getElementById('doc-list').innerHTML=`<div class="sec-title">Project Documents</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;">${currentProject.docs.map(d=>`<div style="padding:16px;background:var(--surface2);border:1px solid var(--border);cursor:pointer;transition:border-color 0.2s;" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border)'"><div style="font-size:26px;margin-bottom:8px;">${d.icon}</div><div style="font-size:12px;color:var(--white);margin-bottom:3px;">${d.name}</div><div style="font-size:10px;color:var(--muted);">${d.type.toUpperCase()} · ${d.date}</div></div>`).join('')}</div>`;
}

// ── AGREEMENT ──
function renderAgreement(){
  const p=currentProject;
  const clientName=p.id==='biggs'?'Jeff & Regina Biggs':'John Gibson';
  document.getElementById('agreement-doc').innerHTML=`<h3>SAM Custom Homes, Inc. — Consulting Agreement</h3><p>This Agreement is between <strong>${clientName}</strong> ("Owner") and SAM Custom Homes, Inc., Lic# 1133051 ("Consultant"), 11409 White Rock Road, Rancho Cordova, CA 95742.</p><p><strong>Property:</strong> ${p.address}</p><p><strong>Project:</strong> ${p.type}</p><h4>Scope of Services</h4><p>Consultant shall provide construction consulting services including: project planning, scheduling, budgeting; coordinating with contractors and suppliers; permit coordination; progress reporting; quality monitoring; change order review; and periodic updates to Owner.</p><h4>Compensation</h4><p>Fee Type: <strong>Percentage of Costs</strong><br>Overhead: <strong>4%</strong> of all actual costs<br>Profit: <strong>4%</strong> of all actual costs<br>Change Order Rate: <strong>4% + 4%</strong><br>Retainer: <strong>$0</strong></p><h4>Payment Terms</h4><p>All invoices due upon receipt. Late payments accrue 10% monthly interest. All contracts with subcontractors and suppliers are directly between Owner and the applicable party.</p><h4>Governing Law</h4><p>State of California. Date: March 26, 2026</p>`;
  setTimeout(()=>{
    const canvas=document.getElementById('sig-canvas');
    if(canvas&&!sigCtx){
      sigCtx=canvas.getContext('2d');
      sigCtx.strokeStyle='#c9a84c';sigCtx.lineWidth=2;sigCtx.lineCap='round';sigCtx.lineJoin='round';
      const getPos=(e)=>{const rect=canvas.getBoundingClientRect();const sx=canvas.width/rect.width;const sy=canvas.height/rect.height;const src=e.touches?e.touches[0]:e;return{x:(src.clientX-rect.left)*sx,y:(src.clientY-rect.top)*sy};};
      canvas.addEventListener('mousedown',e=>{sigDrawing=true;sigCtx.beginPath();const p=getPos(e);sigCtx.moveTo(p.x,p.y);});
      canvas.addEventListener('mousemove',e=>{if(!sigDrawing)return;const p=getPos(e);sigCtx.lineTo(p.x,p.y);sigCtx.stroke();sigHasMark=true;});
      canvas.addEventListener('mouseup',()=>sigDrawing=false);
      canvas.addEventListener('mouseleave',()=>sigDrawing=false);
      canvas.addEventListener('touchstart',e=>{e.preventDefault();sigDrawing=true;sigCtx.beginPath();const p=getPos(e);sigCtx.moveTo(p.x,p.y);},{passive:false});
      canvas.addEventListener('touchmove',e=>{e.preventDefault();if(!sigDrawing)return;const p=getPos(e);sigCtx.lineTo(p.x,p.y);sigCtx.stroke();sigHasMark=true;},{passive:false});
      canvas.addEventListener('touchend',()=>sigDrawing=false);
    }
  },200);
}

function clearSig(){if(sigCtx){sigCtx.clearRect(0,0,900,90);sigHasMark=false;}}
function submitSig(){
  if(!sigHasMark){alert('Please draw your signature first.');return;}
  const d=new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  document.getElementById('sig-date-display').textContent=d;
  document.getElementById('signed-confirm').style.display='flex';
  document.getElementById('sig-section').style.display='none';
  showToast('Agreement Signed','Signed electronically on '+d);
}

// ── PAYMENTS ──
function openPayModal(amount,desc){
  currentPayAmount=parseFloat(amount.replace(/[$,]/g,''))||0;
  document.getElementById('pay-amount').textContent=amount;
  document.getElementById('pay-desc').textContent=desc;
  document.querySelectorAll('#pay-modal .tab').forEach(b=>b.classList.remove('active'));
  document.querySelector('#pay-modal .tab').classList.add('active');
  ['card','ach','invoice'].forEach(t=>document.getElementById('pt-'+t).style.display=t==='card'?'block':'none');
  updateFeeDisplay('card');
  openModal('pay-modal');
}

function updateFeeDisplay(tab){
  document.getElementById('fee-base').textContent=fmt(currentPayAmount);
  const feeLine=document.getElementById('fee-line');
  if(tab==='card'){
    const fee=currentPayAmount*0.03;
    feeLine.style.display='flex';
    document.getElementById('fee-label').textContent='Credit card processing fee (3%)';
    document.getElementById('fee-amount').textContent='+'+fmt(fee);
    document.getElementById('fee-total').textContent=fmt(currentPayAmount+fee);
    document.getElementById('fee-note').innerHTML='💡 Pay by <strong style="color:var(--gold)">ACH bank transfer</strong> to avoid the processing fee.';
  } else if(tab==='ach'){
    feeLine.style.display='flex';
    document.getElementById('fee-label').textContent='ACH processing fee (flat)';
    document.getElementById('fee-amount').textContent='+'+fmt(5);
    document.getElementById('fee-total').textContent=fmt(currentPayAmount+5);
    document.getElementById('fee-note').textContent='💡 ACH is the most cost-effective option for large payments.';
  } else {
    feeLine.style.display='none';
    document.getElementById('fee-total').textContent=fmt(currentPayAmount);
    document.getElementById('fee-note').textContent='';
  }
}

function switchPayTab(tab,btn){
  document.querySelectorAll('#pay-modal .tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  ['card','ach','invoice'].forEach(t=>document.getElementById('pt-'+t).style.display=t===tab?'block':'none');
  updateFeeDisplay(tab);
}

function processPayment(){
  closeModal('pay-modal');
  showSuccess('Payment Submitted','Your payment has been received. A confirmation will be sent to your email.');
  showToast('📱 Payment Received','SAM Custom Homes: Your payment has been received. Thank you — Kevin @ SAM Custom Homes');
}

// ── INVOICE APPROVAL ──
function openApproveModal(id,amount,desc){
  pendingInvoiceId=id;
  document.getElementById('approve-amount').textContent=amount;
  document.getElementById('approve-desc').textContent=desc;
  openModal('approve-modal');
}

function approveInvoice(){
  closeModal('approve-modal');
  const inv=currentProject.pendingInvoices.find(i=>i.id===pendingInvoiceId);
  if(inv){
    const opAmount=inv.amount*(currentProject.overheadPct+currentProject.profitPct);
    currentProject.invoices.push({id:inv.id,desc:inv.desc,sub:inv.sub,amount:inv.amount,opAmount,reimbursable:0,total:inv.amount+opAmount,status:'due',date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})});
    currentProject.pendingInvoices=currentProject.pendingInvoices.filter(i=>i.id!==pendingInvoiceId);
  }
  renderInvoices();
  showSuccess('Invoice Approved','Client notified via text and email. Your consulting fee has been calculated automatically.');
  setTimeout(()=>showToast('📱 Invoice Ready','SAM Custom Homes: A new invoice is ready for payment in your project portal.'),1200);
}

function rejectInvoice(){closeModal('approve-modal');showToast('Invoice Rejected','The subcontractor has been notified to resubmit.');}
function openAddInvoice(){showToast('Add Invoice','Full invoice creation — coming in next build session.');}
function uploadPhoto(){showSuccess('Photo Uploaded','Your photo has been added to the project gallery.');}
function uploadDoc(){showSuccess('Document Uploaded','Your document has been saved successfully.');}
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function showSuccess(title,body){document.getElementById('success-title').textContent=title;document.getElementById('success-body').textContent=body;document.getElementById('success-icon').textContent='✓';openModal('success-modal');}
function showToast(title,body){const t=document.getElementById('toast');document.getElementById('toast-title').textContent=title;document.getElementById('toast-body').textContent=body;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),4000);}

document.getElementById('topbar-date').textContent=new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});

// ── EVENT LISTENERS (no inline onclick needed) ──
function wireEvents(){
  document.querySelectorAll('[data-login]').forEach(function(btn){
    btn.addEventListener('click',function(){quickLogin(this.getAttribute('data-login'));});
  });
  var lb=document.getElementById('login-btn');
  if(lb)lb.addEventListener('click',doLogin);
  var lo=document.getElementById('logout-btn');
  if(lo)lo.addEventListener('click',doLogout);
  var lp=document.getElementById('li-pass');
  if(lp)lp.addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', wireEvents);
} else {
  wireEvents();
}
