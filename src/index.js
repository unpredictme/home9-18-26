const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>UnPredictMe — We make a guess about you</title>
<meta name="description" content="Give UnPredictMe an email. We'll make a fun prediction about you. See if we can figure you out.">
<meta name="robots" content="index,follow">
<meta property="og:title" content="UnPredictMe — We make a guess about you">
<meta property="og:description" content="Give us almost nothing. We'll still make a guess.">
<style>
body{font-family:Inter,system-ui,sans-serif;margin:0;background:#faf8f4;color:#171717}
main{max-width:760px;margin:0 auto;padding:72px 22px;text-align:center}
h1{font-size:clamp(48px,10vw,92px);line-height:.9;margin:20px 0 16px;letter-spacing:-.06em}
p{font-size:20px;line-height:1.5;color:#555}
.card{margin:38px auto;padding:30px;border:1px solid #ddd;border-radius:24px;background:white;max-width:540px;box-shadow:0 10px 40px #0000000b}
input{width:100%;box-sizing:border-box;padding:16px;border:1px solid #ccc;border-radius:12px;font-size:17px;margin:8px 0}
button{width:100%;padding:16px;border:0;border-radius:12px;background:#171717;color:white;font-size:17px;cursor:pointer;margin-top:8px}
.small{font-size:13px;color:#777}.prediction{text-align:left;font-size:20px;line-height:1.55}.badge{font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:#777}
</style></head>
<body><main>
<div class="badge">AI-powered guessing game</div>
<h1>UnPredictMe</h1>
<p><strong>Give us an email. We'll make a prediction about you.</strong><br>Let's see if we can figure you out.</p>
<section class="card" id="app">
<form id="f"><input id="email" type="email" placeholder="you@example.com" required><button>Make My Prediction →</button></form>
<p class="small">For entertainment and self-reflection. We don't claim to know your future.</p>
</section>
</main>
<script>
const predictions=[
"You're more curious about what people think of you than you let on. You probably test things before you trust them—and right now, you're testing us.",
"You like having a plan, but you're at your most interesting when the plan changes. An unexpected invitation is more likely to get a yes from you than a carefully scheduled one.",
"You're more ambitious than you advertise. You may not care much about looking successful, but you care a lot about making progress—and you notice when you're standing still.",
"You probably have one decision you've been putting off. Not because you don't know what you want, but because making it real would force you to change something else.",
"You tend to appear more relaxed than you actually are. You think things through privately, then make your decision look effortless.",
"You're harder to predict around people you really like. When you care, you break your own rules more often than you'd admit."
];
function pick(s){let n=0;for(let c of s)n=(n*31+c.charCodeAt(0))>>>0;return predictions[n%predictions.length]}
document.getElementById('f').onsubmit=e=>{e.preventDefault();const email=document.getElementById('email').value;const p=pick(email);document.getElementById('app').innerHTML='<div class="badge">Our prediction</div><div class="prediction"><h2>We have a guess.</h2><p>'+p+'</p><hr><p><strong>Did we get you?</strong></p><button onclick="location.reload()">Yes — that's me</button><button style="background:#eee;color:#171717" onclick="location.reload()">Not even close</button></div><p class="small">This demo makes playful guesses from the input only. A production version should use explicit user-provided signals and a real email-delivery provider.</p>'}
</script></body></html>`;

export default { async fetch(request) {
  return new Response(html, {headers: {"content-type":"text/html;charset=UTF-8"}});
}};
