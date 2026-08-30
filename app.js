const CONFIG = {
  brandName: "Drip.SC",
  adminPassword: "dripadmin",
  maxFileMB: 25
};

const seed = [
  {id:"seed1",firstName:"Drip",lastName:"Ballers",handle:"@drip.sc",playerTeam:"Community",category:"goals",title:"Cold celebration",description:"Featured community moment.",status:"approved",featured:true,mediaType:"image",media:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=85"},
  {id:"seed2",firstName:"Football",lastName:"Culture",handle:"@drip.sc",playerTeam:"Drip.SC",category:"skills",title:"Play with confidence",description:"Skill moves and matchday energy.",status:"approved",featured:true,mediaType:"image",media:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=75"},
  {id:"seed3",firstName:"Boot",lastName:"Watch",handle:"@drip.sc",playerTeam:"Community",category:"boots",title:"Boot check",description:"Fresh boots on the pitch.",status:"approved",featured:false,mediaType:"image",media:"https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=85"}
];

function getSubmissions(){
  const saved = JSON.parse(localStorage.getItem("dripsc_submissions") || "null");
  return saved || seed;
}
function saveSubmissions(data){ localStorage.setItem("dripsc_submissions", JSON.stringify(data)); }
function esc(s){ return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }

document.querySelectorAll("#brandName").forEach(e=>e.textContent=CONFIG.brandName);
document.title = `${CONFIG.brandName} — Football Culture`;

const grid = document.getElementById("wallGrid");
const empty = document.getElementById("emptyWall");
let activeFilter = "all";

function renderWall(){
  const items = getSubmissions().filter(x=>x.status==="approved" && (activeFilter==="all" || x.category===activeFilter));
  grid.innerHTML = "";
  empty.classList.toggle("hidden", items.length>0);
  items.forEach(x=>{
    const el=document.createElement("article");
    el.className="wall-item";
    el.innerHTML = `${x.mediaType==="video"?`<video src="${x.media}" muted playsinline></video>`:`<img src="${x.media}" alt="${esc(x.title)}">`}
      <span class="pin">${x.featured?"★":"•"}</span>
      <div class="wall-overlay"><strong>${esc(x.title)}</strong><small>${esc(x.handle)} • ${esc(x.category)}</small></div>`;
    el.addEventListener("click",()=>openViewer(x));
    grid.appendChild(el);
  });
}
function openViewer(x){
  const viewer=document.getElementById("viewer"), content=document.getElementById("viewerContent");
  content.innerHTML = `${x.mediaType==="video"?`<video src="${x.media}" controls autoplay></video>`:`<img src="${x.media}" alt="${esc(x.title)}">`}<div style="text-align:center;margin-top:14px"><b>${esc(x.title)}</b><div style="color:#9ca3b1;margin-top:5px">${esc(x.handle)}</div></div>`;
  viewer.classList.remove("hidden");
}
document.getElementById("closeViewer").onclick=()=>document.getElementById("viewer").classList.add("hidden");
document.getElementById("viewer").addEventListener("click",e=>{if(e.target.id==="viewer")e.currentTarget.classList.add("hidden")});

document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); activeFilter=b.dataset.filter; renderWall();
}));

const media=document.getElementById("media");
media.addEventListener("change",()=>{
  const f=media.files[0];
  document.getElementById("fileLabel").textContent=f?f.name:"Add photo or video";
});

document.getElementById("submissionForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const f=media.files[0];
  const msg=document.getElementById("formMessage");
  if(!f){msg.textContent="Please choose a file.";return}
  if(f.size>CONFIG.maxFileMB*1024*1024){msg.textContent=`File is larger than ${CONFIG.maxFileMB}MB.`;return}
  const reader=new FileReader();
  reader.onload=()=>{
    const fd=new FormData(e.target);
    const sub={id:crypto.randomUUID(),firstName:fd.get("firstName"),lastName:fd.get("lastName"),handle:fd.get("handle"),email:fd.get("email"),playerTeam:fd.get("playerTeam"),category:fd.get("category"),title:fd.get("title"),description:fd.get("description"),status:"pending",featured:false,mediaType:f.type.startsWith("video")?"video":"image",media:reader.result,createdAt:new Date().toISOString()};
    const data=getSubmissions(); data.unshift(sub); saveSubmissions(data);
    e.target.reset(); document.getElementById("fileLabel").textContent="Add photo or video";
    msg.textContent="Submission received! It is now waiting for review.";
    setTimeout(()=>msg.textContent="",5000);
  };
  reader.readAsDataURL(f);
});

document.getElementById("menuBtn").onclick=()=>document.getElementById("mobileMenu").classList.toggle("hidden");
document.querySelectorAll("#mobileMenu a").forEach(a=>a.onclick=()=>document.getElementById("mobileMenu").classList.add("hidden"));

const adminLogin=document.getElementById("adminLogin"), adminDash=document.getElementById("adminDashboard");
document.getElementById("adminLoginBtn").onclick=()=>{
  if(document.getElementById("adminPassword").value===CONFIG.adminPassword){
    adminLogin.classList.add("hidden"); adminDash.classList.remove("hidden"); renderAdmin();
  } else alert("Wrong password.");
};
function renderAdmin(){
  const list=document.getElementById("adminList"), data=getSubmissions();
  list.innerHTML=data.map(x=>`<div class="admin-card">
    ${x.mediaType==="video"?`<video class="admin-thumb" src="${x.media}" muted></video>`:`<img class="admin-thumb" src="${x.media}" alt="">`}
    <div class="admin-meta"><h4>${esc(x.title)}</h4><p>${esc(x.firstName)} ${esc(x.lastName)} • ${esc(x.handle)}</p><p>${esc(x.category)} • ${esc(x.playerTeam)}</p><span class="admin-status status-${x.status}">${x.status}</span></div>
    <div class="admin-actions">${x.status!=="approved"?`<button class="approve" onclick="setStatus('${x.id}','approved')">Approve</button>`:""}${x.status!=="rejected"?`<button onclick="setStatus('${x.id}','rejected')">Reject</button>`:""}${x.status==="approved"?`<button onclick="toggleFeature('${x.id}')">${x.featured?"Unfeature":"Feature"}</button>`:""}<button onclick="removeSub('${x.id}')">Delete</button></div>
  </div>`).join("");
}
window.setStatus=(id,status)=>{const d=getSubmissions();const x=d.find(a=>a.id===id);if(x)x.status=status;saveSubmissions(d);renderAdmin();renderWall()};
window.toggleFeature=(id)=>{const d=getSubmissions();const x=d.find(a=>a.id===id);if(x)x.featured=!x.featured;saveSubmissions(d);renderAdmin();renderWall()};
window.removeSub=id=>{saveSubmissions(getSubmissions().filter(x=>x.id!==id));renderAdmin();renderWall()};

document.getElementById("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(getSubmissions(),null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="drip-sc-submissions.json";a.click();URL.revokeObjectURL(a.href);
};
document.getElementById("clearBtn").onclick=()=>{
  if(confirm("Delete all submissions from this browser?")){localStorage.removeItem("dripsc_submissions");renderAdmin();renderWall();}
};
renderWall();
const celebrationMedia = document.getElementById('celebrationMedia');
if (celebrationMedia) celebrationMedia.addEventListener('change',()=>{
  const f=celebrationMedia.files[0];
  document.getElementById('celebrationFileLabel').textContent=f?f.name:'Add celebration photo or video';
});
const celebrationForm=document.getElementById('celebrationForm');
if(celebrationForm) celebrationForm.addEventListener('submit',e=>{
  e.preventDefault();
  const f=celebrationMedia.files[0], msg=document.getElementById('celebrationMessage');
  if(!f){msg.textContent='Please choose a file.';return}
  if(f.size>CONFIG.maxFileMB*1024*1024){msg.textContent=`File is larger than ${CONFIG.maxFileMB}MB.`;return}
  const reader=new FileReader();
  reader.onload=()=>{
    const fd=new FormData(e.target);
    const sub={id:crypto.randomUUID(),firstName:fd.get('playerName'),lastName:'',handle:fd.get('handle'),email:'',playerTeam:fd.get('team'),category:'celebrations',title:fd.get('title'),description:`Goal scorer: ${fd.get('scorer')||'N/A'}\n${fd.get('description')||''}`,status:'pending',featured:false,mediaType:f.type.startsWith('video')?'video':'image',media:reader.result,createdAt:new Date().toISOString(),submissionType:'celebration'};
    const data=getSubmissions(); data.unshift(sub); saveSubmissions(data); e.target.reset(); document.getElementById('celebrationFileLabel').textContent='Add celebration photo or video'; msg.textContent='Celebration submitted! It is now waiting for review.'; setTimeout(()=>msg.textContent='',5000);
  }; reader.readAsDataURL(f);
});
