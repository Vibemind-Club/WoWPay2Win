import { REGIONS_DATA_DIR, AUCTIONS_DATA_DIR } from '../common/Constants.ts'
import { regionConfigs } from '../common/RegionConfig.ts'
import { ApiAccessor } from '../common/api/ApiAccessor.ts'
import { CacheableRegion } from '../common/api/CacheableRegion.ts'

// Refreshes data/regions/generated/region-<slug>.json (the connected-realm
// lists webpack bundles into the frontend) WITHOUT scanning any auction house.
// Upstream only regenerates these inside the auction cron; this fork serves
// auction data fetched elsewhere, so the realm lists need their own entry point.
async function main() {
    for (const regionConfig of regionConfigs) {
        const apiAccessor = new ApiAccessor(regionConfig)
        const region = new CacheableRegion(apiAccessor, REGIONS_DATA_DIR, AUCTIONS_DATA_DIR)
        await region.fetchRegionData()
    }
}

main().catch((err) => {
    console.warn(err)
    process.exit(1)
})
