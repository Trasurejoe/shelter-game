// AUDIO v0.5.2: five volume buses, audible effects, wind ambience, soft generative music, working Sound button.
// Audio is presentation only, so it may use Math.random (gameplay randomness stays in SHELTER.RNG).
SHELTER.Audio=(()=>{
const vol={master:.8,music:.55,effects:.85,environment:.55,voice:1};
let ctx=null,mute=false,wind=null,musicTimer=null;const B={};
try{Object.assign(vol,JSON.parse(localStorage.getItem("shelter.audio")||"{}"))}catch(e){}
function apply(){if(!ctx)return;const t=ctx.currentTime;
 B.master.gain.setTargetAtTime(mute?0:vol.master,t,.02);B.music.gain.setTargetAtTime(vol.music*.6,t,.05);
 B.effects.gain.setTargetAtTime(vol.effects,t,.02);B.environment.gain.setTargetAtTime(vol.environment,t,.05);B.voice.gain.setTargetAtTime(vol.voice,t,.02)}
function ac(){if(!ctx){try{ctx=new(window.AudioContext||window.webkitAudioContext)();B.master=ctx.createGain();B.master.connect(ctx.destination);
  ["music","effects","environment","voice"].forEach(n=>{B[n]=ctx.createGain();B[n].connect(B.master)});apply()}catch(e){ctx=null;return null}}
 if(ctx.state==="suspended")ctx.resume();return ctx}
function setVol(k,v){if(k in vol)vol[k]=Math.max(0,Math.min(1,Number(v)||0));try{localStorage.setItem("shelter.audio",JSON.stringify(vol))}catch(e){}apply()}
function label(){const b=document.querySelector("#sound"),t=mute?"Sound off":"Sound on";if(b&&b.textContent!==t)b.textContent=t}
function toggle(){mute=!mute;apply();label();if(!mute)start();return mute}
function note(f,at,dur,type,peak,dest){const t=ctx.currentTime+at,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.03)}
function sfx(k){const c=ac();if(!c||mute)return;const E=B.effects,seq=(a,step,dur,type,pk)=>a.forEach((f,i)=>note(f,i*step,dur,type,pk,E));
 ({tap:()=>note(330,0,.1,"triangle",.3,E),coin:()=>seq([988,1319],.09,.3,"triangle",.35),find:()=>seq([440,554],.08,.22,"triangle",.35),
  fix:()=>seq([392,494,587],.09,.34,"triangle",.35),bad:()=>{note(150,0,.45,"sawtooth",.25,E);note(110,.12,.5,"sawtooth",.22,E)},
  win:()=>seq([523,659,784,1047],.14,.5,"triangle",.35),lose:()=>seq([392,330,262],.22,.6,"sine",.4)}[k]||(()=>note(300,0,.1,"triangle",.3,E)))()}
function windOn(){const c=ac();if(!c||wind)return;const n=c.sampleRate*3,buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);let l=0;
 for(let i=0;i<n;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}
 const s=c.createBufferSource();s.buffer=buf;s.loop=true;const f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=420;
 const g=c.createGain();g.gain.value=.8;const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.13;lg.gain.value=.35;lfo.connect(lg);lg.connect(g.gain);
 s.connect(f);f.connect(g);g.connect(B.environment);s.start();lfo.start();wind=g}
const SCALE=[220,261.63,293.66,329.63,392,440,523.25];
function musicOn(){if(musicTimer!==null)return;const tick=()=>{if(ctx&&ctx.state==="running"&&!mute){const f=SCALE[Math.floor(Math.random()*SCALE.length)];
  note(f,0,1.8,"sine",.3,B.music);note(f*2,0,.7,"triangle",.1,B.music);if(Math.random()<.3)note(SCALE[Math.floor(Math.random()*4)]*.5,.35,2.2,"sine",.22,B.music)}
  musicTimer=setTimeout(tick,1300+Math.random()*1900)};musicTimer=setTimeout(tick,500)}
function musicOff(){clearTimeout(musicTimer);musicTimer=null}
function start(){if(ac()){windOn();musicOn()}}
function playVoice(){return false}
// Browsers only allow sound after a tap or key press, so start everything on the first one.
const first=()=>{["pointerdown","keydown","touchend"].forEach(e=>removeEventListener(e,first,true));start()};
["pointerdown","keydown","touchend"].forEach(e=>addEventListener(e,first,true));
document.addEventListener("click",e=>{const b=e.target&&e.target.closest&&e.target.closest("#sound");if(b)snd()});
try{new MutationObserver(label).observe(document.body,{childList:true,subtree:true})}catch(e){}
document.addEventListener("visibilitychange",()=>{if(!ctx)return;if(document.hidden){musicOff();ctx.suspend()}else{ctx.resume();musicOn()}});
if(SHELTER.bus){SHELTER.bus.on("level:complete",()=>setTimeout(()=>sfx("win"),380));SHELTER.bus.on("game:win",()=>sfx("win"));SHELTER.bus.on("game:lose",()=>sfx("lose"))}
return{vol,setVol,toggle,sfx,windOn,musicOn,musicOff,playVoice,manifest:new Set(),state:()=>ctx?ctx.state:"none"}})();
const sfx=k=>SHELTER.Audio.sfx(k),windOn=()=>SHELTER.Audio.windOn();
function snd(){SHELTER.Audio.toggle()}
