<script setup>
import { ref, computed } from 'vue'
import {
  HARI_JAWA, PASARAN, NEPTU_H, NEPTU_P, BULAN, MONTH_NAMES,
  WINDU_DATA, NEVER_1ST, C, px, PASARAN_COLOR, PASARAN_TEXT, dateToDayNum, dayNumToAboge,
} from './lib/aboge.js'
import KalenderUmum from './components/KalenderUmum.vue'
import HariBaikDasar from './components/HariBaikDasar.vue'
import HariBaikHitung from './components/HariBaikHitung.vue'
import HariPeringatan from './components/HariPeringatan.vue'
import AbogeModal from './components/AbogeModal.vue'

const tab = ref('masehi')
const hbTab = ref('hitung')
const popup = ref(null) // { ti, bi } | null

// ── Today, reckoned in Aboge — the hero's thesis ────────────────────────────
const now = new Date()
const todayAbg = dayNumToAboge(dateToDayNum(now))
const todayMasehi = `${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`
const todayNeptu = computed(() => NEPTU_H[todayAbg.h] + NEPTU_P[todayAbg.p])

const mainTabs = [
  ['masehi', 'Masehi'],
  ['kalender', 'Kalender'],
  ['haribaik', 'Hari Baik'],
  ['hariperingatan', 'Hari Peringatan'],
]
const hbTabs = [['hitung', 'Hitung'], ['dasar', 'Dasar']]

const activeYr = computed(() => (popup.value !== null ? WINDU_DATA[popup.value.ti] : null))
const activeMon = computed(() => (popup.value !== null ? WINDU_DATA[popup.value.ti].months[popup.value.bi] : null))
</script>

<template>
  <div :style="{ minHeight: '100vh' }">

    <!-- HEADER / HERO (unchanged) -->
    <div class="batik-stone" :style="px({
      borderBottom: `3px solid ${C.gold}`,
      padding: '34px 20px 30px', textAlign: 'center',
    })">
      <div :style="px({ color: C.goldt, fontSize: 11, letterSpacing: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, marginBottom: 8 })">
        SISTEM&nbsp;PENANGGALAN&nbsp;JAWA
      </div>
      <h1 class="display-serif" :style="px({ margin: 0, fontSize: 44, fontWeight: 600, color: C.bg, letterSpacing: 0.5, lineHeight: 1 })">
        Kalender Aboge
      </h1>
      <div :style="px({ color: '#a89878', fontSize: 12.5, marginTop: 10, fontFamily: 'var(--font-sans)' })">
        Siklus windu · 8 tahun · Wuntu: Ehe, Dal, Jimakir · Mulai
        <strong :style="{ color: C.goldt }">Rebo Wage</strong> (Tahun Alif)
      </div>

      <!-- ── Signature: "Hari Iki" colophon — today reckoned in Aboge ──────── -->
      <div :style="px({
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
        marginTop: 22, padding: '4px',
        borderRadius: 14,
        background: 'linear-gradient(160deg, rgba(212,151,26,0.55), rgba(124,48,32,0.45))',
      })">
        <div :style="px({
          background: 'rgba(20,18,14,0.78)',
          border: '1px solid rgba(212,151,26,0.35)',
          borderRadius: 11, padding: '14px 26px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          minWidth: 220,
        })">
          <div :style="px({
            color: C.goldt, fontFamily: 'var(--font-sans)', fontWeight: 700,
            fontSize: 9.5, letterSpacing: 3, textTransform: 'uppercase',
          })">
            Hari Iki · {{ todayMasehi }}
          </div>
          <div class="display-serif" :style="px({
            color: '#f4e4c4', fontSize: 30, fontWeight: 600, lineHeight: 1.1, marginTop: 4,
          })">
            {{ HARI_JAWA[todayAbg.h] }} {{ PASARAN[todayAbg.p] }}
          </div>
          <div :style="px({ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 })">
            <span :style="px({ color: '#d8c8a8', fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 500 })">
              {{ todayAbg.tanggal }} {{ BULAN[todayAbg.bulanIdx] }} · Tahun {{ todayAbg.tahun }}
            </span>
            <span :style="px({
              background: C.gold, color: C.stone, borderRadius: 20,
              padding: '2px 10px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12,
            })">
              neptu {{ todayNeptu }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- NAV -->
    <div class="nav-bar">
      <nav class="nav">
        <button v-for="[id, label] in mainTabs" :key="id"
          class="nav__tab" :class="{ 'is-active': tab === id }" @click="tab = id">
          {{ label }}
        </button>
      </nav>

      <!-- Hari Baik sub-tabs -->
      <div v-if="tab === 'haribaik'" class="subnav">
        <div class="subnav__inner">
          <button v-for="[id, label] in hbTabs" :key="id"
            class="subnav__tab" :class="{ 'is-active': hbTab === id }" @click="hbTab = id">
            {{ label }}
          </button>
        </div>
      </div>

    </div>

    <!-- MASEHI TAB -->
    <KalenderUmum v-if="tab === 'masehi'" />

    <!-- KALENDER TAB -->
    <div v-if="tab === 'kalender'">
      <div class="view wrap">

        <!-- Neptu reference section -->
        <div class="panel never">
          <span class="eyebrow">Neptu · hari & pasaran</span>
          <div class="neptu-ref">
            <div class="legend__group">
              <div class="legend__cells">
                <div v-for="(h, i) in HARI_JAWA" :key="i" class="legend__cell">
                  <span>{{ h }}</span>
                  <span class="npt npt--h">{{ NEPTU_H[i] }}</span>
                </div>
              </div>
            </div>
            <div class="legend__sep" />
            <div class="legend__group">
              <div class="legend__cells">
                <div v-for="(p, i) in PASARAN" :key="i" class="legend__cell">
                  <span>{{ p }}</span>
                  <span class="npt npt--p" :style="{ '--pc': PASARAN_COLOR[i], '--ptc': PASARAN_TEXT[i] }">{{ NEPTU_P[i] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Never appears as 1st of month -->
        <div class="panel never">
          <span class="eyebrow">Tak pernah jadi tanggal 1 · sepanjang siklus windu</span>
          <div class="never__chips">
            <span v-for="item in NEVER_1ST" :key="`${item.h}-${item.p}`" class="chip">
              <span class="npt npt--h npt--sm">{{ NEPTU_H[item.h] }}</span>
              <span class="rust">{{ HARI_JAWA[item.h] }}</span>
              <span class="npt npt--p npt--sm" :style="{ '--pc': PASARAN_COLOR[item.p], '--ptc': PASARAN_TEXT[item.p] }">{{ NEPTU_P[item.p] }}</span>
              <span class="olive">{{ PASARAN[item.p] }}</span>
            </span>
          </div>
        </div>

        <!-- Windu years -->
        <div class="years">
          <div v-for="(yr, ti) in WINDU_DATA" :key="ti" class="panel year" :style="{ '--accent': C.tag[ti] }">
            <div class="year__head">
              <span class="year__name">{{ yr.tahun }}</span>
              <span class="badge" :class="yr.isWuntu ? 'badge--wuntu' : 'badge--biasa'">
                {{ yr.isWuntu ? 'Wuntu · 355 hari' : 'Biasa · 354 hari' }}
              </span>
              <span class="year__meta">
                1 Suro
                <b>{{ HARI_JAWA[yr.months[0].startH] }} {{ PASARAN[yr.months[0].startP] }}</b>
                <span class="npt npt--h npt--sm">{{ NEPTU_H[yr.months[0].startH] }}</span>
                <span class="npt npt--p npt--sm" :style="{ '--pc': PASARAN_COLOR[yr.months[0].startP], '--ptc': PASARAN_TEXT[yr.months[0].startP] }">{{ NEPTU_P[yr.months[0].startP] }}</span>
              </span>
            </div>

            <div class="months">
              <button v-for="(m, bi) in yr.months" :key="bi" class="month lift"
                @click="popup = { ti, bi }">
                <div class="month__top">
                  <span class="month__name">{{ m.name }}</span>
                  <span class="month__days">{{ m.days }} hari</span>
                </div>
                <div class="month__row">
                  <span class="npt npt--h npt--sm">{{ NEPTU_H[m.startH] }}</span>
                  <span class="label-h">{{ HARI_JAWA[m.startH] }}</span>
                </div>
                <div class="month__row">
                  <span class="npt npt--p npt--sm" :style="{ '--pc': PASARAN_COLOR[m.startP], '--ptc': PASARAN_TEXT[m.startP] }">{{ NEPTU_P[m.startP] }}</span>
                  <span class="label-p">{{ PASARAN[m.startP] }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="foot">
        Windu 8 tahun · Wuntu (355h): Ehe, Dal, Jimakir · Epoch: Rebo Wage · ketuk bulan untuk detail harian
      </div>
    </div>

    <!-- HARI BAIK TAB -->
    <div v-if="tab === 'haribaik'">
      <HariBaikDasar v-if="hbTab === 'dasar'" />
      <HariBaikHitung v-if="hbTab === 'hitung'" />
    </div>

    <!-- HARI PERINGATAN TAB -->
    <HariPeringatan v-if="tab === 'hariperingatan'" />

    <!-- POPUP MODAL -->
    <AbogeModal
      v-if="popup !== null && activeMon"
      :tahunName="activeYr.tahun"
      :bulanIdx="popup.bi"
      :month="activeMon"
      @close="popup = null"
    />
  </div>
</template>
