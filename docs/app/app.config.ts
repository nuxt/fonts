export default defineAppConfig({
  site: {
    name: 'Nuxt Fonts',
  },
  ui: {
    colors: {
      primary: 'green',
      neutral: 'neutral',
    },
    pageHero: {
      slots: {
        title: 'text-4xl sm:text-5xl lg:text-6xl/[1.05] tracking-tighter',
        description: 'text-base sm:text-lg/8 max-w-xl',
      },
    },
    pageSection: {
      slots: {
        container: 'py-14 sm:py-16 lg:py-20',
        title: 'text-2xl sm:text-3xl lg:text-4xl tracking-tighter',
        description: 'max-w-2xl',
      },
      variants: {
        orientation: {
          vertical: {
            wrapper: 'text-left',
            title: 'text-left',
            description: 'text-left text-pretty',
            headline: 'justify-start',
            leading: 'justify-start',
            links: 'justify-start',
          },
        },
      },
    },
  },
  github: {
    rootDir: 'docs',
  },
  socials: {
    nuxt: 'https://nuxt.com',
    x: 'https://go.nuxt.com/x',
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Community',
      links: [
        {
          icon: 'i-ph-shooting-star-duotone',
          label: 'Star on GitHub',
          to: 'https://github.com/nuxt/fonts',
          target: '_blank',
        },
        {
          icon: 'i-ph-chat-centered-text-duotone',
          label: 'Chat on Discord',
          to: 'https://chat.nuxt.dev',
          target: '_blank',
        },
        {
          icon: 'i-ph-hand-heart-duotone',
          label: 'Become a Sponsor',
          to: 'https://github.com/sponsors/nuxt',
          target: '_blank',
        },
        {
          icon: 'i-simple-icons-nuxtdotjs',
          label: 'Nuxt docs',
          to: 'https://nuxt.com',
          target: '_blank',
        },
      ],
    },
  },
})
