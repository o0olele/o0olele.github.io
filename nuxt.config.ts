// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    "@barzhsieh/nuxt-content-mermaid",
    '@nuxtjs/sitemap',
  ],

  site: {
    url: 'https://o0olele.github.io',
  },

  app: {
    head: {
      meta: [
        { name: 'msvalidate.01', content: '42EF91E162805D1F73996514E4BA9596' }
      ]
    }
  },

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    }
  },
  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true,
      autoSubfolderIndex: false
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    provider: 'iconify'
  },

  ui: {
    fonts: false
  },
})
