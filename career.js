(()=>{"use strict";
const SAVE_KEY="golfpro_career_18hole_v1";
const engine=window.GolfEngine;
const course=[
 [4,420,"The Opening",10,-10,1],[5,528,"Long Reach",7,7,0],[3,166,"Heather Bank",13,-13,0],
 [4,398,"Old Quarry",6,6,0],[4,447,"Stone Wall",12,-12,1],[3,185,"Valley Short",4,4,0],
 [5,557,"The Long Mile",9,-9,1],[4,374,"Birch Corner",8,8,0],[4,433,"Homeward",11,-11,1],
 [4,411,"The Turn",5,5,0],[3,148,"The Dip",12,-12,1],[5,536,"Gorse Reach",8,8,0],
 [4,445,"Red Barn",10,10,1],[4,386,"The Orchard",6,-6,0],[3,199,"Island Approach",14,-14,1],
 [5,548,"Last Chance",7,7,0],[4,429,"Pennine Ridge",11,11,1],[4,421,"Clubhouse",10,-10,1]
].map((x,i)=>({number:i+1,par:x[0],yards:x[1],name:x[2],wind:x[3],windX:x[4],windY:i%4===0?-3:i%4===2?3:0,water:!!x[5]}));
function blank(){return{bank:3000,earnings:4790,level:3,xp:720,skillPoints:0,attributes:{driving:60,irons:64,short:51,putting:54,mental:45,fitness:65},sponsor:{status:"pending",brand:"Mizuno"},equipment:{irons:60},tournament:{status:"not_started",entryPaid:false,rounds:[],position:null,prize:0},session:null,history:[],settings:{fast:false}}}
let career=blank();
try{let v=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");if(v&&v.attributes&&v.tournament){career={...blank(),...v,settings:{...blank().settings,...v.settings}}}}catch(e){}
window.golfFastAnimations=!!career.settings.fast;
let tab="home",lastPage="home",modal=null,animatingShot=false;
const money=n=>"£"+Number(n||0).toLocaleString("en-GB");
const scoreText=n=>n===0?"E":n>0?"+"+n:String(n);
const save=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(career))}catch(e){}};
const byId=id=>document.getElementById(id);
const p=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e};
const parTotal=course.reduce((a,h)=>a+h.par,0);
function scoreTotal(scores,upto=18){let par=0,strokes=0,holes=0;for(let i=0;i<Math.min(upto,18);i++){if(scores[i]){strokes+=scores[i].score;par+=course[i].par;holes++}}return{strokes,par,relative:strokes-par,holes}}
function getCurrent(){return career.session}
function statusSponsor(){return career.sponsor.status==="active"?"Mizuno · Active":career.sponsor.status==="pending"?"Mizuno · Offer pending":career.sponsor.status==="rejected"?"No sponsor · Offer rejected":"No sponsor · Offer withdrawn"}
function currentRoundText(){const s=getCurrent();return s?(s.mode==="practice"?"Practice Round":"Northern Masters · R"+s.roundNumber):"No round underway"}
function stat(label,val){return '<div class="c-stat"><strong>'+val+'</strong><small>'+label+'</small></div>'}
function row(label,value){return '<div class="c-row"><span>'+label+'</span><strong>'+value+'</strong></div>'}
function btn(label,action,type=""){return '<button class="c-button '+type+'" data-action="'+action+'" type="button">'+label+'</button>'}
function cardHeader(title,desc){return '<div class="c-panel"><h2>'+title+'</h2><p>'+desc+'</p>'}
function home(){let s=getCurrent(),t=career.tournament;let h='<div class="c-hero"><div class="c-tag">SEASON 1 · WEEK 5 · MINI TOUR</div><h1>Road to World No. 1</h1><div class="sub">Your professional golf career starts here. Develop your golfer, choose your schedule and work your way up the tours.</div><div class="c-grid">'+stat("Bank",money(career.bank))+stat("Career earnings",money(career.earnings))+stat("Level",String(career.level))+'</div></div>';
if(s){let total=scoreTotal(s.scores);h+=cardHeader("Your round is in progress",currentRoundText()+" · Hole "+(s.current+1)+"/18 · "+total.holes+" completed · "+scoreText(total.relative)+" vs par")+btn("▶ Resume Round","resume")+'</div>'}
else{h+=cardHeader("Next event · Northern Masters","Mini Tour · "+money(20000)+" prize purse · "+money(175)+" entry fee · 72-hole tournament")+btn(t.status==="not_started"?"Enter Tournament · £175":t.status==="playing"?"Play Tournament · Round "+(t.rounds.length+1):t.status==="completed"?"Tournament Completed":"Missed Cut · Tournament Finished", "tournament",t.status==="completed"||t.status==="cut"?"secondary":"")+'</div>';h+=cardHeader("Play without career risk","18-hole practice round. Scores and skips don't affect your earnings, XP or tournament entry.")+btn("Play 18-Hole Practice Round","practice","secondary")+'</div>';}
h+=cardHeader("Career overview","Your progress is saved in this browser.")+row("Previous finish","Yorkshire Open · T6 (−8)")+row("XP",career.xp+" / 1,000")+row("Skill points",career.skillPoints)+row("Equipment sponsor",statusSponsor())+'</div>';
if(career.lastRound){let r=career.lastRound;h+=cardHeader("Last completed round",(r.mode==="practice"?"Practice":"Northern Masters R"+r.roundNumber)+" · "+r.score+" strokes · "+scoreText(r.relative)+" to par")+'<p>'+r.played+' holes played · '+r.simulated+' simulated</p>'+btn("View last scorecard","lastscore","secondary")+'</div>'}
return h;
}
function season(){let t=career.tournament;let h=cardHeader("Season calendar","Advance your career by entering events. The Northern Masters is the next available tour event.");
h+=row("Week 4","Yorkshire Open · T6 · £540");
h+=row("Week 5","Northern Masters · "+money(20000)+" purse");
h+=row("Tournament status",t.status.replace("_"," "));
h+=row("Entry fee","£175"+(t.entryPaid?" · paid":" · not yet paid"));
h+=row("Rounds completed",t.rounds.length+" / 4");
for(let j=0;j<t.rounds.length;j++){let sc=scoreTotal(t.rounds[j]);h+=row("Round "+(j+1),sc.strokes+" ("+scoreText(sc.relative)+")")}
if(t.status==="completed")h+=row("Final result","P"+t.position+" · "+money(t.prize));
h+='</div>'+cardHeader("How tour progression works","Tournament finishes earn cash, XP and reputation. Your actual shot choices determine played-hole scores. Skipped holes are simulated using your ability and course difficulty.")+'</div>';
return h;
}
function player(){let h=cardHeader("Golfer attributes","Training from the Yorkshire Open has been applied. Each rating is out of 100.");
const skills=[["Driving","driving"],["Iron Play","irons"],["Short Game","short"],["Putting","putting"],["Mental Game","mental"],["Fitness","fitness"]];
for(let q of skills){let n=career.attributes[q[1]];h+='<div class="c-attr"><div class="head"><span>'+q[0]+'</span><span>'+n+'</span></div><div class="c-bar"><i style="width:'+n+'%"></i></div></div>'}
h+=row("Available skill points",career.skillPoints)+row("XP",career.xp+" / 1,000")+'</div>';
if(career.skillPoints>0){h+=cardHeader("Spend skill points","Each point increases an attribute by two.");for(let q of skills){h+=btn("+2 "+q[0],"train:"+q[1],"secondary")}h+='</div>'}
else h+=cardHeader("Keep improving","Earn skill points through XP, tournament finishes and career levels. Your ratings are locked until you have points to spend.")+'</div>';
return h;
}
function equipment(){let a=career.sponsor.status,h=cardHeader("Equipment bag","Your equipment affects performance modestly. Player skill still matters most.");
h+=row("Irons",career.equipment.irons+"/100"+(a==="active"?" · Mizuno sponsored":" · Starter set"));
h+=row("Driving rating",career.attributes.driving+"/100");
h+=row("Short game rating",career.attributes.short+"/100")+'</div>';
h+=cardHeader("Mizuno sponsorship","Fictional rookie offer from a real golf manufacturer. Six-month agreement, "+money(750)+" signing payment, 68-rated irons and "+money(200)+" win bonus.");
if(a==="pending")h+=btn("Accept offer · +£750","acceptSponsor")+btn("Negotiate · Request £1,250","negotiateSponsor","secondary")+btn("Reject offer","rejectSponsor","secondary");
else h+=row("Contract status",a==="active"?"Signed · six months":"No longer available");
h+='</div>';return h;
}
function settings(){let h=cardHeader("Gameplay settings","These settings are saved in your browser.");
h+=row("Ball flight animations",career.settings.fast?"Quick":"Normal");
h+=btn(career.settings.fast?"Use normal animations":"Use faster ball animations","animation","secondary");
h+='<p>Short chips use one shot choice; putting uses safe or attacking pace. A fixed Play Shot button keeps the course in view on mobile.</p></div>';
h+=cardHeader("Save data","Your progress is stored on this device in Safari. It is not synced to other devices.");
h+=row("Saved career",career.level?"Level "+career.level+" · "+money(career.bank):"");
if(career.session)h+=btn("Abandon current round","abandon","secondary");
h+=btn("Reset entire career","resetCareer","danger")+'</div>';return h;
}
function scorecardHtml(scores,headline){let total=scoreTotal(scores);let h='<h2>'+headline+'</h2><div class="c-scoregrid">';
for(let i=0;i<18;i++){let v=scores[i];h+='<div class="c-hscore'+(getCurrent()&&getCurrent().current===i?" current":"")+'"><small>'+(i+1)+' · Par '+course[i].par+'</small><b class="'+(v?(v.type==="played"?"play":"sim"):"empty")+'">'+(v?v.score:"—")+'</b><small>'+(v?(v.type==="played"?"Played":"Sim"):"Pending")+'</small></div>'}
h+='</div>'+row("Holes completed",total.holes+"/18")+row("Total strokes",total.strokes)+row("To par",scoreText(total.relative));return h;
}
function renderCareer(){const root=byId("careerShell");let names=[["home","Career"],["schedule","Schedule"],["player","My Golfer"],["equipment","Equipment"],["settings","Settings"]];
let h='<header class="site-nav"><div class="site-title"><span>GOLF PRO</span>ROAD TO WORLD NO. 1</div><span class="c-pill">LEVEL '+career.level+'</span></header>';
h+='<div class="nav-tabs">'+names.map(q=>'<button data-tab="'+q[0]+'" class="'+(q[0]===tab?"active":"")+'">'+q[1]+'</button>').join("")+'</div>';
h+=tab==="home"?home():tab==="schedule"?season():tab==="player"?player():tab==="equipment"?equipment():settings();
root.innerHTML=h;
root.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{tab=b.dataset.tab;renderCareer()}));
root.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>act(b.dataset.action)));
}
function showHome(page="home"){tab=page;byId("careerShell").classList.remove("hidden");byId("gameApp").classList.add("hidden");byId("stickyShot").classList.remove("visible");renderCareer();window.scrollTo(0,0)}
function showRound(){if(!career.session)return showHome();byId("careerShell").classList.add("hidden");byId("gameApp").classList.remove("hidden");byId("stickyShot").classList.add("visible");const s=career.session;updateCourse(s.current);if(s.engineState&&s.scores[s.current]===null)engine.restore(s.engineState);else if(s.scores[s.current]===null&&engine.state().phase==="complete")engine.newHole();engine.resize();renderGameBar();window.scrollTo(0,0)}
function updateCourse(index){const h=course[index];window.golfConfig={...h};engine.configure(window.golfConfig);
byId("roundHoleInfo").textContent="Hole "+h.number+" / 18 · "+h.name+" · Par "+h.par+" · "+h.yards+" yd";
byId("actionTitle").textContent="Plan your next shot";
document.querySelector("#gameApp .course-head .overline").textContent="HOLE "+String(index+1).padStart(2,"0")+" / 18";
document.querySelector("#gameApp .course-head h3").textContent=h.name+" · Par "+h.par+" · "+h.yards+" yd";
document.querySelector("#gameApp .wind-icon").textContent=h.windX<0?"←":"→";
document.querySelector("#gameApp .wind strong").textContent=h.wind+" mph";
document.querySelector("#gameApp .wind small").textContent=h.windX<0?"RIGHT → LEFT":"LEFT → RIGHT";
}
function renderGameBar(){const s=getCurrent();if(!s)return;const total=scoreTotal(s.scores);byId("roundTitle").textContent=s.mode==="practice"?"18-Hole Practice":"Northern Masters · Round "+s.roundNumber;
byId("roundHoleInfo").textContent="Hole "+(s.current+1)+" / 18 · "+course[s.current].name+" · Par "+course[s.current].par+" · "+course[s.current].yards+" yd";
byId("roundScore").textContent=scoreText(total.relative);
const state=engine.state(),completed=!!s.scores[s.current];
byId("fixedHit").textContent=completed?(s.current===17?"Finish Round →":"Next Hole →"):state.phase==="green"?"PUTT →":state.phase==="complete"?"Next Hole →":state.strokes===0?"HIT TEE SHOT →":"PLAY SHOT →";
byId("fixedHit").disabled=engine.isAnimating()||animatingShot;
byId("fixedSkip").textContent="Skip ▾";
}
function newSession(mode,roundNumber){career.session={mode,roundNumber,current:0,scores:Array(18).fill(null),engineState:null,startedAt:new Date().toISOString()};save();engine.newHole();showRound()}
function simulateHole(h){const r=Math.random(),skill=(career.attributes.irons+career.attributes.putting+career.attributes.short)/3;let rel=r<.008&&h.par>=4?-2:r<.17+skill/3000?-1:r<.57?0:r<.83?1:r<.965?2:3;return Math.max(1,h.par+rel)}
function completeHole(){let s=getCurrent();if(!s||s.scores[s.current])return;let state=engine.state();if(state.phase!=="complete")return;s.scores[s.current]={score:state.strokes,type:"played",penalties:state.penalties};s.engineState=null;save();renderGameBar()}
function nextHole(){let s=getCurrent();if(!s)return;let next=s.scores.findIndex(x=>x===null);if(next===-1)return concludeRound();
s.current=next;s.engineState=null;save();engine.newHole();updateCourse(s.current);engine.resize();renderGameBar();window.scrollTo(0,0)}
function skip(n){let s=getCurrent();if(!s||engine.isAnimating())return;let current=s.scores[s.current]===null?s.current:s.current+1;
let count=0;for(let i=current;i<18&&count<n;i++){if(!s.scores[i]){s.scores[i]={score:simulateHole(course[i]),type:"simulated",penalties:0};count++}}
s.engineState=null;save();closeDialog();nextHole()}
function tournamentPrize(position){if(position===1)return 4000;if(position===2)return 2550;if(position===3)return 1800;if(position<=5)return 1250;if(position<=10)return 800;if(position<=15)return 525;if(position<=20)return 330;if(position<=30)return 180;if(position<=45)return 95;return 0}
function awardXP(n){career.xp+=n;while(career.xp>=1000){career.xp-=1000;career.level++;career.skillPoints+=2}}
function normalRandom(){return Math.sqrt(-2*Math.log(1-Math.random()))*Math.cos(2*Math.PI*Math.random())}
function concludeRound(){let s=getCurrent();if(!s)return;let total=scoreTotal(s.scores);if(total.holes!==18)return;
let played=s.scores.filter(q=>q.type==="played").length,simulated=18-played;
career.lastRound={mode:s.mode,roundNumber:s.roundNumber,score:total.strokes,relative:total.relative,played,simulated,scores:s.scores.slice()};
career.history.unshift({...career.lastRound,day:new Date().toISOString().slice(0,10)});
career.session=null;
let text="18-hole "+(s.mode==="practice"?"practice":"tournament")+" round complete. Score "+total.strokes+" ("+scoreText(total.relative)+"). "+played+" holes played and "+simulated+" simulated.";
if(s.mode==="tournament"){career.tournament.rounds.push(s.scores.slice());let done=career.tournament.rounds.length;
if(done===2){let aggregate=career.tournament.rounds.reduce((a,round)=>a+scoreTotal(round).relative,0);if(aggregate>6){career.tournament.status="cut";awardXP(120);text+=" You missed the +6 cut, earning 120 XP. No prize money."}else{text+=" You've made the cut! Round 3 is available."}}
if(done===4){let sum=career.tournament.rounds.reduce((a,round)=>a+scoreTotal(round).relative,0);
let field=Array.from({length:63},()=>Math.round(normalRandom()*9-1));let position=1+field.filter(v=>v<sum).length;
const prize=tournamentPrize(position);career.tournament.position=position;career.tournament.prize=prize;career.tournament.status="completed";
career.bank+=prize;career.earnings+=prize;
let experience=180+Math.max(0,50-position)*6;awardXP(experience);
if(position===1&&career.sponsor.status==="active"){career.bank+=200;text+=" Mizuno win bonus: £200."}
text+=" Final tournament position P"+position+"; prize "+money(prize)+"; XP +"+experience+".";
}else if(done<4&&career.tournament.status!=="cut"){career.tournament.status="playing"}}
save();showHome("home");openDialog('<h2>Round Complete</h2><p>'+text+'</p>'+btn("View Scorecard","lastscore","secondary")+btn("Return to Career","closeDialog")+'</div>')}
function openDialog(html){const w=byId("dialogRoot");w.classList.remove("hidden");w.innerHTML='<div class="c-dialog" role="dialog" aria-modal="true">'+html+'</div>';w.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>act(b.dataset.action)))}
function closeDialog(){byId("dialogRoot").classList.add("hidden");byId("dialogRoot").innerHTML=""}
function skipDialog(){let s=getCurrent();if(!s)return;const left=s.scores.filter(q=>!q).length;let html='<h2>Skip or simulate holes</h2><p>Skipped holes receive realistically simulated scores. Already played holes are never overwritten.</p>';
for(const n of [1,3,6,9,18]){if(n<=left||n===18)html+=btn(n>=left?"Simulate all remaining ("+left+")":"Simulate next "+n+" hole"+(n===1?"":"s"),"skip:"+Math.min(n,left),"secondary")}
html+=btn("View 18-hole scorecard","scorecard","secondary")+btn("Cancel","closeDialog","secondary");
openDialog(html)}
function act(a){
if(a==="practice"){if(!career.session)newSession("practice",1);else showRound();return}
if(a==="tournament"){if(career.session)return showRound();let t=career.tournament;if(t.status==="completed"||t.status==="cut")return;
if(!t.entryPaid){if(career.bank<175){openDialog("<h2>Insufficient Funds</h2><p>You need £175 to enter the Northern Masters.</p>"+btn("Close","closeDialog")+"</div>");return}career.bank-=175;t.entryPaid=true;t.status="playing";save()}
newSession("tournament",t.rounds.length+1);return}
if(a==="resume"){showRound();return}
if(a==="back"){showHome();return}
if(a==="scorecard"){let s=getCurrent();if(!s)return;openDialog(scorecardHtml(s.scores,"18-Hole Scorecard")+btn("Close","closeDialog"));return}
if(a==="lastscore"){if(!career.lastRound)return;openDialog(scorecardHtml(career.lastRound.scores,"Previous Round")+btn("Close","closeDialog"));return}
if(a==="closeDialog"){closeDialog();return}
if(a==="skipMenu"){skipDialog();return}
if(a.startsWith("skip:")){skip(Number(a.split(":")[1]));return}
if(a==="acceptSponsor"){career.sponsor.status="active";career.bank+=750;career.equipment.irons=68;save();renderCareer();return}
if(a==="rejectSponsor"){career.sponsor.status="rejected";save();renderCareer();return}
if(a==="negotiateSponsor"){if(Math.random()<.6){career.sponsor.status="active";career.bank+=1000;career.equipment.irons=68;save();renderCareer();openDialog('<h2>Negotiation successful</h2><p>Mizuno agrees to £1,000 guaranteed rather than £750. You receive the sponsored irons and the £200 win bonus remains.</p>'+btn("Continue","closeDialog"))}else{career.sponsor.status="withdrawn";save();renderCareer();openDialog('<h2>Offer withdrawn</h2><p>Mizuno has decided not to improve the contract and withdraws the offer.</p>'+btn("Continue","closeDialog"))}return}
if(a.startsWith("train:")){let key=a.split(":")[1];if(career.skillPoints>0){career.attributes[key]=Math.min(100,career.attributes[key]+2);career.skillPoints--;save();renderCareer()}return}
if(a==="animation"){career.settings.fast=!career.settings.fast;window.golfFastAnimations=career.settings.fast;save();renderCareer();return}
if(a==="abandon"){if(!confirm("Abandon this round? Played and simulated holes in the current round will be lost. Tournament entry fees are not refunded."))return;career.session=null;save();closeDialog();showHome("home");return}
if(a==="resetCareer"){if(!confirm("Reset your whole golf career? This cannot be undone."))return;let typed=prompt('Type RESET to confirm deleting this local save.');if(typed!=="RESET")return;career=blank();save();engine.newHole();showHome("home");return}
}
document.body.insertAdjacentHTML("afterbegin",'<section id="careerShell" aria-label="Golf career home"></section>');
byId("gameApp").insertAdjacentHTML("afterbegin",'<div id="roundTopBar"><button id="backToCareer">‹ Career</button><div style="flex:1;min-width:0"><strong id="roundTitle">18-Hole Practice</strong><small id="roundHoleInfo">Hole 1 / 18</small></div><strong id="roundScore">E</strong><button id="showScorecard">Scorecard</button></div>');
document.body.insertAdjacentHTML("beforeend",'<div id="stickyShot"><div class="inner"><button id="fixedSkip">Skip ▾</button><button id="fixedHit">HIT SHOT →</button></div></div><div id="dialogRoot" class="c-overlay hidden"></div>');
byId("backToCareer").addEventListener("click",()=>showHome("home"));
byId("showScorecard").addEventListener("click",()=>act("scorecard"));
byId("fixedSkip").addEventListener("click",skipDialog);
byId("fixedHit").addEventListener("click",()=>{
 const session=getCurrent();
 if(!session||engine.isAnimating()||animatingShot)return;
 if(session.scores[session.current]){nextHole();return}
 animatingShot=true;
 renderGameBar();
 const top=Math.max(0,byId("roundTopBar").getBoundingClientRect().top+window.scrollY-5);
 window.scrollTo({top,behavior:"instant"});
 requestAnimationFrame(()=>{
   if(getCurrent()){
     engine.hit();
     setTimeout(()=>{animatingShot=false;renderGameBar()},window.golfFastAnimations?850:2300);
   }else{animatingShot=false}
 });
});
byId("dialogRoot").addEventListener("click",e=>{if(e.target.id==="dialogRoot")closeDialog()});
window.addEventListener("golfpro:render",e=>{let s=getCurrent();if(!s)return;const g=e.detail.state;if(!s.scores[s.current])s.engineState=g;save();if(!byId("gameApp").classList.contains("hidden"))renderGameBar()});
window.addEventListener("golfpro:holecomplete",()=>{animatingShot=false;completeHole()});
showHome("home");
})();