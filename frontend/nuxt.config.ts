const marked = require('marked')

let posts: any[] = []

interface author {
  name: string
}

interface category {
  name: string
}

interface item {
  title: string
  id: string
  link: string
  image: string
  date: Date
  category: category[]
  description: string
  content: string
  author: author
}

const constructFeedItem = (post: any, dir: any, hostname: any) => {
  const url = `${hostname}/${dir}/${post.slug}/`
  const item: item = {
    title: post.title,
    id: post.slug,
    link: url,
    image: post.imgUrl,
    date: new Date(post.createdAt),
    category: [],
    description: post.description,
    content: marked(post.bodyPlainText),
    author: { name: post.author },
  }
  post.tags.forEach((category: any) => item.category.push({ name: category }))
  return item
}

const create = async (feed: any, args: any) => {
  const [filePath, ext] = args
  const hostname = 'https://www.elian.codes'
  feed.options = {
    title: "Elian Van Cutsem's blog",
    description: 'Welcome to my blog. I write about technology and coding.',
    link: `${hostname}/`,
    ttl: 30,
    image: "https://www.elian.codes/favicon.png",
  }
  const { $content } = require('@nuxt/content')
  if (posts === null || posts.length === 0)
    posts = await $content(filePath).sortBy('createdAt', 'desc').fetch()

  for (const post of posts) {
    const feedItem = await constructFeedItem(post, filePath, hostname)
    feed.addItem(feedItem)
  }

  feed.addCategory('Nuxt.js')
  feed.addCategory('IT')
  feed.addCategory('programming')
  feed.addCategory('Coding')
  feed.addCategory('Full-stack')

  feed.addContributor({
    name: 'Elian Van Cutsem',
    email: 'elianvancutsem@gmail.com',
    link: 'http://www.elian.codes/'
  })

  return feed
}

const fillRoutes = async (feed: string[]) => {
  const { $content } = require('@nuxt/content')
  let posts: any[] = []
  await feed.forEach(feed => $content(feed).only(["path"])
        .sortBy('createdAt', 'desc')
        .fetch().then((data: any) => data.map((post: any) => posts.push(post))))
  return posts.map((post: any) => (post.path === "/index" ? "/" : post.path));
}

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  generate: {
    fallback: true
  },

  router: {
    base: '/',
  },

  loading: {
    color: '#6ee7b7',
    height: '4px',
    failedColor: 'b91c1c'
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Elian Van Cutsem',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { name: 'monetization', content: '$ilp.uphold.com/gH9RGFW9ijRA' },
      { name: 'theme-color', content: '#6ee7b7' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Elian Van Cutsem' },
    ],
    link: [
      { rel: 'alternate', type: 'application/rss+xml', href: 'https://www.elian.codes/blog.xml' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
    ],
  },

  hooks: {
    'content:file:beforeInsert': (document: any) => {
      if (document.extension === '.md') {
        document.bodyPlainText = document.text
      }
    },
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  tailwindcss: {
    cssPath: '~/assets/scss/tailwind.scss',
    configPath: 'tailwind.config.ts',
    exposeConfig: false,
    viewer: false
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/analytics.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxtjs/google-analytics',
    '@nuxt/typescript-build',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/pwa'
  ],

  googleAnalytics: {
    id: process.env.GOOGLE_ANALYTICS_ID
  },

  pwa: {
    manifest: {
      name: 'Elian Van Cutsem | Portfolio & Blog',
      short_name: 'Elian Van Cutsem',
      description: 'Elian Van Cutsem | Webdevelopment, Programmer and IT Generalist',
      start_url: '/blog',
      background_color: '#6ee7b7',
      scope: '/',
      theme_color: '#6ee7b7'
    },
    icon: {
      targetDir: 'icons',
      fileName: 'favicon.png'
    },
    meta: {
      author: 'Elian Van Cutsem',
      twitterCreator: 'HTMELian'
    }
  },

  googleFonts: {
    families: {
      Roboto: [400],
      Rubik: [400, 700]
    },
    display: 'swap'
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    '@nuxt/content',
    '@nuxtjs/google-fonts',
    '@nuxtjs/feed',
    '@nuxtjs/sitemap',
    '@nuxtjs/meta',
    '@nuxtjs/robots',
    '@nuxtjs/google-adsense',
    ['nuxt-canonical', { baseUrl: 'https://www.elian.codes' }],
    [
      'nuxt-fontawesome',
      {
        imports: [
          {
            set: '@fortawesome/free-solid-svg-icons',
            icons: ['fas'],
          },
          {
            set: '@fortawesome/free-brands-svg-icons',
            icons: ['fab'],
          },
        ],
      },
    ],
  ],

  feed: [
    {
      path: '/blog.xml',
      create,
      type: 'rss2',
      data: ['blog', 'xml'],
    },
    {
      path: '/feed.json',
      create,
      type: 'json1',
      data: ['blog', 'json'],
    },
    {
      path: '/feed.xml',
      create,
      type: 'atom1',
      data: ['blog', 'atom'],
    },
  ],

  sitemap: {
    hostname: 'https://www.elian.codes',
    trailingSlash: true,
    routes(){
      return fillRoutes(['blog', 'projects'])
    }
  },

  robots: {
    UserAgent: '*',
    Sitemap: 'https://www.elian.codes/sitemap.xml',
    Host: 'https://www.elian.codes/'

  },

  'google-adsense': {
    id: 'ca-pub-4472038053216899'
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      plugins: {
        'postcss-easy-import': { prefix: '_', extensions: ['.css', '.scss'] },
        'postcss-nested': {},
      },
    }
  },
}