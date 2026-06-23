<script setup>
import { computed } from 'vue'
import { HARI_JAWA, PASARAN, PASARAN_COLOR, PASARAN_TEXT, DAKON_DATA, dakon } from '../lib/aboge.js'

const props = defineProps({
  // When set, show only the table for this neptu sum; otherwise show all.
  sum: { type: Number, default: null },
})

// Always show every step (langkah) — no result-only view.
const tables = computed(() => {
  const data = props.sum != null ? DAKON_DATA.filter(d => d.sum === props.sum) : DAKON_DATA
  return data.map(({ sum, combos }) => ({
    sum, combos, t1: dakon(sum, 7, true), t2: dakon(24, sum, true),
  }))
})

// classes for a value cell within a step row
function cellClass(val, ci, seq, kind) {
  const big = kind === 'h7' ? 5 : 6
  return {
    v0: val === 0,
    'vbig-h': kind === 'h7' && val >= big,
    'vbig-b': kind === 'h24' && val >= big,
    'mark-start': ci === seq.start,
    'mark-end': ci === seq.end,
  }
}
</script>

<template>
  <div class="dasar-ref">
    <div v-for="table in tables" :key="table.sum">
      <!-- hari + pasaran pairings that yield this neptu -->
      <div class="combo-pills">
        <span v-for="c in table.combos" :key="`${c.hi}-${c.pi}`" class="chip">
          <span class="npt npt--h npt--sm">{{ c.nh }}</span>
          <span class="rust">{{ HARI_JAWA[c.hi] }}</span>
          <span class="npt npt--p npt--sm" :style="{ '--pc': PASARAN_COLOR[c.pi], '--ptc': PASARAN_TEXT[c.pi] }">{{ c.np }}</span>
          <span class="olive">{{ PASARAN[c.pi] }}</span>
        </span>
      </div>

      <div class="panel sumcard">
      <!-- dakon(sum, 7) -->
      <div class="dakon-table dakon-table--h7">
        <div class="dakon-table__label">dakon({{ table.sum }}, 7)</div>
        <div class="steps">
          <table>
            <tbody>
              <tr v-for="(seq, ri) in table.t1" :key="ri">
                <td class="step-idx">
                  {{ ri === 0 ? '▶' : ri === table.t1.length - 1 ? '■' : ri }}
                </td>
                <td v-for="(val, ci) in seq.row" :key="ci"
                  :class="cellClass(val, ci, seq, 'h7')">{{ val }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- dakon(24, sum) -->
      <div class="dakon-table dakon-table--h24">
        <div class="dakon-table__label">dakon(24, {{ table.sum }})</div>
        <div class="steps">
          <table>
            <tbody>
              <tr v-for="(seq, ri) in table.t2" :key="ri">
                <td class="step-idx">
                  {{ ri === 0 ? '▶' : ri === table.t2.length - 1 ? '■' : ri }}
                </td>
                <td v-for="(val, ci) in seq.row" :key="ci"
                  :class="cellClass(val, ci, seq, 'h24')">{{ val }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>
