export default defineAppConfig({
  ui: {
    primary: 'green',
    gray: 'slate',
    footer: {
      bottom: {
        left: 'text-sm text-gray-500 dark:text-gray-400',
        wrapper: 'border-t border-gray-200 dark:border-gray-800',
      },
    },
  },
  seo: {
    siteName: 'Nuxt Fonts',
  },
  header: {
    title: 'Nuxt Fonts',
    logo: {
      alt: '',
      light: '',
      dark: '',
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/nuxt/fonts',
      'target': '_blank',
      'aria-label': 'Nuxt Fonts on GitHub',
    }],
  },
  footer: {
    credits: 'Copyright © 2023',
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-nuxtdotjs',
      'to': 'https://nuxt.com',
      'target': '_blank',
      'aria-label': 'Nuxt Website',
    }, {
      'icon': 'i-simple-icons-discord',
      'to': 'https://chat.nuxt.dev',
      'target': '_blank',
      'aria-label': 'Nuxt on Discord',
    }, {
      'icon': 'i-simple-icons-x',
      'to': 'https://x.com/nuxt_js',
      'target': '_blank',
      'aria-label': 'Nuxt on X',
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/nuxt/nux',
      'target': '_blank',
      'aria-label': 'Nuxt on GitHub',
    }],
  },
})
