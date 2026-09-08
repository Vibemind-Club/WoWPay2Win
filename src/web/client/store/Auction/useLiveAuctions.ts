import { computed, onScopeDispose, watch } from 'vue'
import { useFilterStore } from '../Filter/useFilterStore.ts'
import { useAuctionStore } from './useAuctionStore.ts'

export function useLiveAuctions() {
    const auctionsStore = useAuctionStore()
    const filterStore = useFilterStore()

    // Load auctions whenever filterStore.region changes
    const region = computed(() => filterStore.region)
    const fetchAuctions = async () => {
        if (region.value === null) {
            return
        }

        await auctionsStore.loadAuctions(region.value)
    }

    watch(region, fetchAuctions, { immediate: true })

    // Keep an open tab current: loadAuctions is a no-op until the region's data
    // is older than its expiry, so this costs nothing between real refreshes.
    // Fork addition (host mirror refreshes every 5 minutes; upstream only refetched
    // on a region change after an hour, so a tab left open read hours stale).
    const timer = setInterval(() => { void fetchAuctions() }, 60 * 1000)
    const onVisible = () => { if (document.visibilityState === 'visible') { void fetchAuctions() } }
    document.addEventListener('visibilitychange', onVisible)
    onScopeDispose(() => {
        clearInterval(timer)
        document.removeEventListener('visibilitychange', onVisible)
    })
}
