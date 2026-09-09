<script lang="ts" setup>
import { useFilterStore } from '../../store/Filter/useFilterStore.ts'

// Fork: a single toggle in the header quick bar (was a sidebar checkbox - owner,
// 2026-09-09). On = only listings whose bonus ids carry a socket; gear with a
// guaranteed socket (no socket bonus id) is filtered out too, as upstream noted.
const filterStore = useFilterStore()

function toggle(): void {
    filterStore.mustHaveSocket = !filterStore.mustHaveSocket
}
</script>

<template>
    <div
        v-if="filterStore.enableSocketFilter"
        class="quick-filter"
        role="group"
        aria-label="Socket"
    >
        <span class="quick-label">Socket</span>
        <q-btn
            dense
            no-caps
            size="sm"
            color="secondary"
            :unelevated="filterStore.mustHaveSocket"
            :outline="!filterStore.mustHaveSocket"
            label="Must have socket"
            :aria-pressed="filterStore.mustHaveSocket"
            @click="toggle"
        >
            <q-tooltip>
                Only listings with a socket. Gear with a guaranteed socket is filtered out as well.
            </q-tooltip>
        </q-btn>
    </div>
</template>
