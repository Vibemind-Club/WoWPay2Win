<script lang="ts" setup>
import throttle from 'lodash.throttle'
import { ref, watch, computed } from 'vue'
import { useFilterStore } from '../../store/Filter/useFilterStore.ts'
import { convertGoldToPosition, convertPositionToGold } from './MaxBuyoutConversion.ts'
import { GOLD_CAP } from '../../../../common/Constants.ts'

// Fork: lives in the header quick bar (was a sidebar slider under the BoE picker -
// owner, 2026-09-09). The slider scale and the throttled write are upstream's.
const filterStore = useFilterStore()
const formatter = Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
const formatedMaxBuyout = computed(() => formatter.format(filterStore.maxBuyout))
const capText = computed(() => filterStore.maxBuyout >= GOLD_CAP ? 'no cap' : `${formatedMaxBuyout.value}g`)

const sliderPosition = ref(convertGoldToPosition(filterStore.maxBuyout))
watch(sliderPosition, throttle((sliderPosition: number) => {
    const maxBuyout = convertPositionToGold(sliderPosition)
    filterStore.maxBuyout = maxBuyout
}, 250))

// A tier change resets the store's cap; the slider has to follow or it shows a
// stale position (store -> slider only when they disagree, so dragging is not fought).
watch(() => filterStore.maxBuyout, (maxBuyout) => {
    const pos = convertGoldToPosition(maxBuyout)
    if (Math.abs(pos - sliderPosition.value) > 0.5) {
        sliderPosition.value = pos
    }
})
</script>

<template>
    <div
        class="quick-filter max-buyout"
        role="group"
        aria-label="Max buyout"
    >
        <span class="quick-label">Max buyout</span>
        <q-slider
            v-model="sliderPosition"
            :label-value="formatedMaxBuyout"
            :min="0"
            :max="100"
            color="secondary"
            dense
            label
        />
        <span class="cap">{{ capText }}</span>
    </div>
</template>

<style lang="scss" scoped>
.max-buyout{
    flex: 1 1 260px;
    min-width: 260px;

    .q-slider{
        flex: 1;
        min-width: 140px;
    }

    .cap{
        min-width: 7.5em;
        color: white;
        font-size: 0.85rem;
        font-variant-numeric: tabular-nums;
        text-align: right;
    }
}
</style>
