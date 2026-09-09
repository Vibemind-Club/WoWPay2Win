<script lang="ts" setup>
import { ALL_DIFFICULTIES, type Difficulty } from '../../../../common/ItemBonusId.ts'
import { useFilterStore } from '../../store/Filter/useFilterStore.ts'

// Fork addition: the difficulty set as four toggle buttons in the header quick bar
// (owner, 2026-09-08). The sidebar checkbox list it mirrored was retired 2026-09-09
// when the rest of the item filters moved up here too.
const filterStore = useFilterStore()

function isOn(key: Difficulty): boolean {
    return filterStore.difficulties.has(key)
}

function toggle(key: Difficulty): void {
    const next = new Set(filterStore.difficulties)
    if (next.has(key)) {
        next.delete(key)
    } else {
        next.add(key)
    }
    filterStore.difficulties = next
}
</script>

<template>
    <div
        v-if="filterStore.enableDifficultyFilter"
        class="quick-filter"
        role="group"
        aria-label="Difficulty"
    >
        <span class="quick-label">Difficulty</span>
        <q-btn
            v-for="difficulty of ALL_DIFFICULTIES"
            :key="difficulty.key"
            dense
            no-caps
            size="sm"
            color="secondary"
            :unelevated="isOn(difficulty.key)"
            :outline="!isOn(difficulty.key)"
            :label="difficulty.label"
            :aria-pressed="isOn(difficulty.key)"
            @click="toggle(difficulty.key)"
        />
    </div>
</template>
