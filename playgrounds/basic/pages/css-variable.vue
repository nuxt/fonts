<template>
  <div>
    <div>
      'Sigmar'
    </div>
    <p>
      'Sigmar One'
    </p>
  </div>
</template>

<style scoped>
/* `processCSSVariables` = `true` */
div {
  --family: 'Sigmar';
  font-family: var(--family);
}

/* `processCSSVariables` = `font-prefixed-only` */
p {
  --font-family: 'Sigmar One';
  font-family: var(--font-family);
}
</style>
