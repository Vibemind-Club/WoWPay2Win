<script lang="ts" setup>
import { useFilterStore } from '../../store/Filter/useFilterStore.ts'
import { ALL_TERTIARIES, type Tertiary } from '../../../../common/ItemBonusId.ts'

// Fork: header quick-bar toggles (was a sidebar checkbox list under the BoE picker,
// which people scrolled past - owner, 2026-09-09). Same set, same semantics: none
// selected = no tertiary filter.
const filterStore = useFilterStore()

function isOn(bonusId: Tertiary): boolean {
    return filterStore.tertiaries.has(bonusId)
}

function toggle(bonusId: Tertiary): void {
    const next = new Set(filterStore.tertiaries)
    if (next.has(bonusId)) {
        next.delete(bonusId)
    } else {
        next.add(bonusId)
    }
    filterStore.tertiaries = next
}
</script>

<template>
    <div
        v-if="filterStore.enableTertiaryFilter"
        class="quick-filter"
        role="group"
        aria-label="Tertiary"
    >
        <span class="quick-label">Tertiary</span>
        <q-btn
            v-for="tertiary of ALL_TERTIARIES"
            :key="tertiary.bonusId"
            dense
            no-caps
            size="sm"
            color="secondary"
            :unelevated="isOn(tertiary.bonusId)"
            :outline="!isOn(tertiary.bonusId)"
            :label="tertiary.label"
            :aria-pressed="isOn(tertiary.bonusId)"
            @click="toggle(tertiary.bonusId)"
        />
    </div>
</template>
