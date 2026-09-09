<script lang="ts" setup>
import { computed } from 'vue'
import { useAuctionStore } from '../../store/Auction/useAuctionStore.ts'
import { useFilterStore } from '../../store/Filter/useFilterStore.ts'

// Fork addition (owner, 2026-09-09): exact item levels as header chips, one per level
// present in the loaded region for this tier. None selected = every level. A level that
// is selected (from the URL or a saved state) but no longer listed still gets a chip,
// so a filter that hides everything is always visible and can be switched off.
const filterStore = useFilterStore()
const auctionStore = useAuctionStore()

const levels = computed<Array<number>>(() => {
    const all = new Set([...auctionStore.tierItemLevels, ...filterStore.itemLevels])
    return [...all].toSorted((a, b) => a - b)
})

function isOn(level: number): boolean {
    return filterStore.itemLevels.has(level)
}

function toggle(level: number): void {
    const next = new Set(filterStore.itemLevels)
    if (next.has(level)) {
        next.delete(level)
    } else {
        next.add(level)
    }
    filterStore.itemLevels = next
}
</script>

<template>
    <div
        v-if="levels.length > 0"
        class="quick-filter"
        role="group"
        aria-label="Item level"
    >
        <span class="quick-label">Item level</span>
        <q-btn
            v-for="level of levels"
            :key="level"
            dense
            no-caps
            size="sm"
            color="secondary"
            :unelevated="isOn(level)"
            :outline="!isOn(level)"
            :label="level"
            :aria-pressed="isOn(level)"
            @click="toggle(level)"
        />
    </div>
</template>
