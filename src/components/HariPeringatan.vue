<script setup>
import { ref, computed } from 'vue'
import { HARI_JAWA, PASARAN, NEPTU_H, NEPTU_P, PASARAN_COLOR, PASARAN_TEXT } from '../lib/aboge.js'

const selH = ref(0)
const selP = ref(0)

// Javanese commemoration milestones (selapanan / brobosan)
const MILESTONES = [
  { d: 1, name: 'Sedina', note: 'hari pertama' },
  { d: 7, name: 'Pitung dina', note: 'hari ke-7' },
  { d: 35, name: 'Selapan', note: 'satu selapan (35)' },
  { d: 40, name: 'Matang puluh', note: 'hari ke-40' },
  { d: 100, name: 'Nyatus', note: 'hari ke-100' },
  { d: 1000, name: 'Nyewu', note: 'hari ke-1000' },
]

const results = computed(() =>
  MILESTONES.map(m => ({
    ...m,
    hIdx: (selH.value + m.d - 1) % 7,
    pIdx: (selP.value + m.d - 1) % 5,
  }))
)

const selNh = computed(() => NEPTU_H[selH.value])
const selNp = computed(() => NEPTU_P[selP.value])
</script>

<template>
  <div class="view wrap--narrow wrap">
    <span class="eyebrow">Selapanan · hitung hari peringatan</span>
    <h2 class="section-title">Hari peringatan</h2>

    <!-- Selectors -->
    <div class="panel panel--pad">
      <div class="sel-grid">
        <div class="sel__col" style="flex:1;min-width:150px">
          <div class="sel__label">HARI</div>
          <div class="sel__list">
            <button v-for="(h, i) in HARI_JAWA" :key="i" class="segbtn" :class="{ 'is-active': selH === i }" @click="selH = i">
              <span>{{ h }}</span><span class="npt npt--h npt--sm">{{ NEPTU_H[i] }}</span>
            </button>
          </div>
        </div>
        <div class="sel__col" style="flex:1;min-width:150px">
          <div class="sel__label">PASARAN</div>
          <div class="sel__list">
            <button v-for="(p, i) in PASARAN" :key="i" class="segbtn" :class="{ 'is-active': selP === i }" @click="selP = i">
              <span>{{ p }}</span>
              <span class="npt npt--p npt--sm" :style="{ '--pc': PASARAN_COLOR[i], '--ptc': PASARAN_TEXT[i] }">{{ NEPTU_P[i] }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="summary-bar">
        <span class="big">{{ HARI_JAWA[selH] }} {{ PASARAN[selP] }}</span>
        <span class="npt npt--h">{{ selNh }}</span>
        <span class="npt npt--p" :style="{ '--pc': PASARAN_COLOR[selP], '--ptc': PASARAN_TEXT[selP] }">{{ selNp }}</span>
        <span class="neptu">= {{ selNh + selNp }}</span>
      </div>
    </div>

    <!-- Timeline -->
    <div class="timeline">
      <div v-for="r in results" :key="r.d" class="tl__node">
        <div class="tl__rail">
          <div class="tl__count">
            <b>{{ r.d }}</b><small>HARI</small>
          </div>
        </div>
        <div class="tl__body">
          <div class="tl__title">{{ r.name }}</div>
          <div class="tl__sub">{{ r.note }}</div>
          <div class="tl__result">
            <span class="tl__day">{{ HARI_JAWA[r.hIdx] }} <span class="pas">{{ PASARAN[r.pIdx] }}</span></span>
            <span class="npt npt--h npt--sm">{{ NEPTU_H[r.hIdx] }}</span>
            <span class="npt npt--p npt--sm" :style="{ '--pc': PASARAN_COLOR[r.pIdx], '--ptc': PASARAN_TEXT[r.pIdx] }">{{ NEPTU_P[r.pIdx] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
