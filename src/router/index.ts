// import * as home from '@api/home'
import { nextTick } from 'vue'
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
  createRouter,
  createWebHistory
} from 'vue-router'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    meta: { menuAction: 'home' },
    component: () => import('../components/layout/DefaultLayout.vue'),
    // beforeEnter: dialogBeforeEnter,
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import('../views/home/index.vue')
        // beforeEnter:((to, from,next) => {
        //   if(to.query.code === from.query.code){
        //     next()
        //   }else{
        //     next({...to,query:from.query})
        //   }
        // })
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/GIS-Map'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    const container = document.getElementById('router-view-container')
    container?.scrollTo(0, 0)
    return { top: 0, behavior: 'smooth' }
  }
})



router.beforeEach(
  (to, from, next) => {
    next()
  }
)

export default router
