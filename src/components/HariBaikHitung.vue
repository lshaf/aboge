<script setup>
import { ref, computed } from 'vue'
import { HARI_JAWA, PASARAN, NEPTU_H, NEPTU_P, PASARAN_COLOR, PASARAN_TEXT, dakon } from '../lib/aboge.js'
import HariBaikDasar from './HariBaikDasar.vue'

const dasarSum = ref(null) // neptu sum to show in Dasar modal, or null when closed

const selH1 = ref(0); const selP1 = ref(0)
const selH2 = ref(0); const selP2 = ref(0)

const sum1 = computed(() => NEPTU_H[selH1.value] + NEPTU_P[selP1.value])
const sum2 = computed(() => NEPTU_H[selH2.value] + NEPTU_P[selP2.value])

const r1 = computed(() => dakon(sum1.value, 7).at(-1).row)
const r2 = computed(() => dakon(sum2.value, 7).at(-1).row)

const order1 = computed(() => Array.from({ length: 7 }, (_, i) => (selH1.value + i) % 7))
const order2 = computed(() => Array.from({ length: 7 }, (_, i) => (selH2.value + i) % 7))

const verdict = computed(() => {
  const rows = order1.value.map(idx => ({ idx, total: (r1.value[idx] ?? 0) + (r2.value[idx] ?? 0) }))
  const max = Math.max(...rows.map(r => r.total))
  return rows.map(r => ({ ...r, best: r.total === max && max > 0 }))
})

function totalColor(t) {
  if (t === 0) return '#e6ddc9'
  if (t >= 4) return 'var(--rust)'
  if (t >= 2) return 'var(--gold)'
  return '#9a8f78'
}
function seeds(n) { return Array.from({ length: Math.min(n, 12) }) }

const persons = [
  { selH: selH1, selP: selP1, sum: sum1, order: order1, vals: r1, accent: 'var(--green)', accentL: 'var(--green-l)', seed: '', label: 'Orang Pertama' },
  { selH: selH2, selP: selP2, sum: sum2, order: order2, vals: r2, accent: 'var(--blue)', accentL: 'var(--blue-l)', seed: 'seed--blue', label: 'Orang Kedua' },
]
</script>

<template>
  <div class="view wrap--mid wrap">
    <span class="eyebrow">Hitung dakon · neptu dua orang</span>
    <h2 class="section-title">Mencari hari baik</h2>

    <!-- Person selectors -->
    <div class="persons">
      <div v-for="(p, pi) in persons" :key="pi" class="panel person" :style="{ '--accent': p.accent, '--accent-l': p.accentL }">
        <div class="person__head">
          <span class="label">{{ p.label }}</span>
          <span class="person__neptu">neptu <b>{{ p.sum.value }}</b></span>
        </div>
        <div class="person__body">
          <div class="sel__col">
            <div class="sel__label">HARI</div>
            <div class="sel__list">
              <button v-for="(o, i) in HARI_JAWA" :key="i" class="segbtn" :class="{ 'is-active': p.selH.value === i }" @click="p.selH.value = i">
                <span>{{ o }}</span><span class="npt npt--h npt--sm">{{ NEPTU_H[i] }}</span>
              </button>
            </div>
          </div>
          <div class="sel__col">
            <div class="sel__label">PASARAN</div>
            <div class="sel__list">
              <button v-for="(o, i) in PASARAN" :key="i" class="segbtn" :class="{ 'is-active': p.selP.value === i }" @click="p.selP.value = i">
                <span>{{ o }}</span>
                <span class="npt npt--p npt--sm" :style="{ '--pc': PASARAN_COLOR[i], '--ptc': PASARAN_TEXT[i] }">{{ NEPTU_P[i] }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Per-person dakon distributions -->
    <div v-for="(p, pi) in persons" :key="'d' + pi" class="panel dakon-card" :style="{ '--accent': p.accent, '--accent-l': p.accentL }">
      <div class="dakon-card__head">
        <span class="label">{{ HARI_JAWA[p.selH.value] }} {{ PASARAN[p.selP.value] }} · dakon({{ p.sum.value }}, 7)</span>
        <button class="dakon-card__dasar" @click="dasarSum = p.sum.value" aria-label="Buka referensi dasar dakon">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
            stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 6 C9.5 4.3 5.5 4.3 3 5 V19 C5.5 18.3 9.5 18.3 12 20 C14.5 18.3 18.5 18.3 21 19 V5 C18.5 4.3 14.5 4.3 12 6 Z" />
            <path d="M12 6 V20" />
          </svg>
          Dasar
        </button>
      </div>
      <div class="dakon">
        <div v-for="idx in p.order.value" :key="idx" class="dakon__day" :class="{ 'is-origin': idx === 0 }">
          <span class="dakon__dow">{{ HARI_JAWA[idx] }}</span>
          <span class="seedstack">
            <span v-for="(_, s) in seeds(p.vals.value[idx] ?? 0)" :key="s" class="seed" :class="p.seed" />
          </span>
          <span class="dakon__num" :class="{ 'is-zero': (p.vals.value[idx] ?? 0) === 0 }">{{ p.vals.value[idx] ?? 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Verdict -->
    <div class="panel" style="overflow:hidden">
      <div class="verdict-head">
        <span class="label">Gabungan</span>
        <span class="note">mahkota = hari dengan neptu tertinggi</span>
      </div>
      <div class="verdict">
        <div v-for="row in verdict" :key="row.idx" class="verdict__day" :class="{ 'is-best': row.best }">
          <span v-if="row.best" class="verdict__crown" aria-label="hari terbaik">♛</span>
          <span class="verdict__dow">{{ HARI_JAWA[row.idx] }}</span>
          <span class="verdict__pill" :style="{ background: totalColor(row.total) }">{{ row.total }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- DASAR REFERENCE MODAL -->
  <div v-if="dasarSum !== null" class="modal-overlay" @click="dasarSum = null">
    <div class="modal modal--dasar" @click.stop>
      <div class="modal__head">
        <div>
          <div class="modal__eyebrow">Tabel dasar dakon · neptu {{ dasarSum }}</div>
          <div class="modal__title">Referensi dakon</div>
        </div>
        <button class="modal__close" aria-label="Tutup" @click="dasarSum = null">
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none" />
          </svg>
        </button>
      </div>
      <div class="modal__body">
        <HariBaikDasar :sum="dasarSum" />
      </div>
    </div>
  </div>
</template>
