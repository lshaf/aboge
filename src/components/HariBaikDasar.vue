<script setup>
import { reactive, computed } from 'vue'
import { HARI_JAWA, PASARAN, DAKON_DATA, dakon } from '../lib/aboge.js'

const verbose = reactive({})
function toggle(sum) { verbose[sum] = !verbose[sum] }

const tables = computed(() =>
  DAKON_DATA.map(({ sum, combos }) => {
    const isVerbose = !!verbose[sum]
    return { sum, combos, isVerbose, t1: dakon(sum, 7, isVerbose), t2: dakon(24, sum, isVerbose) }
  })
)

// classes for a value cell within a step row
function cellClass(val, ci, seq, ri, rows, kind) {
  const last = ri === rows.length - 1
  const big = kind === 'h7' ? 5 : 6
  return {
    v0: val === 0,
    'vbig-h': kind === 'h7' && val >= big,
    'vbig-b': kind === 'h24' && val >= big,
    [kind === 'h7' ? 'is-final-h' : 'is-final-b']: last && val === 1,
    'mark-start': seq._verbose && ci === seq.start,
    'mark-end': seq._verbose && ci === seq.end,
  }
}
</script>

<template>
  <div class="view wrap">
    <span class="eyebrow">Tabel dasar dakon · semua nilai neptu</span>
    <h2 class="section-title">Referensi dakon</h2>

    <div v-for="table in tables" :key="table.sum" class="panel sumcard">
      <div class="sumcard__head">
        <span class="sum-badge">Neptu {{ table.sum }}</span>
        <div class="sumcard__combos">
          <span v-for="c in table.combos" :key="`${c.hi}-${c.pi}`" class="combo">
            <span class="h">{{ HARI_JAWA[c.hi] }}</span>
            <span class="p">{{ PASARAN[c.pi] }}</span>
            <span class="e">{{ c.nh }}+{{ c.np }}</span>
          </span>
        </div>
        <button class="toggle" :class="{ 'is-on': table.isVerbose }" @click="toggle(table.sum)">
          {{ table.isVerbose ? 'Semua langkah' : 'Hasil akhir' }}
        </button>
      </div>

      <div class="steps">
        <table>
          <tbody>
            <!-- H7 -->
            <tr v-for="(seq, ri) in table.t1" :key="`h7-${ri}`"
              :class="{ dim: table.isVerbose && ri !== 0 && ri !== table.t1.length - 1 }">
              <td v-if="ri === 0" :rowspan="table.t1.length" class="rowlabel rowlabel--h7">H7</td>
              <td v-if="table.isVerbose" class="step-idx">
                {{ ri === 0 ? '▶' : ri === table.t1.length - 1 ? '■' : ri }}
              </td>
              <td v-for="(val, ci) in seq.row" :key="ci"
                :class="cellClass(val, ci, { ...seq, _verbose: table.isVerbose }, ri, table.t1, 'h7')">{{ val }}</td>
            </tr>
            <tr class="divider"><td :colspan="99" /></tr>
            <!-- H24 -->
            <tr v-for="(seq, ri) in table.t2" :key="`h24-${ri}`"
              :class="{ dim: table.isVerbose && ri !== 0 && ri !== table.t2.length - 1 }">
              <td v-if="ri === 0" :rowspan="table.t2.length" class="rowlabel rowlabel--h24">H24</td>
              <td v-if="table.isVerbose" class="step-idx">
                {{ ri === 0 ? '▶' : ri === table.t2.length - 1 ? '■' : ri }}
              </td>
              <td v-for="(val, ci) in seq.row" :key="ci"
                :class="cellClass(val, ci, { ...seq, _verbose: table.isVerbose }, ri, table.t2, 'h24')">{{ val }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
