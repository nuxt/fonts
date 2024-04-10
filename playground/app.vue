<script setup lang="ts">
const routes = useRouter().getRoutes().sort((a, b) => a.path.localeCompare(b.path))
</script>

<template>
  <div class="p-8">
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
    <hr class="my-8">
    <NuxtPage />
  </div>
</template>
