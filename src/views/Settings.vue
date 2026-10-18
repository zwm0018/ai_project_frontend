<script setup lang="ts">
/* 设置：服务连接 / 生成默认值 / 存储 / 关于 */
import { reactive } from 'vue'
import { useUiStore } from '../stores/ui'
import SelectMenu from '../components/SelectMenu.vue'

const ui = useUiStore()

const D = reactive({ tier: '标准', aspect: '16:9', voice: '预设女声' })
const TIER_OPTS = ['极速', '标准', '超清'].map(v => ({ v, label: v }))
const ASPECT_OPTS = ['1:1', '16:9', '9:16', '4:3', '3:4'].map(v => ({ v, label: v }))
const VOICE_OPTS = ['预设女声', '预设男声', '自定义克隆'].map(v => ({ v, label: v }))
</script>

<template>
  <div>
    <div class="page-head">
      <h1>设置</h1>
      <span class="ph-sub">服务连接 · 生成默认值 · 存储</span>
      <span class="mock-flag">Mock 演示数据</span>
    </div>

    <div class="set-wrap">
      <section class="set-panel" v-reveal>
        <div class="set-head"><h2>服务连接</h2><span class="sh-sub">三个本机服务，缺一不可</span></div>
        <div class="svc-row">
          <span class="sr-name"><span class="svc-dot ok"></span>ComfyUI</span>
          <span class="sr-addr">http://127.0.0.1:8189</span>
          <span class="sr-act"><button class="btn sm" @click="ui.toast('ComfyUI 连接正常 · 版本 0.39.0', 'ok')">测试</button></span>
        </div>
        <div class="svc-row">
          <span class="sr-name"><span class="svc-dot ok"></span>Ollama</span>
          <span class="sr-addr">http://127.0.0.1:11434 · qwen2.5-7b</span>
          <span class="sr-act"><button class="btn sm" @click="ui.toast('Ollama 连接正常 · qwen2.5-7b 已加载', 'ok')">测试</button></span>
        </div>
        <div class="svc-row">
          <span class="sr-name"><span class="svc-dot ok"></span>Studio API</span>
          <span class="sr-addr">http://127.0.0.1:8000/api/v1（FastAPI · M4 接入）</span>
          <span class="sr-act"><button class="btn sm" @click="ui.toast('Studio API 尚未部署（M4 接入）', 'ok')">测试</button></span>
        </div>
      </section>

      <section class="set-panel" v-reveal>
        <div class="set-head"><h2>生成默认值</h2><span class="sh-sub">新建任务的初始参数</span></div>
        <div class="form-row">
          <label>默认档位</label>
          <SelectMenu v-model="D.tier" aria-label="默认档位" :options="TIER_OPTS" style="flex:.5" />
        </div>
        <div class="form-row">
          <label>默认比例</label>
          <SelectMenu v-model="D.aspect" aria-label="默认比例" :options="ASPECT_OPTS" style="flex:.5" />
        </div>
        <div class="form-row">
          <label>默认音色</label>
          <SelectMenu v-model="D.voice" aria-label="默认音色" :options="VOICE_OPTS" style="flex:.5" />
        </div>
        <div class="form-row">
          <label></label>
          <button class="btn" @click="ui.toast('默认值已保存（原型示意）', 'ok')">保存默认值</button>
          <span class="hint">保存后对新任务生效</span>
        </div>
      </section>

      <section class="set-panel" v-reveal>
        <div class="set-head"><h2>存储</h2><span class="sh-sub">产物与缓存分开管理</span></div>
        <div class="form-row">
          <label for="o-dir">产物目录</label>
          <input id="o-dir" class="form-input" value="outputs/（演示）" readonly>
          <button class="btn sm" @click="ui.toast('打开产物目录（原型示意）', 'ok')">打开</button>
        </div>
        <dl style="margin-top:4px">
          <div class="kv"><dt>生成产物</dt><dd>3.4 GB · 218 个文件</dd></div>
          <div class="kv"><dt>模型与缓存</dt><dd>46.2 GB · ComfyUI 模型 + hf_cache + torch_cache</dd></div>
          <div class="kv"><dt>临时文件</dt><dd>1.1 GB · temp\ 中的图生视频首帧等中间产物</dd></div>
        </dl>
        <div class="form-row">
          <label></label>
          <button class="btn" @click="ui.toast('已清理 temp\\ 临时文件 · 释放 1.1 GB（原型示意）', 'ok')">清理临时文件</button>
          <span class="hint">仅删除 temp\，不影响模型与产物</span>
        </div>
      </section>

      <section class="set-panel" v-reveal>
        <div class="set-head"><h2>关于</h2><span class="sh-sub">研究组内部项目</span></div>
        <dl>
          <div class="kv"><dt>版本</dt><dd>studio-app v0.1 · Vite + Vue 3 + GSAP</dd></div>
          <div class="kv"><dt>算力</dt><dd>NVIDIA RTX 5090D · 32 GB · PyTorch nightly cu130</dd></div>
          <div class="kv"><dt>管线</dt><dd>Flux → LTX-Video → F5-TTS → MuseTalk · Ollama qwen2.5-7b</dd></div>
          <div class="kv"><dt>接口契约</dt><dd>openapi.yaml（REST + SSE，17 路径）</dd></div>
        </dl>
      </section>
    </div>
  </div>
</template>
