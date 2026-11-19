/// <reference types="vite/client" />
import { defineNuxtPlugin, useHead } from 'nuxt/app'
import print from '~/assets/print.css?url'

export default defineNuxtPlugin(() => {
  useHead({ link: [{ rel: 'stylesheet', href: print }] })
})
