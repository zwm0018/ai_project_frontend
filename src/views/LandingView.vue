<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Icon from '../components/Icon.vue'
const router = useRouter(), auth = useAuthStore()
const mode = ref('image'), prompt = ref(''), playing = ref(false), film = ref<HTMLVideoElement | null>(null)
const modes = [ { id:'image', label:'图片', icon:'image', model:'FLUX' }, { id:'video', label:'视频', icon:'video', model:'LTX-Video' }, { id:'voice', label:'配音', icon:'wave', model:'F5-TTS' }, { id:'lipsync', label:'对口型', icon:'lipsync', model:'MuseTalk' } ]
function enter() { sessionStorage.setItem('studio.draft', JSON.stringify({ type:mode.value, prompt:prompt.value })); router.push(auth.isAuthed ? '/home' : '/login?redirect=/home') }
async function toggleFilm() { if (!film.value) return; if (playing.value) film.value.pause(); else { try { await film.value.play() } catch { playing.value = false } } }
const tips = ['雾中的山谷，晨光穿过树林','雨夜街道，镜头缓缓推近','为一段故事配上温柔的旁白']
onBeforeUnmount(() => film.value?.pause())
</script>
<template>
  <div class="entrance">
    <header class="entrance-nav">
      <router-link to="/" class="wordmark"><span class="mark"><Icon name="play" /></span>AI Studio<span class="edition">视听工作站</span></router-link>
      <nav aria-label="首页导航"><a href="#workflow">创作流程</a><a href="#start">开始创作</a><button class="nav-enter" @click="enter">进入工作台 <Icon name="external" /></button></nav>
    </header>
    <main class="entrance-main">
      <section class="opening" id="start">
        <div class="opening-copy">
          <div class="eyebrow"><span></span>让灵感，有声有色</div>
          <h1>从一个念头，<br>到一段<span>作品。</span></h1>
          <p class="intro">画面、镜头、声音，在同一个工作台相遇。<br>把想象交给 AI，把表达留给你。</p>
          <div class="start-box">
            <div class="start-modes" aria-label="创作类型"><button v-for="m in modes" :key="m.id" :class="{ selected:mode === m.id }" :aria-pressed="mode === m.id" @click="mode = m.id"><Icon :name="m.icon" />{{ m.label }}</button></div>
            <textarea v-model="prompt" aria-label="创作描述" :placeholder="mode === 'voice' ? '写下你想听见的文字…' : mode === 'lipsync' ? '进入工作台，添加视频与配音素材…' : '描述脑海中的画面…'" @keydown.ctrl.enter="enter"></textarea>
            <div class="start-bottom"><span>本地创作 · 当前为演示模式</span><button class="start-action" @click="enter">开始创作<Icon name="send" /></button></div>
          </div>
          <div class="try"><span>试试</span><button v-for="(t,i) in tips" :key="t" @click="mode = i === 2 ? 'voice' : i === 1 ? 'video' : 'image'; prompt = t">{{ ['山野晨光','电影感运镜','故事旁白'][i] }}<Icon name="plus" /></button></div>
        </div>
        <div class="film-column">
          <div class="film-frame">
            <video ref="film" src="/media/hero-loop.mp4" poster="/media/hero-poster.png" muted loop playsinline preload="metadata" @play="playing = true" @pause="playing = false"></video><div class="film-shade"></div>
            <div class="film-top"><span>灵感放映室</span><span class="film-tag">示例影像</span></div>
            <div class="film-caption"><div><span class="film-index">探索 · 001</span><h2>光，正在发生。</h2><p>让流动的光影，成为故事的开场。</p></div><button class="film-play" :aria-label="playing ? '暂停示例影像' : '播放示例影像'" @click="toggleFilm"><Icon :name="playing ? 'stop' : 'play'" /></button></div>
          </div><div class="film-foot"><span>灵感不设边界，创作自成一体。</span><span class="frame-lines" aria-hidden="true">▏▏▏▏▏▏▏▏▏▏▏▏</span></div>
        </div>
      </section>
      <section id="workflow" class="workflow">
        <div class="workflow-head"><h2>让创作，顺着灵感发生。</h2><p>从第一帧画面，到最后一句对白。</p></div>
        <div class="workflow-grid"><button v-for="(m,i) in modes" :key="m.id" class="workflow-item" @click="mode = m.id; enter()"><span class="workflow-number">0{{ i + 1 }}</span><Icon :name="m.icon" /><h3>{{ ['构想画面','赋予动态','听见故事','让角色开口'][i] }}</h3><p>{{ ['文字成像，或从参考图继续探索。','用一段描述，让静止的瞬间延展。','生成配音，寻找契合角色的声音。','让人物表情与对白自然衔接。'][i] }}</p><span class="workflow-model">{{ m.model }}<Icon name="external" /></span></button></div>
      </section>
    </main>
    <footer class="entrance-footer"><span>AI Studio / 本地视听创作</span><span>研究组工作空间 · 演示版本</span></footer>
  </div>
</template>
<style scoped>
.entrance { height:100dvh; overflow-y:auto; background:#16171B; color:#F0EEF5; }
.entrance-nav,.entrance-main,.entrance-footer { max-width:var(--content-outer); padding-inline:var(--content-pad); margin:auto; }
.entrance-nav { height:96px; display:flex; align-items:center; justify-content:space-between; gap:24px; }
.wordmark { display:flex; align-items:center; gap:11px; text-decoration:none; font-size:21px; font-weight:600; letter-spacing:-.7px; white-space:nowrap; }
.mark { width:34px; height:34px; background:var(--brand); color:#211B36; border-radius:11px; display:grid; place-items:center; transform:rotate(-7deg); }.mark :deep(svg) { width:18px; height:18px; }
.edition { font-size:12px; color:#9997A7; border-left:1px solid #3D3C48; padding-left:14px; margin-left:5px; letter-spacing:0; font-weight:400; }
.entrance-nav nav { display:flex; align-items:center; gap:28px; font-size:13px; }.entrance-nav a { text-decoration:none; }.entrance-nav nav>a { color:#B2AFBF; }.entrance-nav nav>a:hover { color:var(--brand); }
.nav-enter { border:1px solid #504B63; padding:10px 16px; border-radius:8px; display:flex; align-items:center; gap:12px; }.nav-enter :deep(svg) { width:15px; height:15px; }
.opening { display:grid; grid-template-columns:1.05fr 1fr; gap:64px; align-items:center; padding:48px 0 64px; }
.eyebrow { display:flex; align-items:center; gap:10px; color:#CBC5DE; font-size:13px; margin-bottom:22px; }.eyebrow>span { width:7px; height:7px; border-radius:50%; background:var(--brand); }
h1 { font-size:clamp(38px,4.1vw,58px); font-weight:500; line-height:1.35; letter-spacing:-2px; }h1>span { color:var(--brand); }
.intro { color:#B0ACBE; line-height:1.95; font-size:15px; margin:21px 0 28px; }
.start-box { border:1px solid #4A435D; border-radius:15px; background:#22212A; padding:8px 16px 13px; box-shadow:0 18px 48px #0002; transition:border-color .2s; }.start-box:focus-within { border-color:var(--brand); }
.start-modes { display:flex; gap:7px; border-bottom:1px solid #393443; padding-bottom:8px; }.start-modes button { display:flex; align-items:center; gap:6px; color:#ADA6BC; font-size:13px; padding:9px 10px; border-radius:7px; transition:background .2s,color .2s; }.start-modes button.selected { background:#393048; color:var(--brand); }.start-modes :deep(svg) { width:16px; height:16px; }
textarea { width:100%; resize:vertical; min-height:91px; max-height:200px; border:0; outline:0; background:none; font-size:15px; line-height:1.6; padding:16px 0; }textarea::placeholder { color:#9890A7; }
.start-bottom { display:flex; align-items:center; justify-content:space-between; gap:8px; }.start-bottom>span { font-size:11px; color:#A59BB8; }.start-action { background:var(--brand); color:#211B36; display:flex; align-items:center; gap:17px; padding:11px 17px; border-radius:8px; font-weight:600; font-size:13px; transition:transform .2s; }.start-action :deep(svg) { width:18px; height:18px; }.start-action:hover { background:#D2C6FF; transform:translateY(-1px); }
.try { display:flex; align-items:center; flex-wrap:wrap; gap:9px; margin-top:15px; font-size:11px; color:#B0A7C0; }.try button { border:1px solid #3D3749; border-radius:5px; padding:5px 8px; display:flex; align-items:center; gap:8px; }.try button:hover { color:var(--brand); border-color:#8E7CAB; }.try :deep(svg) { width:11px; height:11px; }
.film-frame { min-height:510px; position:relative; overflow:hidden; border-radius:160px 160px 18px 18px; background:#292A36; isolation:isolate; }.film-frame video { position:absolute; width:100%; height:100%; object-fit:cover; }.film-shade { position:absolute; inset:0; background:linear-gradient(180deg,#0004,transparent 45%,#10101BE8); }
.film-top { position:absolute; top:74px; left:30px; right:30px; display:flex; justify-content:space-between; align-items:center; color:#E9E3F4; font-size:12px; }.film-tag { padding:4px 8px; border:1px solid #ffffff4a; border-radius:20px; font-size:10px; }
.film-caption { position:absolute; bottom:33px; left:30px; right:30px; display:flex; align-items:flex-end; justify-content:space-between; gap:10px; }.film-index { color:#CFC1E8; font-size:11px; }.film-caption h2 { font-family:var(--font-serif); font-weight:500; font-size:34px; margin:10px 0; }.film-caption p { font-size:12px; color:#C7BED5; }.film-play { border:1px solid #D9CCE870; border-radius:50%; width:45px; height:45px; display:grid; place-items:center; flex:none; background:#ffffff0e; }.film-play :deep(svg) { width:16px; height:16px; }.film-play:hover { background:#ffffff25; }.film-foot { display:flex; justify-content:space-between; color:#9B90AB; font-size:10px; margin-top:14px; }.frame-lines { color:#81708F; letter-spacing:2px; }
.workflow { padding:35px 0 48px; border-top:1px solid #393440; scroll-margin-top:20px; }.workflow-head { display:flex; align-items:baseline; justify-content:space-between; gap:20px; margin-bottom:28px; }.workflow-head h2 { font-size:22px; font-weight:500; }.workflow-head p { font-size:12px; color:#A197AF; }.workflow-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }.workflow-item { text-align:left; position:relative; padding:19px 0; border-top:1px solid #484055; transition:transform .25s; }.workflow-item:hover { transform:translateY(-5px); border-color:var(--brand); }.workflow-number { position:absolute; right:0; top:20px; font-size:11px; color:#9D90AF; font-family:var(--font-mono); }.workflow-item>.ico :deep(svg) { width:23px; height:23px; color:var(--brand); margin-bottom:18px; }.workflow-item h3 { font-weight:500; font-size:17px; margin-bottom:9px; }.workflow-item p { font-size:12px; color:#ACA1BA; line-height:1.8; }.workflow-model { display:flex; justify-content:space-between; align-items:center; font-family:var(--font-mono); font-size:10px; color:#B5A5C7; margin-top:23px; }.workflow-model :deep(svg) { width:15px; height:15px; }.entrance-footer { display:flex; justify-content:space-between; padding-block:24px; border-top:1px solid #393440; font-size:10px; color:#9A8BA9; }
@media(min-width:1500px) { .opening { padding-top:65px; padding-bottom:80px; }.film-frame { min-height:560px; } }
@media(max-width:1000px) { .opening { gap:30px; }.edition { display:none; }.film-frame { min-height:490px; border-radius:120px 120px 16px 16px; }.film-caption h2 { font-size:27px; }.film-top { top:60px; }.start-modes button { padding-inline:7px; } }
@media(max-width:760px) { .entrance-nav { height:76px; }.entrance-nav nav>a { display:none; }.opening { grid-template-columns:1fr; padding-top:28px; gap:35px; }.opening-copy { max-width:560px; width:100%; margin:auto; }h1 { font-size:45px; }.film-frame { min-height:360px; border-radius:100px 100px 16px 16px; }.workflow-grid { grid-template-columns:repeat(2,1fr); }.workflow-head { display:block; }.workflow-head p { margin-top:8px; }.entrance-footer { gap:20px; }.film-top { top:45px; }.wordmark { font-size:18px; }.nav-enter { padding:9px 11px; font-size:12px; } }
@media(prefers-reduced-motion:no-preference) { .opening-copy { animation:arrive .7s both; }.film-column { animation:arrive .9s .1s both; }@keyframes arrive { from { opacity:0; transform:translateY(18px); }to { opacity:1; transform:none; } } }
</style>
