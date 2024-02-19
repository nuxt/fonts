export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/fonts',
    // '@nuxtjs/tailwindcss'
  ],
  fonts: {
    providers: {
      google: false
    }
    // provider: 'google', // sets default provider
    // families: [
    //   {
    //     name: 'Roboto', // the 'canonical' name of the font used to look it up in a provider database
    //     as: 'custom-roboto-family', // allow registering a font family with a different name
    //     provider: 'local', // you can override the provider on a per-family basis
    //     // provider specific options can be provided
    //     src: '~/public/roboto.woff2', // you can specify a source within your project
    //     // specific configuration will be used to generate `@font-face` definitions
    //     subsets: ['latin', 'greek'],
    //     display: 'swap', // or 'block'7
    //     weight: ['400', '700'],
    //     style: ['normal', 'italic'],
    //     // and produce CSS overrides to reduce layout shift (using fontaine)
    //     fallbacks: ['Arial'],
    //   }
    // ]
  }
})
