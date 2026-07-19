<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  BULAN, HARI_JAWA, HARI_INDO, PASARAN, NEPTU_H, NEPTU_P, MONTH_NAMES,
  PASARAN_COLOR, PASARAN_TEXT, dateToDayNum, dayNumToAboge, dayNumToAsapon,
  hijriDate, moonPhase, pranataMangsa, goodHours,
} from '../lib/aboge.js'

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth()) // 0-indexed
const selected = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()))

// Live clock so the moon phase can follow real time (like the hero clock)
const nowTick = ref(new Date())
let moonTimer
onMounted(() => { moonTimer = setInterval(() => { nowTick.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(moonTimer))

const MIN_YEAR = 1900
const MAX_YEAR = 2150
const years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)

const DOW_LABELS = ["Ahad", "Senen", "Seloso", "Rebo", "Kemis", "Jemuwah", "Setu"]
const pad = (n) => String(n).padStart(2, '0')

const cells = computed(() => {
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()
  const firstDow = new Date(year.value, month.value, 1).getDay()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year.value, month.value, i + 1)
    return { day: i + 1, dow: (firstDow + i) % 7, abg: dayNumToAboge(dateToDayNum(d)) }
  })
})

const weeks = computed(() => {
  const firstDow = new Date(year.value, month.value, 1).getDay()
  const out = []
  let week = new Array(firstDow).fill(null)
  cells.value.forEach(cell => {
    week.push(cell)
    if (week.length === 7) { out.push(week); week = [] }
  })
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    out.push(week)
  }
  return out
})

function prev() {
  let m = month.value - 1, y = year.value
  if (m < 0) { if (y <= MIN_YEAR) return; m = 11; y-- }
  month.value = m; year.value = y
}
function next() {
  let m = month.value + 1, y = year.value
  if (m > 11) { if (y >= MAX_YEAR) return; m = 0; y++ }
  month.value = m; year.value = y
}
function goToday() {
  month.value = today.getMonth(); year.value = today.getFullYear()
  selected.value = new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

const atStart = computed(() => year.value <= MIN_YEAR && month.value === 0)
const atEnd = computed(() => year.value >= MAX_YEAR && month.value === 11)
const isCurrentMonth = computed(() => month.value === today.getMonth() && year.value === today.getFullYear())
function isToday(cell) {
  return cell && cell.day === today.getDate() && isCurrentMonth.value
}
function selectDay(cell) {
  if (cell) selected.value = new Date(year.value, month.value, cell.day)
}
function isSelected(cell) {
  return cell && selected.value.getFullYear() === year.value &&
    selected.value.getMonth() === month.value && selected.value.getDate() === cell.day
}

// ── Full detail for the selected day ────────────────────────────────────────
const detail = computed(() => {
  const dt = selected.value
  const dn = dateToDayNum(dt)
  const abg = dayNumToAboge(dn)
  const asp = dayNumToAsapon(dn)
  const neptu = NEPTU_H[abg.h] + NEPTU_P[abg.p]
  return {
    date: dt, abg, asp, neptu,
    hijri: hijriDate(dt),
    mangsa: pranataMangsa(dt),
    gh: goodHours(neptu),
  }
})

// Moon phase — live for today (follows the clock), fixed at noon for other days
const moon = computed(() => {
  const s = selected.value, n = nowTick.value
  const isSelToday = s.getFullYear() === n.getFullYear() &&
    s.getMonth() === n.getMonth() && s.getDate() === n.getDate()
  const ref = isSelToday ? n : new Date(s.getFullYear(), s.getMonth(), s.getDate(), 12)
  return moonPhase(ref)
})
const masehiLong = computed(() => {
  const d = detail.value.date
  return `${HARI_INDO[detail.value.abg.h]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
})
const bestHours = computed(() =>
  detail.value.gh.hours.filter(h => h.best).map(h => `${pad(h.hour)}:00`).join(' · ')
)

// After maghrib the Javanese day rolls to the next weton/tanggal
const nextAbg = computed(() => dayNumToAboge(dateToDayNum(selected.value) + 1))

// SVG path of the lit part of the moon disc
function moonLitPath(illum, waxing, R = 42, c = 46) {
  const k = Math.min(0.999, Math.max(0.001, illum / 100))
  const top = `${c},${c - R}`, bot = `${c},${c + R}`
  const rx = Math.max(0.001, R * Math.abs(1 - 2 * k))
  const limbSweep = waxing ? 1 : 0
  const termSweep = k <= 0.5 ? (waxing ? 0 : 1) : (waxing ? 1 : 0)
  return `M ${top} A ${R} ${R} 0 0 ${limbSweep} ${bot} A ${rx} ${R} 0 0 ${termSweep} ${top} Z`
}
const moonPath = computed(() => moonLitPath(moon.value.illum, moon.value.waxing))
</script>

<template>
  <div class="view wrap--mid wrap">

    <!-- Month nav -->
    <div class="cal__nav">
      <button class="navbtn" aria-label="Bulan sebelumnya" :disabled="atStart" @click="prev">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <div class="cal__selects">
        <select class="cal__select" aria-label="Pilih bulan" v-model.number="month">
          <option v-for="(m, i) in MONTH_NAMES" :key="i" :value="i">{{ m }}</option>
        </select>
        <select class="cal__select" aria-label="Pilih tahun" v-model.number="year">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <button class="navbtn" aria-label="Bulan berikutnya" :disabled="atEnd" @click="next">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>
    <div style="text-align:center;margin-bottom:18px">
      <button class="today-btn" :disabled="isCurrentMonth" :style="isCurrentMonth ? 'opacity:.45;cursor:default' : ''" @click="goToday">
        Hari ini
      </button>
    </div>

    <!-- Calendar grid -->
    <div class="panel cal">
      <div class="cal__grid">
        <div v-for="(d, i) in DOW_LABELS" :key="i" class="cal__dow" :class="{ 'is-sun': i === 0 }">{{ d }}</div>
      </div>
      <div v-for="(wk, wi) in weeks" :key="wi" class="cal__grid">
        <div v-for="(cell, di) in wk" :key="di"
          class="cal__cell"
          :class="{ 'is-empty': !cell, 'is-sun': di === 0 && cell, 'is-today': isToday(cell), 'is-selected': isSelected(cell) }"
          @click="selectDay(cell)">
          <template v-if="cell">
            <div class="cell__top">
              <span class="cell__date">{{ cell.day }}</span>
              <span class="cell__tahun">{{ cell.abg.tahun }}</span>
            </div>
            <div class="cell__aboge">{{ cell.abg.tanggal }} {{ BULAN[cell.abg.bulanIdx] }}</div>
            <div class="cell__hp">
              <span><b class="nh">{{ NEPTU_H[cell.abg.h] }}</b> <span class="name">{{ HARI_JAWA[cell.abg.h] }}</span></span>
              <span><b class="np">{{ NEPTU_P[cell.abg.p] }}</b> <span class="name">{{ PASARAN[cell.abg.p] }}</span></span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Detail for selected day -->
    <div class="panel detail">
      <div class="detail__head">
        <div>
          <div class="detail__weton">{{ HARI_JAWA[detail.abg.h] }} {{ PASARAN[detail.abg.p] }}</div>
          <div class="detail__masehi">{{ masehiLong }}</div>
          <div class="detail__maghrib">
            <span class="tag">17:30</span> bakda maghrib → {{ HARI_JAWA[nextAbg.h] }} {{ PASARAN[nextAbg.p] }} · {{ nextAbg.tanggal }} {{ BULAN[nextAbg.bulanIdx] }}
          </div>
        </div>
        <div class="detail__neptu">
          <span class="npt npt--h npt--lg">{{ NEPTU_H[detail.abg.h] }}</span>
          <span class="npt npt--p npt--lg" :style="{ '--pc': PASARAN_COLOR[detail.abg.p], '--ptc': PASARAN_TEXT[detail.abg.p] }">{{ NEPTU_P[detail.abg.p] }}</span>
          <span class="detail__sum">neptu {{ detail.neptu }}</span>
        </div>
      </div>

      <div class="sys">
        <div class="sys__row">
          <span class="sys__label">Aboge</span>
          <span class="sys__val">{{ detail.abg.tanggal }} {{ BULAN[detail.abg.bulanIdx] }} · Tahun {{ detail.abg.tahun }}</span>
        </div>
        <div class="sys__row">
          <span class="sys__label">Asapon</span>
          <span class="sys__val">{{ detail.asp.tanggal }} {{ BULAN[detail.asp.bulanIdx] }} · Tahun {{ detail.asp.tahun }}</span>
        </div>
        <div class="sys__row">
          <span class="sys__label">Hijriah</span>
          <span class="sys__val" v-if="detail.hijri">{{ detail.hijri.d }} {{ detail.hijri.month }} {{ detail.hijri.year }} H</span>
          <span class="sys__val muted" v-else>—</span>
        </div>
        <div class="sys__row">
          <span class="sys__label">Mangsa</span>
          <span class="sys__val">{{ detail.mangsa.name }} <span class="muted">({{ detail.mangsa.roman }})</span></span>
        </div>
      </div>

      <!-- Moon phase -->
      <div class="moonbox">
        <svg class="moon-disc" viewBox="0 0 92 92" aria-hidden="true">
          <circle cx="46" cy="46" r="42" class="moon-shadow" />
          <path :d="moonPath" class="moon-lit" />
          <circle cx="46" cy="46" r="42" class="moon-ring" />
        </svg>
        <div class="moonbox__txt">
          <div class="moonbox__label">Rembulan</div>
          <div class="moonbox__name">{{ moon.name }}</div>
          <div class="moonbox__sub">{{ moon.illum }}% · umur {{ moon.age }} hari</div>
        </div>
      </div>

      <!-- Good hours -->
      <div class="hours">
        <div class="hours__head">
          <span class="eyebrow">Jam becik · neptu {{ detail.neptu }}</span>
          <span class="hours__best">Terbaik: {{ bestHours }}</span>
        </div>
        <div class="hours__strip">
          <div v-for="h in detail.gh.hours" :key="h.hour" class="hour"
            :class="{ 'is-best': h.best, 'is-worst': h.val === detail.gh.min }">
            <span class="hour__h">{{ pad(h.hour) }}</span>
            <span class="hour__v">{{ h.val }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
