<script lang="ts" setup>
import { ALL_DIFFICULTIES, type Difficulty } from '../../../../common/ItemBonusId.ts'
import { useFilterStore } from '../../store/Filter/useFilterStore.ts'

// Fork addition: the same difficulty set the sidebar's DifficultyFilter edits, as four
// toggle buttons in the header - the sidebar copy sits under Region, Realm and the
// BoE list and was easy to miss (owner, 2026-09-08).
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
        class="difficulty-quick"
        role="group"
        aria-label="Difficulty"
    >
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

<style lang="scss" scoped>
.difficulty-quick{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}
</style>
