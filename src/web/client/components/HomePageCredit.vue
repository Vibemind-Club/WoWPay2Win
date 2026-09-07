<script lang="ts" setup>
import { FORK_REPO_URL, HOST_HUB_URL, HOST_NAME, HOST_URL, UPSTREAM_AUTHOR, UPSTREAM_NAME, UPSTREAM_REPO_URL, UPSTREAM_SITE_URL } from '../../../common/Constants.ts'
</script>

<template>
    <div class="group padded credit">
        <p>
            <strong>This is a fork of {{ UPSTREAM_NAME }}</strong> by
            <a :href="UPSTREAM_REPO_URL">{{ UPSTREAM_AUTHOR }}</a> (AGPL-3.0).
            The scanner, the site and the auction data are his work: the listings here
            are mirrored from <a :href="UPSTREAM_SITE_URL">wowpay2win.com</a> every 30 minutes.
        </p>
        <p>
            What <a :href="HOST_URL">{{ HOST_NAME }}</a> changed: every raid BoE is listed once per
            secondary-stat pair (Crit / Vers and Vers / Crit are different rolls, so both are
            listed), so one variant can be viewed and priced on its own, and the table shows
            the real item level next to the difficulty.
        </p>
        <p class="links">
            <a :href="FORK_REPO_URL">Fork source</a>
            <a :href="HOST_HUB_URL">Seasonal Sheets</a>
        </p>
    </div>
</template>

<style lang="scss" scoped>
.credit{
    font-size: 0.8125rem;
    line-height: 1.5;

    p{
        margin: 0;

        + p{
            margin-top: math.div($padding, 2);
        }

        &.links{
            display: flex;
            gap: $padding;
        }
    }
}
</style>
