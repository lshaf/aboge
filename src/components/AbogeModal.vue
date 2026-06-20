<script setup>
import { computed } from 'vue'
import { HARI_JAWA, PASARAN, NEPTU_H, NEPTU_P, PASARAN_COLOR, PASARAN_TEXT } from '../lib/aboge.js'

const props = defineProps({
  tahunName: { type: String, required: true },
  bulanIdx: { type: Number, required: true },
  month: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const dayRows = computed(() =>
  Array.from({ length: props.month.days }, (_, i) => ({
    tgl: i + 1,
    hIdx: (props.month.startH + i) % 7,
    pIdx: (props.month.startP + i) % 5,
  }))
)
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal__head">
        <div>
          <div class="modal__eyebrow">Tahun {{ tahunName }} · Bulan {{ bulanIdx + 1 }}</div>
          <div class="modal__title">{{ month.name }}</div>
          <div class="modal__meta">
            {{ month.days }} hari · 1 {{ month.name }}:
            <b>{{ HARI_JAWA[month.startH] }} {{ PASARAN[month.startP] }}</b>
            <span class="npt npt--h">{{ NEPTU_H[month.startH] }}</span>
            <span class="npt npt--p" :style="{ '--pc': PASARAN_COLOR[month.startP], '--ptc': PASARAN_TEXT[month.startP] }">{{ NEPTU_P[month.startP] }}</span>
          </div>
        </div>
        <button class="modal__close" aria-label="Tutup" @click="emit('close')">
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none" />
          </svg>
        </button>
      </div>

      <div class="modal__body">
        <table class="daytable">
          <thead>
            <tr><th>Tgl</th><th>Hari</th><th>Pasaran</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in dayRows" :key="row.tgl">
              <td class="tgl">{{ row.tgl }}</td>
              <td>
                <span class="np-cell">
                  <span class="npt npt--h">{{ NEPTU_H[row.hIdx] }}</span>{{ HARI_JAWA[row.hIdx] }}
                </span>
              </td>
              <td>
                <span class="np-cell">
                  <span class="npt npt--p" :style="{ '--pc': PASARAN_COLOR[row.pIdx], '--ptc': PASARAN_TEXT[row.pIdx] }">{{ NEPTU_P[row.pIdx] }}</span>
                  <span class="pas">{{ PASARAN[row.pIdx] }}</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
