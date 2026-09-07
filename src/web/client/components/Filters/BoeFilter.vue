<script lang="ts" setup>
import { computed } from 'vue'
import { useFilterStore } from '../../store/Filter/useFilterStore.ts'
import { getItemIcon } from '../../utils/ImageLoader.ts'
import { getWowheadItemLinkById } from '../../../../common/utils/getWowheadItemLinkById.ts'
import { getItemNameById } from '../../../../common/utils/getItemName.ts'
import type { ItemId } from '../../../../common/api/BnetResponse.ts'
import { type BoeKey, ALL_SECONDARY_PAIRS, getItemBoeKeys, getSecondaryPairLabel, makeBoeKey } from '../../../../common/Boe.ts'

const filterStore = useFilterStore()

// Fork: the picker works on BoeKeys, not item ids. On a tier with
// splitBySecondary each item expands into one key per secondary pair, so a
// single stat variant (e.g. "Boots - Haste / Mastery") is its own entry that
// can be viewed and priced on its own.
const split = computed(() => filterStore.splitBySecondary)
const selectedBoes = computed<Array<BoeKey>>({
    get() {
        return [...filterStore.boes]
    },
    set(boes) {
        filterStore.boes = new Set(boes)
    },
})

const keysOf = (ids: ReadonlyArray<ItemId>): Array<BoeKey> => {
    return ids.flatMap((id) => getItemBoeKeys(id, split.value))
}

const toggleAll = (keysToAdd: ReadonlyArray<BoeKey>) => {
    const currentSelected = new Set(filterStore.boes)
    for (const key of keysToAdd) {
        currentSelected.add(key)
    }

    filterStore.boes = currentSelected
}
const toggleNone = (keysToRemove: ReadonlyArray<BoeKey>) => {
    const currentSelected = new Set(filterStore.boes)
    for (const key of keysToRemove) {
        currentSelected.delete(key)
    }

    filterStore.boes = currentSelected
}

const isAllActive = (keysToCheck: ReadonlyArray<BoeKey>): boolean => {
    for (const key of keysToCheck) {
        if (!selectedBoes.value.includes(key)) {
            return false
        }
    }

    return true
}
const isNoneActive = (keysToCheck: ReadonlyArray<BoeKey>): boolean => {
    for (const key of keysToCheck) {
        if (selectedBoes.value.includes(key)) {
            return false
        }
    }

    return true
}

const region = computed(() => filterStore.region)
const getWowheadLink = (itemId: ItemId) => {
    if (region.value === null) {
        return ''
    }

    return getWowheadItemLinkById(itemId, region.value)
}
const getItemName = (itemId: ItemId) => {
    if (region.value === null) {
        return ''
    }

    return getItemNameById(itemId, region.value)
}
</script>

<template>
    <q-banner
        v-if="filterStore.currentTierBoes.length === 0"
    >
        No BoEs available for {{ filterStore.currentTierName }}
    </q-banner>

    <div
        v-else
        class="group"
    >
        <div
            v-for="category of filterStore.currentTierBoes"
            :key="category.label"
        >
            <h2>
                {{ category.label }}

                <div
                    v-if="keysOf(category.ids).length > 1"
                    class="toggles"
                >
                    <a
                        :class="{ 'active': isNoneActive(keysOf(category.ids)) }"
                        @click="toggleNone(keysOf(category.ids))"
                    >
                        none
                    </a>
                    <a
                        :class="{ 'active': isAllActive(keysOf(category.ids)) }"
                        @click="toggleAll(keysOf(category.ids))"
                    >
                        all
                    </a>
                </div>
            </h2>

            <!-- Split tier: one head row per item, then one selectable row per stat pair -->
            <q-list
                v-if="split"
                dense
            >
                <template
                    v-for="id of category.ids"
                    :key="id"
                >
                    <q-item class="variant-head">
                        <q-item-section avatar>
                            <a
                                :href="getWowheadLink(id)"
                                :data-wowhead="`item=${id}`"
                                class="boe"
                                rel="noopener"
                                target="_blank"
                            >
                                <q-avatar
                                    rounded
                                    size="40px"
                                >
                                    <img
                                        v-if="getItemIcon(id)"
                                        :src="getItemIcon(id)"
                                        :alt="getItemName(id)"
                                        width="40"
                                        height="40"
                                    >
                                    <q-icon
                                        v-else
                                        name="error_outline"
                                        size="40px"
                                    />
                                </q-avatar>
                            </a>
                        </q-item-section>
                        <q-item-section>
                            <a
                                :href="getWowheadLink(id)"
                                :data-wowhead="`item=${id}`"
                                class="boe"
                                rel="noopener"
                                target="_blank"
                            >
                                {{ getItemName(id) }}
                            </a>
                        </q-item-section>
                        <q-item-section
                            side
                            class="item-toggles"
                        >
                            <a
                                :class="{ 'active': isNoneActive(getItemBoeKeys(id, true)) }"
                                @click="toggleNone(getItemBoeKeys(id, true))"
                            >
                                none
                            </a>
                            <a
                                :class="{ 'active': isAllActive(getItemBoeKeys(id, true)) }"
                                @click="toggleAll(getItemBoeKeys(id, true))"
                            >
                                all
                            </a>
                        </q-item-section>
                    </q-item>

                    <q-item
                        v-for="pair of ALL_SECONDARY_PAIRS"
                        :key="makeBoeKey(id, pair)"
                        v-ripple
                        clickable
                        tag="label"
                        class="variant"
                        :active="selectedBoes.includes(makeBoeKey(id, pair))"
                    >
                        <q-checkbox
                            v-model="selectedBoes"
                            :val="makeBoeKey(id, pair)"
                            hidden
                        />
                        <q-item-section>
                            {{ getSecondaryPairLabel(pair) }}
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>

            <!-- Plain tier: one row per item, as upstream -->
            <q-list
                v-else
                dense
            >
                <a
                    v-for="id of category.ids"
                    :key="id"
                    :href="getWowheadLink(id)"
                    :data-wowhead="`item=${id}`"
                    class="boe"
                    rel="noopener"
                    target="_blank"
                    @click="(event: MouseEvent) => event.stopPropagation()"
                >
                    <q-item
                        v-ripple
                        clickable
                        tag="label"
                        :active="selectedBoes.includes(makeBoeKey(id))"
                    >
                        <q-checkbox
                            v-model="selectedBoes"
                            :val="makeBoeKey(id)"
                            hidden
                        />
                        <q-item-section avatar>
                            <q-avatar
                                rounded
                                size="40px"
                            >
                                <img
                                    v-if="getItemIcon(id)"
                                    :src="getItemIcon(id)"
                                    :alt="getItemName(id)"
                                    width="40"
                                    height="40"
                                >
                                <q-icon
                                    v-else
                                    name="error_outline"
                                    size="40px"
                                />
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            {{ getItemName(id) }}
                        </q-item-section>
                    </q-item>
                </a>
            </q-list>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.group{
    display: flex;
    flex-direction: column;
    gap: $side-padding;
    padding: $side-padding 0;
}

@mixin pill-toggle {
    a{
        background: $dark;
        border-radius: 15px;
        color: white;
        cursor: pointer;
        display: block;
        margin-left: math.div($padding, 2);
        padding: 5px 10px;

        font-size: 0.75rem;
        line-height: 20px;
        text-transform: uppercase;
        text-decoration: none;

        &.active{
            background: $primary;
        }

        &:hover{
            background: $secondary;
        }
    }
}

h2 {
    display: flex;
    align-items: center;

    .toggles{
        flex: 1;

        @include pill-toggle;

        a{
            float: right;
        }
    }
}

.q-list{
    a.boe{
        display: block;
        text-decoration: none;

        .q-checkbox{
            display: none;
        }

        .q-item{
            &.q-item--active{
                background: $primary
            }

            .q-item__section--avatar{
                padding-right: $padding;
            }

            .q-item__label--caption{
                color: #aaa;
                line-height: $line-height !important;
                margin-top: math.div($padding, 2);
            }
        }
    }

    // Split tier rows
    .variant-head{
        padding-top: math.div($padding, 2);

        .q-item__section--avatar{
            padding-right: $padding;
        }

        a.boe{
            display: inline;
        }

        .item-toggles{
            flex-direction: row;
            align-items: center;

            @include pill-toggle;
        }
    }

    .variant{
        padding-left: 40px + $padding + $padding;
        min-height: 32px;

        .q-checkbox{
            display: none;
        }

        &.q-item--active{
            background: $primary;
        }
    }
}
</style>
