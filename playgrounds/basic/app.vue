<script setup lang="ts">
import '~/assets/reset.css'

const routes = useRouter().getRoutes().sort((a, b) => a.path.localeCompare(b.path))
</script>

<template>
  <div style="padding: 2rem; font-family: sans-serif;">
    <ul>
      <li
        v-for="route in routes"
        :key="route.path"
      >
        <NuxtLink
          :to="route.path"
          active-class="font-bold"
          no-prefetch
        >
          {{ route.path }}
        </NuxtLink>
      </li>
    </ul>
    <hr style="margin-top: 2rem; margin-bottom: 2rem;">
    <NuxtPage />
  </div>
</template>

<style scoped>
.font-bold {
  font-weight: 700;
}
</style>
