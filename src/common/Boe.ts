import type { Brand } from '../@types/Brand.ts'
import type { ItemId } from './api/BnetResponse.ts'
import type { ItemAuction } from './Cache.ts'
import { ALL_SECONDARIES, type Secondary } from './ItemBonusId.ts'
import { getAuctionSecondary } from './utils/getItemSecondary.ts'

export type BoeGearLabel = 'Plate' | 'Mail' | 'Leather' | 'Cloth' | 'Weapon' | 'Back' | 'Jewelry' | 'Trinket' | 'Raid BoEs'
export type BoeProfessionLabel = 'Jewelcrafting' | 'Blacksmithing' | 'Leatherworking' | 'Tailoring' | 'Inscription' | 'Alchemy' | 'Enchanting' | 'Engineering' | 'Cooking'
export type BoeLabel = BoeGearLabel | BoeProfessionLabel

export type BoeCategory = Readonly<{
    label: BoeLabel
    ids: ReadonlyArray<ItemId>
}>

export type Tier = Brand<string, 'Tier'>

export type TierConfig = Readonly<{
    name: string
    slug: Tier
    iconName: string
    boes: ReadonlyArray<BoeCategory>
    features?: Partial<{
        enableDifficultyFilter: boolean
        enableSocketFilter: boolean
        enableTertiaryFilter: boolean
        enableSecondaryFilter: boolean

        // Fork addition. Raid BoEs from The War Within onward roll a RANDOM pair
        // of secondaries, and the pair is what sets the price: a piece with its
        // spec's two best stats sells for a multiple of the same piece with the
        // wrong pair. When this is on, the BoE picker lists every item once per
        // stat pair (6 variants per item) so a single variant can be viewed and
        // priced on its own, instead of one entry that pools all six.
        splitBySecondary: boolean
    }>
}>

// Tier data is stored in from ./data/tiers/config and must be dynamically constructed into this Map
// For frontend, webpack can use require.context to generate this Map
// For backend, node can use dynamic imports to generate this Map
export type TierConfigMap = ReadonlyMap<Tier, TierConfig>

// ----------------------------------------------------------------------------
// BoE keys (fork addition)
//
// A BoeKey names one selectable entry in the picker. For a tier without
// splitBySecondary it is just the item id ("271444"). For a split tier it is
// the item id plus the sorted secondary pair ("271444:12" = item 271444 with
// Haste/Mastery, using the ALL_SECONDARIES key digits). Keys are strings so
// they survive the URL query and localStorage unchanged.
// ----------------------------------------------------------------------------

export type BoeKey = Brand<string, 'BoeKey'>

export type SecondaryPair = Readonly<[Secondary, Secondary]>

// Every unordered pair of the four secondaries, in a stable display order.
export const ALL_SECONDARY_PAIRS: ReadonlyArray<SecondaryPair> = (() => {
    const pairs = new Array<SecondaryPair>()
    const keys = ALL_SECONDARIES.map((secondary) => secondary.key)

    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            pairs.push([keys[i], keys[j]])
        }
    }

    return pairs
})()

const KEY_DELIMITER = ':'

export function makeBoeKey(itemId: ItemId, pair?: SecondaryPair): BoeKey {
    if (pair === undefined) {
        return `${itemId}` as BoeKey
    }

    const sorted = [...pair].toSorted((a, b) => a - b)
    return `${itemId}${KEY_DELIMITER}${sorted.join('')}` as BoeKey
}

export function parseBoeKey(key: BoeKey): { itemId: ItemId; pair?: SecondaryPair } | null {
    const [itemPart, pairPart] = key.split(KEY_DELIMITER)
    const itemId = parseInt(itemPart)
    if (isNaN(itemId)) {
        return null
    }

    if (pairPart === undefined) {
        return { itemId: itemId as ItemId }
    }

    if (pairPart.length !== 2) {
        return null
    }

    const a = parseInt(pairPart[0])
    const b = parseInt(pairPart[1])
    const valid = ALL_SECONDARIES.map((secondary) => secondary.key as number)
    if (!valid.includes(a) || !valid.includes(b) || a === b) {
        return null
    }

    return { itemId: itemId as ItemId, pair: [a as Secondary, b as Secondary] }
}

export function getSecondaryPairLabel(pair: SecondaryPair): string {
    return pair
        .map((key) => ALL_SECONDARIES[key].label)
        .join(' / ')
}

// The keys an auction can match. A split tier matches on item + its rolled
// pair; an auction whose pair cannot be read (no modifiers on the listing)
// falls back to the bare item key, which a split tier never lists - so such a
// listing is simply not shown rather than being mis-filed under a variant.
export function getAuctionBoeKey(auction: ItemAuction, splitBySecondary: boolean): BoeKey {
    if (!splitBySecondary) {
        return makeBoeKey(auction.itemId)
    }

    const secondaries = getAuctionSecondary(auction)
    if (secondaries.length !== 2 || secondaries[0] === secondaries[1]) {
        return makeBoeKey(auction.itemId)
    }

    return makeBoeKey(auction.itemId, [secondaries[0], secondaries[1]])
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

export function getAllBoeIds(tierConfigMap: TierConfigMap): Array<ItemId> {
    return [...tierConfigMap.keys()].flatMap((tier) => getTierBoeIds(tierConfigMap, tier))
}

export function getTierBoeIds(tierConfigMap: TierConfigMap, tier: Tier): Array<ItemId> {
    const tierConfig = tierConfigMap.get(tier)
    const boeIds = new Array<ItemId>()

    for (const category of tierConfig?.boes ?? []) {
        for (const id of category.ids) {
            boeIds.push(id)
        }
    }

    return boeIds
}

export function isTierSplitBySecondary(tierConfigMap: TierConfigMap, tier: Tier): boolean {
    return Boolean(tierConfigMap.get(tier)?.features?.splitBySecondary)
}

// Every selectable key for a tier: one per item, or one per item x pair.
export function getTierBoeKeys(tierConfigMap: TierConfigMap, tier: Tier): Array<BoeKey> {
    const split = isTierSplitBySecondary(tierConfigMap, tier)
    return getTierBoeIds(tierConfigMap, tier).flatMap((itemId) => getItemBoeKeys(itemId, split))
}

export function getItemBoeKeys(itemId: ItemId, splitBySecondary: boolean): Array<BoeKey> {
    if (!splitBySecondary) {
        return [makeBoeKey(itemId)]
    }

    return ALL_SECONDARY_PAIRS.map((pair) => makeBoeKey(itemId, pair))
}

export function getTierName(tierConfigMap: TierConfigMap, tier: Tier): string | undefined {
    return tierConfigMap.get(tier)?.name
}
