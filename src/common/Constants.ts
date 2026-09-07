export const APP_NAME = 'WoWPay2Win'
export const APP_DESC = 'Every raid BoE listed on every auction house in each region, split by secondary-stat roll and shown with its real item level.'
export const OG_DESC = 'Tired of being bad in World of Warcraft? Just swipe your credit card and buy your BiS gear off the auction house!'

// Where this build is served from. Every absolute URL the app emits (bundle,
// data files, static images, the router base) hangs off this so the SPA can
// live under a path instead of a domain root.
export const BASE_PATH = '/wowpay2win/'
export const WEB_URL = 'https://stykasheets.com/wowpay2win/'

// ----------------------------------------------------------------------------
// Fork provenance. This project is a fork of WoWPay2Win by Stephen Li
// (Trinovantes), AGPL-3.0. The upstream site is also where the auction data
// this deployment serves comes from (see cron_wowpay2win.php in the stykasheets
// repo) - keep both credited wherever the app names itself.
// ----------------------------------------------------------------------------
export const UPSTREAM_NAME = 'WoWPay2Win'
export const UPSTREAM_AUTHOR = 'Trinovantes'
export const UPSTREAM_SITE_URL = 'https://www.wowpay2win.com/'
export const UPSTREAM_REPO_URL = 'https://github.com/Trinovantes/WoWPay2Win'
export const FORK_REPO_URL = 'https://github.com/Vibemind-Club/WoWPay2Win'
export const HOST_NAME = 'Styka Sheets'
export const HOST_URL = 'https://stykasheets.com/'
export const HOST_HUB_URL = 'https://stykasheets.com/seasonal-sheets/'

export const CACHE_DURATION = 52 // weeks
export const API_TIMEOUT = 30 * 1000 // in ms
export const MAX_API_ATTEMPTS = 5

export const GOLD_CAP = 10 * 1000 * 1000
export const ROWS_PER_PAGE = 20

// Empty = Sentry disabled. The upstream DSN was deliberately dropped so this
// fork's errors never land in the upstream author's project.
export const SENTRY_DSN = ''

export const REGIONS_DATA_DIR = 'data/regions/generated'
export const ITEMS_DATA_DIR = 'data/items/generated'
export const ITEMS_ICON_DIR = 'data/items/icons'
export const TIERS_CONFIG_DIR = 'data/tiers/config'
export const TIERS_ICON_DIR = 'data/tiers/icons'
export const AUCTIONS_DATA_DIR = 'dist/web/data'

export const SOCKET_BONUS_ID_DATA_FILE = 'data/items/generated/bonusIds-socket.json'
export const SECONDARY_BONUS_ID_DATA_FILE = 'data/items/generated/bonusIds-secondary.json'
export const DIFFICULTY_BONUS_ID_DATA_FILE = 'data/items/generated/bonusIds-difficulty.json'
export const ITEMLEVEL_BONUS_ID_DATA_FILE = 'data/items/generated/bonusIds-itemlevel.json'
