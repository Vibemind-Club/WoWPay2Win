import { createRouter, createWebHistory, type Router } from 'vue-router'
import { routes } from './routes.ts'
import { BASE_PATH } from '../../../common/Constants.ts'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export function createAppRouter(): Router {
    return createRouter({
        history: createWebHistory(BASE_PATH),
        routes,
    })
}
