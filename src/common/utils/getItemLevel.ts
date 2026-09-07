import type { ItemLevelBonusIdsCacheFile } from '../../scripts/fetchBonusIds.ts'
import type { BonusId } from '../api/BnetResponse.ts'

// bonusId -> absolute item level, from Raidbots' upgrade-track bonus data
// (e.g. Myth 1/6 = 318, 2/6 = 321, 3/6 = 324 in Midnight Season 2). Every raid
// drop carries exactly one of these, which is what lets the table show the real
// item level instead of only the difficulty word.
const itemLevelBonusIds = await (async (): Promise<Map<BonusId, number>> => {
    if (__IS_WEBPACK__) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return new Map(require(__ITEMLEVEL_BONUS_ID_DATA_FILE__) as ItemLevelBonusIdsCacheFile) // Webpack specific function
    } else {
        const fs = await import('node:fs')
        const fileContents = fs.readFileSync(__ITEMLEVEL_BONUS_ID_DATA_FILE__).toString('utf8')
        const fileData = JSON.parse(fileContents) as ItemLevelBonusIdsCacheFile
        return new Map(fileData)
    }
})()

export function getItemLevel(bonusIds = new Array<BonusId>()): number | undefined {
    for (const bonusId of bonusIds) {
        const itemLevel = itemLevelBonusIds.get(bonusId)
        if (itemLevel !== undefined) {
            return itemLevel
        }
    }

    return undefined
}
