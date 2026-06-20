<script setup>
import { ref, computed } from 'vue'
import {
  HARI_JAWA, HARI_INDO, PASARAN, NEPTU_H, NEPTU_P, BULAN, MONTH_NAMES,
  PASARAN_COLOR, PASARAN_TEXT, dateToDayNum, dayNumToAboge,
} from '../lib/aboge.js'

const pad = (n) => String(n).padStart(2, '0')
const toInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const today = new Date()
const selected = ref(toInput(today)) // YYYY-MM-DD from <input type="date">

// Javanese commemoration milestones (selapanan & mendhak).
// unit 'hari' counts days from the date (day 1 = the date itself);
// unit 'tahun' is the calendar anniversary.
const MILESTONES = [
  { value: 1, unit: 'hari', name: 'Sedina' },
  { value: 7, unit: 'hari', name: 'Pitung dina' },
  { value: 35, unit: 'hari', name: 'Selapan' },
  { value: 40, unit: 'hari', name: 'Matang puluh' },
  { value: 100, unit: 'hari', name: 'Nyatus' },
  { value: 1, unit: 'tahun', name: 'Mendhak pisan' },
  { value: 2, unit: 'tahun', name: 'Mendhak pindho' },
  { value: 1000, unit: 'hari', name: 'Nyewu' },
]

const selDate = computed(() => {
  const p = (selected.value || '').split('-').map(Number)
  return p.length === 3 && p.every((n) => !Number.isNaN(n))
    ? new Date(p[0], p[1] - 1, p[2])
    : new Date(today)
})

const selAbg = computed(() => dayNumToAboge(dateToDayNum(selDate.value)))
const selH = computed(() => selAbg.value.h)
const selP = computed(() => selAbg.value.p)
const selNh = computed(() => NEPTU_H[selH.value])
const selNp = computed(() => NEPTU_P[selP.value])

const fmt = (d) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`

const results = computed(() =>
  MILESTONES.map((m) => {
    const rd = new Date(selDate.value)
    if (m.unit === 'tahun') rd.setFullYear(rd.getFullYear() + m.value)
    else rd.setDate(rd.getDate() + (m.value - 1))
    const abg = dayNumToAboge(dateToDayNum(rd))
    return { ...m, date: rd, hIdx: abg.h, pIdx: abg.p }
  })
)
</script>

<template>
  <div class="view wrap--narrow wrap">
    <span class="eyebrow">Selapanan · hitung dari tanggal</span>
    <h2 class="section-title">Hari peringatan</h2>

    <!-- Date picker -->
    <div class="panel panel--pad">
      <div class="sel__label">PILIH TANGGAL (MASEHI)</div>
      <input type="date" class="date-input" v-model="selected" />

      <div class="summary-bar">
        <span class="big">{{ HARI_JAWA[selH] }} {{ PASARAN[selP] }}</span>
        <span class="npt npt--h">{{ selNh }}</span>
        <span class="npt npt--p" :style="{ '--pc': PASARAN_COLOR[selP], '--ptc': PASARAN_TEXT[selP] }">{{ selNp }}</span>
        <span class="neptu">= {{ selNh + selNp }}</span>
        <span class="aboge-date">{{ selAbg.tanggal }} {{ BULAN[selAbg.bulanIdx] }} · Tahun {{ selAbg.tahun }}</span>
      </div>
    </div>

    <!-- Timeline -->
    <div class="timeline">
      <div v-for="(r, i) in results" :key="i" class="tl__node" :class="{ 'is-year': r.unit === 'tahun' }">
        <div class="tl__rail">
          <div class="tl__count">
            <b>{{ r.value }}</b><small>{{ r.unit === 'tahun' ? 'TAHUN' : 'HARI' }}</small>
          </div>
        </div>
        <div class="tl__body">
          <div class="tl__name">{{ r.name }}</div>
          <div class="tl__date">{{ HARI_INDO[r.hIdx] }}, {{ fmt(r.date) }}</div>
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
