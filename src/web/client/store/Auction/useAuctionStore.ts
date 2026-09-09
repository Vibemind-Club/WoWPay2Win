import { defineStore } from 'pinia'
import { useFilterStore } from '../Filter/useFilterStore.ts'
import { formatDistance } from 'date-fns'
import { computed, ref } from 'vue'
import type { ItemAuction, RegionAuctions } from '../../../../common/Cache.ts'
import type { RegionSlug } from '../../../../common/RegionConfig.ts'
import { getRegionConnectedRealmIds } from '../../../../common/utils/getRegion.ts'
import { BASE_PATH } from '../../../../common/Constants.ts'
import { getTierBoeIds } from '../../../../common/Boe.ts'
import { getItemLevel } from '../../../../common/utils/getItemLevel.ts'
import { tierConfigMap } from '../../../../common/utils/getTierConfigMap.ts'

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export type Auctions = Array<ItemAuction>

export const useAuctionStore = defineStore('Auctions', () => {
    const filterStore = useFilterStore()

    const auctions = ref(new Map<RegionSlug, RegionAuctions>())
    const loadAuctions = async (regionSlug: RegionSlug): Promise<void> => {
        const regionAuctions = auctions.value.get(regionSlug)
        const regionExpired = (Date.now() - (regionAuctions?.lastUpdate ?? 0)) > (5 * 60 * 1000) // Expire after 5 minutes - the host's mirror refreshes on that cadence
        if (!regionExpired) {
            return
        }

        // Bucket the cache key to the mirror's 5-minute cadence and skip the browser
        // cache outright: Cloudflare rewrites the origin's max-age=300 up to its 4h
        // browser TTL, so a bare fetch handed back a copy hours old and Last Update
        // read "about 2 hours ago" against a mirror that was 12 minutes behind.
        const bucket = Math.floor(Date.now() / (5 * 60 * 1000))
        const auctionsFile = `${BASE_PATH}data/auctions-${regionSlug}.json?t=${bucket}`
        const response = await fetch(auctionsFile, { cache: 'no-store' })
        const loadedAuctions = await response.json() as RegionAuctions
        auctions.value.set(regionSlug, loadedAuctions)
    }

    const filteredAuctions = computed<Auctions>(() => {
        if (filterStore.region === null) {
            return []
        }

        // If the user filtered by realms, we need to find their corresponding parent crIds
        const connectedRealms = getRegionConnectedRealmIds(filterStore.region, filterStore.realms)

        // Get and filter auctions
        const regionAuctions = auctions.value.get(filterStore.region)?.auctions ?? []
        return regionAuctions.filter((auction) => {
            if (!filterStore.shouldShowAuction(auction)) {
                return false
            }
            if (connectedRealms.size > 0 && !connectedRealms.has(auction.crId)) {
                return false
            }

            return true
        })
    })
    // Fork: every item level present in the loaded region for the current tier's BoEs,
    // ascending - the header ilvl chip row is built from this so it never offers a
    // level nothing is listed at. Region-wide and selection-independent so the row
    // does not jump around as items are picked.
    const tierItemLevels = computed<Array<number>>(() => {
        if (filterStore.region === null) {
            return []
        }

        const tierItemIds = new Set(getTierBoeIds(tierConfigMap, filterStore.tier))
        const levels = new Set<number>()
        for (const auction of auctions.value.get(filterStore.region)?.auctions ?? []) {
            if (!tierItemIds.has(auction.itemId)) {
                continue
            }

            const itemLevel = getItemLevel(auction.bonusIds)
            if (itemLevel !== undefined) {
                levels.add(itemLevel)
            }
        }

        return [...levels].toSorted((a, b) => a - b)
    })

    const tokenPrice = computed<number | undefined>(() => {
        if (filterStore.region === null) {
            return
        }

        const tokenPrice = auctions.value.get(filterStore.region)?.tokenPrice
        if (tokenPrice === undefined) {
            return
        }

        return tokenPrice
    })

    const lastUpdateIso = computed<string>(() => {
        if (filterStore.region === null) {
            return ''
        }

        const lastUpdate = auctions.value.get(filterStore.region)?.lastUpdate
        if (lastUpdate === undefined) {
            return ''
        }

        return new Date(lastUpdate).toISOString()
    })
    const lastUpdateFull = computed<string>(() => {
        if (filterStore.region === null) {
            return ''
        }

        const lastUpdate = auctions.value.get(filterStore.region)?.lastUpdate
        if (lastUpdate === undefined) {
            return ''
        }

        return new Date(lastUpdate).toString()
    })
    const lastUpdateFromNow = computed<string>(() => {
        if (filterStore.region === null) {
            return ''
        }

        const lastUpdate = auctions.value.get(filterStore.region)?.lastUpdate
        if (lastUpdate === undefined) {
            return ''
        }

        return formatDistance(lastUpdate, new Date(), { addSuffix: true })
    })

    return {
        loadAuctions,
        filteredAuctions,
        tierItemLevels,
        tokenPrice,

        lastUpdateIso,
        lastUpdateFull,
        lastUpdateFromNow,
    }
})
