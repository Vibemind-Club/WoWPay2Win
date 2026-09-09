<script lang="ts" setup>
import { computed } from 'vue'
import { useAuctionStore } from '../store/Auction/useAuctionStore.ts'
import { useLiveAuctions } from '../store/Auction/useLiveAuctions.ts'
import { useFilterStore } from '../store/Filter/useFilterStore.ts'
import { useFilterSyncLocalStorage } from '../store/Filter/useFilterSyncLocalStorage.ts'
import { useFilterSyncQuery } from '../store/Filter/useFilterSyncQuery.ts'
import BoeFilter from './Filters/BoeFilter.vue'
import MaxBuyoutFilter from './Filters/MaxBuyoutFilter.vue'
import RealmFilter from './Filters/RealmFilter.vue'
import RegionFilter from './Filters/RegionFilter.vue'
import SocketFilter from './Filters/SocketFilter.vue'
import TertiaryFilter from './Filters/TertiaryFilter.vue'
import TierFilter from './Filters/TierFilter.vue'
import DifficultyQuickFilter from './Filters/DifficultyQuickFilter.vue'
import HomePageAuctionsTable from './HomePageAuctionsTable.vue'
import HomePageFlavorText from './HomePageFlavorText.vue'
import HomePageCredit from './HomePageCredit.vue'
import SecondaryFilter from './Filters/SecondaryFilter.vue'
import { APP_DESC, APP_NAME, BASE_PATH } from '../../../common/Constants.ts'

useFilterSyncLocalStorage()
useFilterSyncQuery()
useLiveAuctions()

const filterStore = useFilterStore()
const selectedRegion = computed(() => filterStore.region)

const auctionsStore = useAuctionStore()
const lastUpdateIso = computed(() => auctionsStore.lastUpdateIso)
const lastUpdateString = computed(() => auctionsStore.lastUpdateFull)
const lastUpdateFromNow = computed(() => auctionsStore.lastUpdateFromNow)
</script>

<template>
    <div class="main-layout">
        <header class="shadow-2">
            <div class="logo">
                <q-avatar size="40px">
                    <img :src="`${BASE_PATH}token.png`" :alt="APP_NAME" width="40" height="40">
                </q-avatar>

                <h1>
                    {{ APP_NAME }}
                </h1>
            </div>

            <div class="filters">
                <div class="selects">
                    <RegionFilter />
                    <TierFilter />
                </div>
                <!-- Fork: every per-listing filter sits up here (Evan, 2026-09-09) - the sidebar
                     copies lived under a 100-entry BoE picker and people scrolled past them. -->
                <div
                    v-if="selectedRegion"
                    class="quick-bar"
                >
                    <DifficultyQuickFilter />
                    <TertiaryFilter />
                    <SocketFilter />
                    <MaxBuyoutFilter />
                </div>
            </div>
        </header>

        <main>
            <aside>
                <div class="group padded">
                    {{ APP_DESC }}
                </div>

                <HomePageCredit />

                <template v-if="selectedRegion">
                    <div class="group padded">
                        <strong>Last Update: </strong>
                        <time :datetime="lastUpdateIso" :title="lastUpdateString">
                            {{ lastUpdateFromNow }}
                        </time>
                    </div>

                    <RealmFilter />
                    <BoeFilter />
                    <SecondaryFilter />
                </template>
                <template v-else>
                    <q-banner>
                        No region selected
                    </q-banner>
                </template>

                <div class="vspace" />

                <HomePageFlavorText />
            </aside>

            <article>
                <div class="table-wrapper">
                    <HomePageAuctionsTable />
                </div>
            </article>
        </main>
    </div>
</template>

<style lang="scss" scoped>
.main-layout{
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 100vh;

    > header,
    > main{
        display: grid;
        grid-template-columns: minmax($sidebar-min-width, 20%) minmax($sidebar-min-width, 1fr);
        grid-template-rows: 100%;
    }
}

header{
    .logo{
        background: $header;
        display: flex;
        gap: $padding;
        align-items: center;
        padding: $padding $side-padding;

        h1{
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
            line-height: 1;
            margin: 0;
        }
    }

    .filters{
        background-color: $bg-side;
        display: flex;
        flex-direction: column;
        gap: $padding;
        padding: $padding;

        .selects{
            display: grid;
            grid-template-columns: math.div($sidebar-min-width, 2) 1fr;
            gap: $padding;
        }

        .quick-bar{
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: $padding $side-padding;
        }
    }
}

aside{
    background: $bg-side;
    display: flex;
    flex-direction: column;
    // The filter column is the tallest thing on the page, so it used to set the page height while the
    // table sat sticky inside a column stretched to match - reaching the bottom of the table meant
    // scrolling past the whole filter list first. Pin the column to the viewport with its own scrollbar
    // instead, and let the table drive the page (Evan 2026-09-08).
    position: sticky;
    top: 0;
    align-self: start;
    max-height: 100vh;
    overflow-y: auto;

    .vspace{
        flex: 1;
    }
}

.table-wrapper{
    position: static;
}
</style>
