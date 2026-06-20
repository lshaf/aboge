<script setup>
import { ref, computed } from 'vue'
import {
  BULAN, HARI_JAWA, PASARAN, NEPTU_H, NEPTU_P,
  MONTH_NAMES, dateToDayNum, dayNumToAboge,
} from '../lib/aboge.js'

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth()) // 0-indexed

const MIN_YEAR = 1900
const MAX_YEAR = 2150
const years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)

const DOW_LABELS = ["Ahad", "Senen", "Seloso", "Rebo", "Kemis", "Jemuwah", "Setu"]

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
function goToday() { month.value = today.getMonth(); year.value = today.getFullYear() }

const atStart = computed(() => year.value <= MIN_YEAR && month.value === 0)
const atEnd = computed(() => year.value >= MAX_YEAR && month.value === 11)
const isCurrentMonth = computed(() => month.value === today.getMonth() && year.value === today.getFullYear())
function isToday(cell) {
  return cell && cell.day === today.getDate() && isCurrentMonth.value
}
</script>

<template>
  <div class="view wrap--mid wrap">

    <!-- Month nav -->
    <div class="cal__nav">
      <button class="navbtn" aria-label="Bulan sebelumnya" :disabled="atStart" @click="prev">◀</button>
      <div class="cal__selects">
        <select class="cal__select" aria-label="Pilih bulan" v-model.number="month">
          <option v-for="(m, i) in MONTH_NAMES" :key="i" :value="i">{{ m }}</option>
        </select>
        <select class="cal__select" aria-label="Pilih tahun" v-model.number="year">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <button class="navbtn" aria-label="Bulan berikutnya" :disabled="atEnd" @click="next">▶</button>
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
          :class="{ 'is-empty': !cell, 'is-sun': di === 0 && cell, 'is-today': isToday(cell) }">
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
  </div>
</template>
