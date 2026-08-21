<template>
  <h1>
    TailwindCSS support
  </h1>
  <hr>
  <div class="font-custom">
    Anton
  </div>
</template>

<style>
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

@theme {
  --font-custom: "Anton", "sans-serif";
}
</style>
