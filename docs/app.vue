<script setup>
import { debounce } from 'perfect-debounce'

const search = ref(null)
useServerSeoMeta({
  titleTemplate: '%s - Nuxt Fonts',
  ogSiteName: 'Nuxt Fonts',
  twitterCard: 'summary_large_image',
})
useHead({
  htmlAttrs: {
    lang: 'en',
  },
})
const links = [{
  label: 'Documentation',
  icon: 'i-heroicons-book-open-solid',
  to: '/get-started/installation',
}, {
  label: 'Playground',
  icon: 'i-ph-play-duotone',
  to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playground',
}, {
  label: 'Releases',
  icon: 'i-heroicons-rocket-launch-solid',
  to: 'https://github.com/nuxt/fonts/releases',
  target: '_blank',
}]
const { data: files } = useLazyFetch('/api/search.json', {
  default: () => [],
  server: false,
})
const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())

// Provide
provide('navigation', navigation)

watch(() => search.value?.commandPaletteRef?.query, debounce((query) => {
  if (!query) return
  useTrackEvent('Search', { props: { query, results: `${search.value?.commandPaletteRef.results.length}` } })
}, 500))
</script>

<template>
  <UHeader
    :links="links"
    title="Nuxt Fonts"
  >
    <template #logo>
      <svg
        class="h-6"
        viewBox="0 0 1337 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M377 200C379.16 200 381 198.209 381 196V103C381 103 386 112 395 127L434 194C435.785 197.74 439.744 200 443 200H470V50H443C441.202 50 439 51.4941 439 54V148L421 116L385 55C383.248 51.8912 379.479 50 376 50H350V200H377Z"
          fill="currentColor"
        />
        <path
          d="M726 92H739C742.314 92 745 89.3137 745 86V60H773V92H800V116H773V159C773 169.5 778.057 174 787 174H800V200H783C759.948 200 745 185.071 745 160V116H726V92Z"
          fill="currentColor"
        />
        <path
          d="M591 92V154C591 168.004 585.742 179.809 578 188C570.258 196.191 559.566 200 545 200C530.434 200 518.742 196.191 511 188C503.389 179.809 498 168.004 498 154V92H514C517.412 92 520.769 92.622 523 95C525.231 97.2459 526 98.5652 526 102V154C526 162.059 526.457 167.037 530 171C533.543 174.831 537.914 176 545 176C552.217 176 555.457 174.831 559 171C562.543 167.037 563 162.059 563 154V102C563 98.5652 563.769 96.378 566 94C567.96 91.9107 570.028 91.9599 573 92C573.411 92.0055 574.586 92 575 92H591Z"
          fill="currentColor"
        />
        <path
          d="M676 144L710 92H684C680.723 92 677.812 93.1758 676 96L660 120L645 97C643.188 94.1758 639.277 92 636 92H611L645 143L608 200H634C637.25 200 640.182 196.787 642 194L660 167L679 195C680.818 197.787 683.75 200 687 200H713L676 144Z"
          fill="currentColor"
        />
        <path
          d="M168 200H279C282.542 200 285.932 198.756 289 197C292.068 195.244 295.23 193.041 297 190C298.77 186.959 300.002 183.51 300 179.999C299.998 176.488 298.773 173.04 297 170.001L222 41C220.23 37.96 218.067 35.7552 215 34C211.933 32.2448 207.542 31 204 31C200.458 31 197.067 32.2448 194 34C190.933 35.7552 188.77 37.96 187 41L168 74L130 9.99764C128.228 6.95784 126.068 3.75491 123 2C119.932 0.245087 116.542 0 113 0C109.458 0 106.068 0.245087 103 2C99.9323 3.75491 96.7717 6.95784 95 9.99764L2 170.001C0.226979 173.04 0.00154312 176.488 1.90993e-06 179.999C-0.0015393 183.51 0.229648 186.959 2 190C3.77035 193.04 6.93245 195.244 10 197C13.0675 198.756 16.4578 200 20 200H90C117.737 200 137.925 187.558 152 164L186 105L204 74L259 168H186L168 200ZM89 168H40L113 42L150 105L125.491 147.725C116.144 163.01 105.488 168 89 168Z"
          fill="#00DC82"
        />
        <path
          d="M870 200H840V60H936V85H870V117H922V143H870V200Z"
          fill="#00DC82"
        />
        <path
          d="M990 200C979.817 200 971.173 197.422 963 193C954.827 188.444 947.556 181.905 943 174C938.444 165.961 937 157.915 937 148C937 138.085 939.444 128.905 944 121C948.556 112.961 954.827 106.422 963 102C971.173 97.4443 979.817 95 990 95C1000.18 95 1009.83 97.4443 1018 102C1026.17 106.422 1032.44 112.961 1037 121C1041.56 128.905 1044 138.085 1044 148C1044 157.915 1041.56 166.961 1037 175C1032.44 182.905 1026.17 188.444 1018 193C1009.83 197.422 1000.18 200 990 200ZM990 176C997.503 176 1004.31 173.226 1009 168C1013.69 162.774 1016 156.307 1016 148C1016 139.559 1012.69 132.226 1008 127C1003.31 121.774 997.503 119 990 119C982.497 119 976.69 121.774 972 127C967.31 132.226 965 139.559 965 148C965 156.307 967.31 162.774 972 168C976.69 173.226 982.497 176 990 176Z"
          fill="#00DC82"
        />
        <path
          d="M1059 200V98H1087V113C1089.81 108.042 1093.64 103.68 1099 101C1104.36 98.1862 1111.03 97 1118 97C1125.5 97 1131.37 98.6502 1137 102C1142.76 105.35 1147.92 109.97 1151 116C1154.22 122.03 1156 129.229 1156 137V200H1127V143C1127 136.836 1125.62 131.886 1122 128C1118.38 123.98 1113.76 122 1108 122C1101.84 122 1096.89 123.712 1093 128C1089.11 132.154 1087 137.434 1087 144V200H1059Z"
          fill="#00DC82"
        />
        <path
          d="M1186 69H1214V99H1241V122H1214V162C1214 171.647 1218.49 176 1228 176H1241V200H1224.27C1212.48 200 1203.1 196.784 1196.14 190.353C1189.3 183.921 1185.89 174.877 1185.89 163.22L1186 122H1166V99H1186V69Z"
          fill="#00DC82"
        />
        <path
          d="M1298 200C1285.54 200 1274.77 196.432 1267 190C1259.36 183.434 1255.53 174.853 1255 164H1279C1279.54 168.556 1281.78 172.32 1285 175C1288.35 177.546 1292.77 179 1298 179C1302.29 179 1305.32 177.876 1308 176C1310.81 174.124 1312 171.814 1312 169C1312 165.248 1311.22 164.474 1308 163C1304.78 161.526 1298.97 160.206 1292 159C1284.76 157.66 1279.56 155.608 1275 154C1270.44 152.392 1266.35 150.154 1263 146C1259.78 141.712 1258 135.771 1258 128C1258 122.104 1259.92 116.556 1263 112C1266.22 107.31 1270.51 103.546 1276 101C1281.49 98.3202 1287.17 97 1294 97C1306.19 97 1316.5 99.9704 1324 106C1331.64 112.03 1335.46 120.085 1336 130H1312C1311.46 125.846 1309.35 122.278 1306 120C1302.78 117.588 1299.02 117 1295 117C1290.98 117 1287.41 117.258 1285 119C1282.59 120.742 1282 123.918 1282 127C1282 130.752 1282.92 132.66 1286 134C1289.22 135.206 1294.17 137.062 1301 138C1308.37 139.072 1314.31 140.392 1319 142C1323.82 143.474 1328.52 145.578 1332 150C1335.48 154.422 1337 159.559 1337 168C1337 177.647 1333.24 185.104 1326 191C1318.9 196.762 1309.93 200 1298 200Z"
          fill="#00DC82"
        />
      </svg>
    </template>
    <template #right>
      <UColorModeButton v-if="!$colorMode.forced" />
      <UButton
        aria-label="Nuxt Website"
        icon="i-simple-icons-nuxtdotjs"
        to="https://nuxt.com"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt on X"
        icon="i-simple-icons-x"
        to="https://x.com/nuxt_js"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt Fonts on GitHub"
        icon="i-simple-icons-github"
        to="https://github.com/nuxt/fonts"
        color="gray"
        variant="ghost"
      />
    </template>
    <!-- Mobile panel -->
    <template
      v-if="$route.path !== '/'"
      #panel
    >
      <LazyUContentSearchButton
        size="md"
        class="w-full mb-4"
      />
      <LazyUNavigationTree
        :links="mapContentNavigation(navigation)"
        default-open
        :multiple="false"
      />
    </template>
  </UHeader>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UFooter :links="links">
    <template #left>
      <span class="text-sm">
        Published under <NuxtLink
          to="https://github.com/nuxt/fonts"
          target="_blank"
          class="underline"
        >
          MIT License
        </NuxtLink>
      </span>
    </template>
    <template #right>
      <UColorModeButton v-if="!$colorMode.forced" />
      <UButton
        aria-label="Nuxt Website"
        icon="i-simple-icons-nuxtdotjs"
        to="https://nuxt.com"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt on X"
        icon="i-simple-icons-x"
        to="https://x.com/nuxt_js"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt Fonts on GitHub"
        icon="i-simple-icons-github"
        to="https://github.com/nuxt/fonts"
        color="gray"
        variant="ghost"
      />
    </template>
  </UFooter>
  <ClientOnly>
    <LazyUContentSearch
      ref="search"
      :files="files"
      :navigation="navigation"
      :links="links"
    />
  </ClientOnly>
</template>
