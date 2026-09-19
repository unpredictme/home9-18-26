const predictions=[
["The Quiet Decider","Your address has the energy of someone who thinks before they commit — then moves faster than anyone expects once the decision is made."],
["The Open Door","There is something unusually inviting about the way your address comes together. Your next useful opportunity may arrive through a person or idea you almost overlook."],
["The Pattern Breaker","Your email has a little unpredictability baked into it. You may be more willing to change the plan than people around you expect."],
["The Long Game","There is a deliberate feel to your address. You seem like someone who can ignore the immediate noise when something matters enough."],
["The Connector","Your email has a social, conversational rhythm. A useful introduction, message, or unexpected conversation may be closer than you think."],
["The Wildcard","Your address gives us just enough signal to make a dangerous little guess: you do not always follow your own pattern when something really matters."]
];
function hash(value){
 let h=2166136261;
 for(let i=0;i<value.length;i++){
  h^=value.charCodeAt(i);
  h=Math.imul(h,16777619);
 }
 return h>>>0;
}
function emailSignals(email){
 const local=email.split("@")[0]||"";
 const domain=(email.split("@")[1]||"").toLowerCase();
 const compact=local.replace(/[^a-z0-9]/gi,"");
 const letters=(local.match(/[a-z]/gi)||[]).length;
 const digits=(local.match(/\d/g)||[]).length;
 const separators=(local.match(/[._+-]/g)||[]).length;
 const vowelCount=(local.match(/[aeiou]/gi)||[]).length;
 const vowelRatio=letters?vowelCount/letters:0;
 const lower=local.toLowerCase();
 let maxConsonantRun=0,run=0;
 for(const ch of lower){
   if(/[a-z]/.test(ch)&&!/[aeiou]/.test(ch)){run++;if(run>maxConsonantRun)maxConsonantRun=run}else run=0;
 }
 const uniqueLetters=new Set((lower.match(/[a-z]/g)||[])).size;
 const letterDiversity=letters?uniqueLetters/letters:0;
 const obviousTest=/^(test|testing|fake|asdf|qwerty|abc|abcd|example|random|noreply|nope|hello|temp|temporary|throwaway|junk|spam|foobar|lorem)/i.test(local);
 const hasNameLike=separators>0
   ? /^[a-z]{2,}[._-][a-z]{2,}$/i.test(local)
   : letters>=3&&vowelRatio>=0.22&&maxConsonantRun<=4;
 const long=local.length>=11;
 const syntheticScore=(letters>=10&&vowelRatio<0.22?2:0)+(maxConsonantRun>=5?2:0)+(letters>=12&&letterDiversity>0.72?1:0)+(separators===0&&digits===0&&letters>=14?1:0);
 const testLike=obviousTest||syntheticScore>=3;
 const score=(compact.length*3+letters*2+digits*7+separators*11+(hasNameLike?13:0)+(domain.length%9));
 return {local,domain,length:local.length,digits,separators,hasNameLike,long,vowelRatio,maxConsonantRun,letterDiversity,score,testLike};
}
function makePrediction(email,answers,date=new Date().toISOString().slice(0,10)){
 const s=emailSignals(email);
 const seed=[email.toLowerCase().trim(),date,...answers].join("|");
 const p=predictions[hash(seed)%predictions.length];
 if(s.testLike){
   return {
     title:"The Tester",
     text:"Okay, you’re testing us. That email looks intentionally random, so The UnPredictMe Engine is not going to invent a personality story just to sound clever.",
     signal:"Random-looking handle detected. We’d rather call it than fake a prediction."
   };
 }
 const traits=[];
 if(s.hasNameLike)traits.push("name-like");
 if(s.separators)traits.push("has a little punctuation");
 if(s.digits)traits.push("contains numbers");
 if(s.long)traits.push("a longer handle");
 if(!traits.length)traits.push("a clean, simple handle");
 const signal=traits[hash(email+date)%traits.length];
 const prefix=s.domain&&s.domain!=="gmail.com"&&s.domain!=="yahoo.com"&&s.domain!=="outlook.com"?"There’s also a little signal in your domain. ":"";
 return {title:p[0],text:p[1],signal:prefix+"We noticed "+signal+". This is a playful guess from the shape of your email — not a claim that we can actually know you from it."};
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function sendBrevo(env,email,p,firstName=""){
 if(!env.BREVO_API_KEY||!env.BREVO_SENDER_EMAIL)return {ok:false,error:"Brevo is not configured on this Worker."};
 const senderName=env.BREVO_SENDER_NAME||"UnPredictMe";
 const htmlEmail='<!doctype html><html><body style="margin:0;background:#effdfa;font-family:Arial,sans-serif;color:#123;"><div style="max-width:620px;margin:0 auto;padding:40px 20px;"><div style="background:#fff;border-radius:28px;padding:36px;"><div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#168d82;">UnPredictMe</div><p style="font-size:18px;color:#42635f;">Hi `+escapeHtml(firstName)+`,</p><h1>'+escapeHtml(p.title)+'</h1><p style="font-size:19px;line-height:1.65;color:#42635f;">'+escapeHtml(p.text)+'</p><p style="color:#168d82;font-weight:700;">Come back tomorrow. I’ll make another prediction.</p></div></div></body></html>';
 const r=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"accept":"application/json","content-type":"application/json","api-key":env.BREVO_API_KEY},body:JSON.stringify({sender:{email:env.BREVO_SENDER_EMAIL,name:senderName},to:[{email,name:firstName}],replyTo:{email:env.BREVO_SENDER_EMAIL,name:senderName},subject:"Your UnPredictMe prediction ✨",htmlContent:htmlEmail,textContent:"Hi "+firstName+",\n\n"+p.title+"\n\n"+p.text+"\n\nCome back tomorrow. I’ll make another prediction."})});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)return {ok:false,status:r.status,error:String(data.message||data.code||"Brevo rejected the email.")};
 return {ok:true,messageId:data.messageId||null};
}
const questions=[
["It’s Saturday morning. Your ideal start is…",[["slow","A slow start. Coffee, no rush."],["out","Already out doing something."],["productive","Knock something off the list."],["random","See what happens."]]],
["In a group, you usually…",[["observe","Watch the room first."],["connect","Find one person to talk to."],["lead","Get everyone moving."],["surprise","Do something nobody expected."]]],
["A tempting opportunity appears with almost no warning. You…",[["yes","Say yes, then figure it out."],["think","Ask for a little time."],["research","Need the details first."],["instinct","Trust your gut."]]],
["Your plans suddenly change. Your first reaction is…",[["adapt","Fine. What’s the new plan?"],["annoyed","Wait, we had a plan."],["relieved","Honestly? Kind of a relief."],["excited","Interesting. Let’s see."]]],
["What do you want us to predict?",[["love","Love & relationships"],["career","Career & ambition"],["money","Money & opportunity"],["next","What happens next"]]]
];
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UnPredictMe — Unpredictable Predictions About You</title><link rel="canonical" href="https://unpredictme.com/"><meta name="description" content="UnPredictMe makes playful, unpredictable predictions about you from tiny patterns in your email. Get a guess, see if it fits, and come back tomorrow."><meta property="og:type" content="website"><meta property="og:site_name" content="UnPredictMe"><meta property="og:title" content="UnPredictMe — Unpredictable Predictions About You"><meta property="og:description" content="A playful, unpredictable prediction about you from one tiny clue: your email."><meta property="og:url" content="https://unpredictme.com/"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="UnPredictMe — Unpredictable Predictions About You"><meta name="twitter:description" content="A playful, unpredictable prediction about you from one tiny clue: your email."><script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"UnPredictMe","url":"https://unpredictme.com/","description":"A playful prediction service that makes unpredictable guesses about you from tiny patterns in your email address.","publisher":{"@type":"Organization","name":"UnPredictMe","url":"https://unpredictme.com/"}}</script><script async src="https://www.googletagmanager.com/gtag/js?id=G-PHWL785Q3F"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","G-PHWL785Q3F");</script><meta name="robots" content="index,follow,max-image-preview:large"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><style>
:root{--ink:#08070b;--lav:#d9c8ff;--lav2:#eee7ff;--muted:#655f70;--line:#d7cdf0;--paper:#f7f4ff}*{box-sizing:border-box}html{background:var(--paper);scroll-behavior:smooth}body{margin:0;min-height:100vh;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--paper);overflow-x:hidden}body:before{content:"";position:fixed;inset:-20%;background:radial-gradient(circle at 18% 18%,rgba(217,200,255,.8),transparent 30%),radial-gradient(circle at 82% 72%,rgba(238,231,255,.9),transparent 32%);z-index:-2;pointer-events:none}.brand{position:fixed;top:20px;left:22px;z-index:30;display:flex;align-items:center;gap:9px;color:var(--ink);text-decoration:none;font-weight:950;letter-spacing:-.04em;font-size:15px}.brand-mark{display:grid;place-items:center;width:35px;height:35px;border-radius:50%;background:var(--ink);color:var(--lav);font-size:19px;box-shadow:0 0 0 7px rgba(255,255,255,.45);transition:.25s transform}.brand:hover .brand-mark{transform:rotate(12deg) scale(1.08)}main{min-height:auto;display:block;padding:0}.scene{min-height:100vh;display:grid;place-items:center;padding:110px 22px 90px;position:relative}.scene-inner{width:min(900px,100%);text-align:center}.chapter{font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:#756c84}.scene h1{font-size:clamp(70px,15vw,170px);line-height:.78;letter-spacing:-.085em;margin:18px 0 28px}.scene h2{font-size:clamp(38px,7vw,76px);line-height:.9;letter-spacing:-.065em;margin:12px 0 18px}.lede{font-size:clamp(20px,3vw,28px);line-height:1.35;color:var(--muted);max-width:650px;margin:0 auto}.scroll-cue{margin:70px auto 0;font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#756c84}.scroll-cue span{display:block;width:1px;height:65px;background:var(--ink);margin:14px auto 0;animation:drop 1.5s ease-in-out infinite}@keyframes drop{50%{transform:scaleY(.45);transform-origin:top;opacity:.4}}.scene.dark{background:var(--ink);color:#fff}.scene.dark .chapter,.scene.dark .lede,.scene.dark .scroll-cue{color:#cfc7dc}.scene.dark .scroll-cue span{background:var(--lav)}.machine-stage{min-height:115vh;padding:90px 22px;display:flex;align-items:center;justify-content:center;background:var(--lav);position:relative;overflow:hidden}.machine-stage:before,.machine-stage:after{content:"?";position:absolute;font-size:55vw;line-height:.7;font-weight:950;letter-spacing:-.1em;color:rgba(255,255,255,.24);pointer-events:none}.machine-stage:before{left:-18vw;top:15vh;transform:rotate(-12deg)}.machine-stage:after{right:-18vw;bottom:-5vh;transform:rotate(13deg)}.machine-wrap{width:min(720px,100%);position:relative;z-index:1}.machine-card{background:rgba(255,255,255,.9);border:1px solid rgba(8,7,11,.12);border-radius:34px;padding:clamp(25px,5vw,54px);box-shadow:0 35px 90px rgba(8,7,11,.13);backdrop-filter:blur(16px)}.eyebrow,.qnum{font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#756c84}.qnum{text-align:center}.question{font-size:clamp(32px,6vw,52px);line-height:1;letter-spacing:-.055em;margin:12px 0 14px;text-align:center}.intro{color:var(--muted);line-height:1.6;margin:0 auto 20px;max-width:560px;font-size:16px;text-align:center}.email{display:flex;gap:10px;margin-top:24px}.email input{min-width:0;flex:1;border:1px solid var(--line);border-radius:16px;padding:17px;font-size:16px;background:#fff;color:var(--ink);outline:none}.email input:focus{border-color:var(--ink);box-shadow:0 0 0 4px rgba(217,200,255,.8)}button{font-family:inherit}.primary,.secondary{border:1px solid transparent;border-radius:16px;padding:17px;font-size:16px;font-weight:900;cursor:pointer;transition:.2s transform,.2s background,.2s box-shadow}.primary{background:var(--ink);color:#fff}.secondary{background:var(--lav2);color:var(--ink);border-color:var(--line)}.primary:hover,.secondary:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(8,7,11,.13)}.primary:disabled{opacity:.6;cursor:wait;transform:none}.consent{display:flex;gap:9px;align-items:flex-start;text-align:left;font-size:12px;color:#77707f;margin:12px 2px 0}.consent input{margin-top:2px}.helper{font-size:13px;color:#77707f;text-align:center;margin:18px 0 0}.micro-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:16px 0 0}.micro{border:1px solid var(--line);background:#fff;color:#5d5668;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:800;cursor:pointer}.prediction{background:var(--lav2);border:1px solid var(--line);border-radius:25px;padding:26px;margin:24px 0}.prediction h3{font-size:28px;margin:0 0 10px;letter-spacing:-.04em}.prediction p{font-size:19px;line-height:1.6;color:#3e3947;margin:0}.prediction-mark{font-size:28px;color:#8062d8;margin-bottom:8px}.signal-bar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:18px 0}.signal-chip{padding:8px 11px;border-radius:999px;background:#fff;border:1px solid var(--line);color:#655f70;font-size:12px;font-weight:800}.pulse{display:flex;justify-content:center;gap:7px;margin:28px}.pulse i{display:block;width:9px;height:9px;border-radius:50%;background:var(--ink);animation:pulse 1s infinite}.pulse i:nth-child(2){animation-delay:.15s}.pulse i:nth-child(3){animation-delay:.3s}@keyframes pulse{50%{transform:translateY(-8px);opacity:.35}}.machine{height:100px;display:flex;align-items:center;justify-content:center;gap:15px;margin:12px 0;position:relative}.machine:before{content:"";position:absolute;width:135px;height:135px;border:1px solid rgba(8,7,11,.25);border-radius:50%;animation:spin 9s linear infinite}.machine:after{content:"";position:absolute;width:185px;height:185px;border:1px dashed rgba(8,7,11,.18);border-radius:50%;animation:spin 14s linear infinite reverse}@keyframes spin{to{transform:rotate(360deg)}}.machine span{position:relative;z-index:1;display:grid;place-items:center;width:56px;height:56px;border-radius:19px;background:#fff;border:1px solid var(--line);font-size:27px;box-shadow:0 10px 30px rgba(8,7,11,.08);animation:bob 3s ease-in-out infinite}.machine span:nth-child(2){width:70px;height:70px;border-radius:23px;background:var(--ink);color:var(--lav);font-size:36px;animation-delay:-1.1s}.machine span:nth-child(3){animation-delay:-2s}@keyframes bob{50%{transform:translateY(-7px) rotate(3deg)}}.address-preview{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;color:#6f55bb;word-break:break-all;text-align:center;margin:12px auto 0;max-width:560px}.reading{text-align:center}.reading-line{min-height:28px;color:#655f70;font-size:15px}.reveal{animation:reveal .55s ease both}@keyframes reveal{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}.buttons{display:grid;gap:10px}.feedback{text-align:center;color:#5d43a1;font-weight:800;margin:16px 0 0}.name-step{margin-top:28px;padding-top:24px;border-top:1px solid var(--line)}.page{width:min(760px,100%);margin:0 auto;text-align:left}.page h2{font-size:clamp(38px,7vw,66px);letter-spacing:-.06em;text-align:center;margin:8px 0 20px}.page h3{font-size:20px;margin:28px 0 8px}.page p,.page li{color:#4f4a58;line-height:1.7;font-size:16px}.page ul{padding-left:22px}.price{font-size:48px;font-weight:950;letter-spacing:-.06em;text-align:center;margin:15px 0}.seo-copy{padding:70px 22px;background:#fff}.seo-copy>div{width:min(760px,100%);margin:0 auto}.seo-copy h2{font-size:clamp(32px,6vw,50px);letter-spacing:-.05em;margin:0 0 12px}.seo-copy h3{font-size:20px;margin:24px 0 7px}.seo-copy p{color:#5d5766;line-height:1.7;font-size:16px;margin:10px 0}.story-footer{padding:110px 22px 80px;text-align:center;background:var(--ink);color:#fff}.story-footer h2{font-size:clamp(45px,9vw,90px);letter-spacing:-.07em;line-height:.88;margin:0 0 18px}.story-footer p{color:#cfc7dc;max-width:560px;margin:0 auto 28px;line-height:1.6}footer{padding:34px 18px 42px;text-align:center;background:#fff;color:#77707f;font-size:12px}footer .links{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-bottom:10px}footer a{color:#4f4a58;text-decoration:none;font-size:13px;font-weight:800}footer a:hover{text-decoration:underline}@media(max-width:560px){.brand{top:14px;left:14px;font-size:14px}.brand-mark{width:32px;height:32px}.scene{padding:105px 14px 70px}.scene h1{font-size:clamp(66px,20vw,100px)}.machine-stage{padding:70px 14px}.machine-card{border-radius:26px}.email{display:grid}.email button{padding:16px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.machine:before,.machine:after,.machine span,.pulse i,.scroll-cue span{animation:none}}
</style></head><body><a class="brand" href="/" aria-label="UnPredictMe home"><span class="brand-mark">?</span><span>UnPredictMe</span></a><main><div class="story"><section class="scene dark"><div class="scene-inner"><div class="chapter">CHAPTER 01 · THE CLUE</div><h1>UnPredictMe</h1><p class="lede"><strong>Give us one tiny clue. We’ll make a very big guess.</strong></p><div class="scroll-cue">Scroll to see what happens<span></span></div></div></section><section class="scene"><div class="scene-inner"><div class="chapter">SCENE 01 · YOU</div><h2>We don't know you.<br>That's the point.</h2><p class="lede">Your email has a shape. A rhythm. A few little quirks. We turn those into an intentionally unpredictable guess.</p><div class="scroll-cue">Keep going<span></span></div></div></section><section class="machine-stage" id="predict"><div class="machine-wrap"><div class="machine-card" id="app"></div></div></section><section class="scene dark"><div class="scene-inner"><div class="chapter">SCENE 02 · THE READING</div><h2>Maybe we got you.<br>Maybe we absolutely didn't.</h2><p class="lede">That's the fun. Tell us what you think. Then give us your first name and we'll send the prediction to your inbox.</p><div class="scroll-cue">One more thing<span></span></div></div></section></div></main><section class="seo-copy" aria-label="About UnPredictMe"><div><h2>What is UnPredictMe?</h2><p><strong>UnPredictMe</strong> is a playful prediction experience built around the idea of making an <strong>unpredictable guess about you</strong> from one tiny clue: your email address.</p><p>It is not a personality test, a birth chart, or a claim that an email address can reveal who you really are. UnPredictMe looks at simple visible patterns such as the shape, length, punctuation, and numbers in an email address, then turns those signals into a surprising prediction.</p><h3>Why is it unpredictable?</h3><p>The prediction is intentionally playful. You do not know which reading the machine will make before you try it, and you can tell UnPredictMe whether the guess feels like you. Come back another day for another unpredictable prediction.</p></div></section><section class="story-footer"><h2>Come back tomorrow.</h2><p>I’ll make another prediction. Predicting you is getting to know you — one weird little clue at a time.</p><a class="primary" href="#predict" style="display:inline-block;text-decoration:none">UnPredict Me? →</a></section><footer><div class="links"><a href="/">Predict</a><a href="/about">About</a><a href="/pricing">Pricing</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div><div>© 2026 UnPredictMe</div></footer><script>
(function(){
  var predictions=[
    ["The Quiet Decider","Your address has the energy of someone who thinks before they commit — then moves faster than anyone expects once the decision is made."],
    ["The Open Door","There is something unusually inviting about the way your address comes together. Your next useful opportunity may arrive through a person or idea you almost overlook."],
    ["The Pattern Breaker","Your email has a little unpredictability baked into it. You may be more willing to change the plan than people around you expect."],
    ["The Long Game","There is a deliberate feel to your address. You seem like someone who can ignore the immediate noise when something matters enough."],
    ["The Connector","Your email has a social, conversational rhythm. A useful introduction, message, or unexpected conversation may be closer than you think."],
    ["The Wildcard","Your address gives us just enough signal to make a dangerous little guess: you do not always follow your own pattern when something really matters."]
  ];
  var app=document.getElementById("app"),email="",marketing=false,prediction=null;\n  function track(name,params){try{if(typeof gtag==="function")gtag("event",name,params||{})}catch(_){}}
  function esc(s){return String(s).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]})}
  function machine(){return '<div class="machine" aria-hidden="true"><span>✦</span><span>?</span><span>✦</span></div>'}
  function start(){
    app.innerHTML='<div class="eyebrow">A tiny machine for making very big guesses <span class="spark">✦</span></div><h1>UnPredictMe</h1><p class="lede"><strong>Give us your email. We’ll make an unpredictable prediction about you.</strong></p><section class="card">'+machine()+'<div class="qnum">THE PREDICTION MACHINE</div><div class="question">We only need one tiny clue.</div><p class="intro">Your email gives us a few visible patterns — the shape, rhythm, and little quirks. We turn those into a playful guess about you.</p><form id="form"><div class="email"><input id="email" type="email" placeholder="you@example.com" autocomplete="email" required autofocus><button class="primary" type="submit">Read me →</button></div><label class="consent"><input id="marketing" type="checkbox"><span>Yes, send me occasional UnPredictMe predictions and product updates. (Optional.)</span></label></form><div class="micro-actions"><button class="micro" type="button" id="sample">What can you see?</button><button class="micro" type="button" id="surprise">Surprise me ✦</button></div><div class="helper" id="hint">No quiz. No birth chart. Just one email and a little imagination.</div></section>';
    document.getElementById("form").onsubmit=function(ev){ev.preventDefault();var input=document.getElementById("email");if(!input.checkValidity()){input.reportValidity();return}email=input.value.trim();marketing=document.getElementById("marketing").checked;track("email_submitted");submitPrediction()};
    document.getElementById("sample").onclick=function(){document.getElementById("hint").innerHTML="We can notice things like <strong>punctuation</strong>, <strong>numbers</strong>, handle length, and the shape of your address. We don't pretend those things reveal your real personality."};
    document.getElementById("surprise").onclick=function(){var input=document.getElementById("email");input.focus();document.getElementById("hint").textContent="Give us less. Let the machine make the leap."};
  }
  function submitPrediction(){
    app.innerHTML='<div class="eyebrow">UNPREDICTING YOU</div><h1>Let’s see…</h1><section class="card reading">'+machine()+'<div class="qnum">READING YOUR EMAIL</div><div class="question">Finding the tiny clues.</div><div class="address-preview">'+esc(email)+'</div><div class="signal-bar"><span class="signal-chip">shape</span><span class="signal-chip">rhythm</span><span class="signal-chip">patterns</span></div><div class="pulse"><i></i><i></i><i></i></div><p class="reading-line" id="readingLine" aria-live="polite">Looking at the shape of it…</p></section>';
    var lines=["Looking at the shape of it…","Finding a pattern worth following…","Making one slightly reckless guess…"];
    var i=0;
    var timer=setInterval(function(){i++;var el=document.getElementById("readingLine");if(el&&i<lines.length)el.textContent=lines[i];},650);
    fetch("/api/signup",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:email,answers:[],marketing:marketing})}).then(function(r){return r.text().then(function(t){var d;try{d=JSON.parse(t)}catch(_){throw new Error("The prediction service returned an invalid response.")}d._httpStatus=r.status;return d})}).then(function(d){clearInterval(timer);if(d.prediction){prediction=d.prediction;track("prediction_generated");if(d.prediction.testLike)track("prediction_test_detected");result();return}throw new Error(d.error||"Something went wrong.")}).catch(function(err){clearInterval(timer);app.innerHTML='<div class="eyebrow">TINY GLITCH</div><h1>We hit a snag.</h1><section class="card"><div class="question">The machine could not make the prediction.</div><p class="helper">'+esc(err.detail||err.message)+'</p><div style="text-align:center;margin-top:20px"><button class="primary" id="retry">Try again</button></div></section>';document.getElementById("retry").onclick=start});
  }
  function result(){
    var signal=prediction.signal||"We noticed a few tiny patterns in the address.";
    app.innerHTML='<div class="eyebrow">THE MACHINE HAS SPOKEN</div><h1 class="reveal">Okay. We have a guess.</h1><section class="card reveal"><div class="prediction"><div class="prediction-mark">✦</div><h3>'+esc(prediction.title)+'</h3><p>'+esc(prediction.text)+'</p></div><div class="signal-bar"><span class="signal-chip">'+esc(signal)+'</span></div><p class="helper">This is a playful read of the email address — not a real personality test. The fun is seeing whether the guess feels oddly close.</p><div class="buttons"><button class="primary" id="yes">That’s me. 👀</button><button class="secondary" id="no">Not even close.</button></div><div id="feedbackArea"></div><div class="name-step" style="margin-top:28px;padding-top:24px;border-top:1px solid #d8f1ec"><div class="qnum">ONE LAST CLUE</div><div class="question" style="font-size:30px">What’s your first name?</div><p class="intro" style="margin-bottom:12px">We’ll use it to make your prediction feel a little more personal.</p><form id="nameForm"><div class="email"><input id="firstName" type="text" placeholder="Your first name" autocomplete="given-name" maxlength="60" required><button class="primary" type="submit">UnPredict Me?</button></div></form><p class="helper" id="deliveryNote">Your prediction is ready. Enter your first name to send it to <strong>'+esc(email)+'</strong>.</p></div></section>';
    document.getElementById("yes").onclick=function(){track("prediction_feedback",{response:"yes"});document.getElementById("feedbackArea").innerHTML='<p class="feedback">We’ll take that. The machine may be onto something.</p>';};
    document.getElementById("no").onclick=function(){track("prediction_feedback",{response:"no"});document.getElementById("feedbackArea").innerHTML='<p class="feedback">Fair. The machine is keeping its secrets.</p>';};
    document.getElementById("nameForm").onsubmit=function(ev){ev.preventDefault();var input=document.getElementById("firstName");if(!input.checkValidity()){input.reportValidity();return}sendPrediction(input.value.trim());};
  }
  function sendPrediction(firstName){
    var note=document.getElementById("deliveryNote");
    var form=document.getElementById("nameForm");
    var button=form.querySelector("button");
    button.disabled=true;
    button.textContent="Sending…";
    fetch("/api/send",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:email,firstName:firstName,prediction:prediction,marketing:marketing})}).then(function(r){return r.text().then(function(t){var d;try{d=JSON.parse(t)}catch(_){throw new Error("The email service returned an invalid response.")}d._httpStatus=r.status;return d})}).then(function(d){if(!d.emailSent)throw new Error(d.emailError||d.error||"The email could not be sent.");button.textContent="Sent ✓";track("prediction_email_sent");note.innerHTML="<strong>Prediction sent.</strong> Check your inbox for your UnPredictMe prediction.";}).catch(function(err){button.disabled=false;button.textContent="UnPredict Me?";track("prediction_email_failed");note.innerHTML="<strong>Prediction ready.</strong> We couldn’t send the email yet — "+esc(err.message)+".";});
  }
  function page(title,body){app.innerHTML='<section class="card page"><div class="eyebrow">'+esc(title.toUpperCase())+'</div><h2>'+esc(title)+'</h2>'+body+'</section>'}
  function route(){
    var p=location.pathname;
    if(p==="/about")return page("About UnPredictMe",'<p>UnPredictMe is a playful, unpredictable prediction service built around one simple idea: give us your email and we’ll make a prediction about you.</p><p>The point is not certainty. UnPredictMe turns tiny visible patterns in an email address into an intentionally surprising guess about you. We call it unpredictable because the fun comes from not knowing exactly what the machine will say.</p><p>We are not trying to tell you your future with certainty. The experience is entertainment — a little curiosity, a little surprise, and a reason to come back tomorrow.</p><h3>How it works</h3><ol><li>Enter your email.</li><li>We generate a playful prediction.</li><li>You can tell us whether we got you.</li><li>Come back another day for another prediction.</li></ol><p>UnPredictMe is designed to be simple: no long quiz, no birth chart, and no account setup.</p>');
    if(p==="/pricing")return page("Pricing",'<div class="price">Free</div><p style="text-align:center">UnPredictMe is currently free during launch.</p><h3>What you get</h3><ul><li>A personalized playful prediction.</li><li>Delivery of your prediction by email.</li><li>Access to the daily guessing experience.</li></ul><h3>Future services</h3><p>We may introduce optional paid features as the product develops. If pricing changes, we will clearly describe the product, price, and terms before a purchase is made.</p>');
    if(p==="/contact")return page("Contact Us",'<p>Questions about UnPredictMe, your prediction, your email preferences, or the service? We’d like to hear from you.</p><h3>Email</h3><p><a href="mailto:hello@unpredictme.com">hello@unpredictme.com</a></p><h3>What to include</h3><p>If you are contacting us about your account or an email you received, include the email address used with UnPredictMe and a short description of the issue. Please do not send passwords or other sensitive information.</p>');
    if(p==="/privacy")return page("Privacy Policy",'<p><strong>Last updated: September 18, 2026</strong></p><p>UnPredictMe collects the information you choose to provide when you use the service, including your email address and, where applicable, your response to the optional marketing consent.</p><h3>How we use information</h3><ul><li>To provide and email your requested prediction.</li><li>To operate, secure, troubleshoot, and improve the service.</li><li>To send promotional or product-update emails only when you have opted in.</li></ul><h3>Email delivery</h3><p>We use third-party email infrastructure to deliver messages. Your email address may be processed by our email service provider for that purpose.</p><h3>Data choices</h3><p>You can contact us to ask about the personal information associated with your use of UnPredictMe or to request that we stop sending optional marketing emails. Transactional messages needed to provide a requested service may still be sent.</p><h3>Children</h3><p>UnPredictMe is not intended for children under 13.</p><h3>Changes</h3><p>We may update this policy as the service changes. The date above indicates the latest update.</p>');
    if(p==="/terms")return page("Terms of Service",'<p><strong>Last updated: September 18, 2026</strong></p><h3>The service</h3><p>UnPredictMe provides playful, AI-assisted predictions for entertainment and personal reflection. Predictions are not promises, guarantees, professional advice, or factual determinations about your future.</p><h3>Using UnPredictMe</h3><p>You agree to provide an email address you are authorized to use and not to misuse the service, interfere with its operation, or submit unlawful content.</p><h3>Emails</h3><p>When you request a prediction, we may send the requested prediction to the email address you provide. Promotional emails are optional and require your consent.</p><h3>Availability</h3><p>We may change, suspend, or discontinue features as the product develops. We aim to keep the service available but do not guarantee uninterrupted operation.</p><h3>Entertainment only</h3><p>Do not rely on an UnPredictMe prediction as a substitute for medical, legal, financial, employment, relationship, or other professional advice or as a guarantee of an outcome.</p><h3>Contact</h3><p>Questions about these terms can be sent to <a href="mailto:hello@unpredictme.com">hello@unpredictme.com</a>.</p>');
    start();
  }
  route();
})();
</script></body></html>`;
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(request.method==="GET"&&url.pathname==="/robots.txt")return new Response(`User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

Sitemap: https://unpredictme.com/sitemap.xml
`,{headers:{"content-type":"text/plain;charset=UTF-8","cache-control":"public,max-age=86400"}});
 if(request.method==="GET"&&url.pathname==="/sitemap.xml")return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://unpredictme.com/</loc></url>
  <url><loc>https://unpredictme.com/about</loc></url>
  <url><loc>https://unpredictme.com/pricing</loc></url>
  <url><loc>https://unpredictme.com/contact</loc></url>
  <url><loc>https://unpredictme.com/privacy</loc></url>
  <url><loc>https://unpredictme.com/terms</loc></url>
</urlset>
`,{headers:{"content-type":"application/xml;charset=UTF-8","cache-control":"public,max-age=86400"}});
 if(request.method==="GET"&&url.pathname==="/llms.txt")return new Response(`# UnPredictMe

> UnPredictMe is a playful prediction experience that makes unpredictable guesses about you from tiny visible patterns in an email address.

## What it is

UnPredictMe is an entertainment product. A visitor enters an email address, receives a playful prediction, can say whether the prediction feels accurate, and can optionally provide a first name to have the prediction emailed to them.

## What makes it different

The experience is intentionally simple and unpredictable: one email address, one surprising guess, and a reason to come back for another prediction.

UnPredictMe does not claim that an email address reveals a person's real personality, identity, or future.

## Primary website

https://unpredictme.com/

## Key pages

- https://unpredictme.com/about — what UnPredictMe is and how it works
- https://unpredictme.com/pricing — current launch pricing
- https://unpredictme.com/contact — contact information
- https://unpredictme.com/privacy — privacy policy
- https://unpredictme.com/terms — terms of service
`,{headers:{"content-type":"text/plain;charset=UTF-8","cache-control":"public,max-age=86400"}});
 if(request.method==="POST"&&url.pathname==="/api/signup"){
  try{const body=await request.json(),email=String(body.email||"").trim().toLowerCase(),answers=Array.isArray(body.answers)?body.answers.slice(0,5).map(String):[];
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:"Please enter a valid email."},{status:400});
   const prediction=makePrediction(email,answers);
   return Response.json({prediction,testLike:!!prediction.testLike});
  }catch(_){return Response.json({error:"We couldn’t make that prediction. Try again."},{status:400})}
 }
 if(request.method==="POST"&&url.pathname==="/api/send"){
  try{const body=await request.json(),email=String(body.email||"").trim().toLowerCase(),firstName=String(body.firstName||"").trim().slice(0,60),prediction=body.prediction||{};
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:"Please enter a valid email."},{status:400});
   if(!firstName)return Response.json({error:"Please enter your first name."},{status:400});
   const emailResult=await sendBrevo(env,email,prediction,firstName);
   if(!emailResult.ok)return Response.json({error:"Prediction created, but email delivery failed.",emailSent:false,emailError:emailResult.error,emailStatus:emailResult.status||null},{status:502});
   return Response.json({emailSent:true});
  }catch(err){return Response.json({error:"Email service error.",emailSent:false,emailError:String(err&&err.message||"Unknown error")},{status:500})}
 }
 return new Response(html,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
}};
