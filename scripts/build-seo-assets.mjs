import fs from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

const rootDir = path.resolve(new URL('..', import.meta.url).pathname)
const distDir = path.join(rootDir, 'dist')
const publicDir = path.join(rootDir, 'public')
const srcDir = path.join(rootDir, 'src')
const siteUrl = (process.env.VITE_SITE_URL || 'https://cschanhniem.github.io').replace(/\/$/, '')
const siteName = 'Nhập Lưu'
const siteDescription = 'Thư viện Phật pháp Nguyên thủy và nền tảng thực hành: thiền định, kinh điển Pāli, giới luật, cộng đồng Kalyāṇamitta, và lộ trình tu học có cấu trúc.'
const defaultOgImage = `${siteUrl}/og-default.png`
const defaultOgImageAlt = 'Nhập Lưu, thư viện và nền tảng thực hành Phật pháp Nguyên thủy'
const defaultOgImageType = 'image/png'
const defaultOgImageWidth = '1200'
const defaultOgImageHeight = '630'
const defaultRobots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
const noindexRobots = 'noindex,nofollow'
const generatedAt = new Date().toISOString()
const dhammaSuttasPath = '/phap-bao/kinh-tang'
const dhammaTeachingsPath = '/phap-bao/giao-phap'
const sitemapChunkSize = 4000

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeXml(value) {
  return escapeHtml(value)
}

function serializeJsonForScript(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('-->', '--\\u003e')
}

function normalizePath(routePath) {
  if (!routePath || routePath === '/') {
    return '/'
  }

  return routePath.endsWith('/') ? routePath.slice(0, -1) : routePath
}

function absoluteUrl(routePath) {
  const normalized = normalizePath(routePath)
  return normalized === '/' ? siteUrl : `${siteUrl}${normalized}`
}

function makeTitle(title) {
  return `${title} • ${siteName}`
}

async function loadTsModule(filePath) {
  const source = await fs.readFile(filePath, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText

  const sandbox = {
    module: { exports: {} },
    exports: {},
    require: () => ({}),
    __dirname: path.dirname(filePath),
    __filename: filePath,
  }

  vm.runInNewContext(compiled, sandbox, { filename: filePath })
  return {
    ...sandbox.module.exports,
    ...sandbox.exports,
  }
}

async function getLastModified(filePath) {
  const stats = await fs.stat(filePath)
  return stats.mtime.toISOString()
}

async function readTeachingRoutes() {
  const metadataPath = path.join(srcDir, 'data', 'teachings', 'metadata.ts')
  const module = await loadTsModule(metadataPath)
  const items = module.teachingMetadata ?? []
  const lastmod = await getLastModified(metadataPath)

  return items.map((item) => ({
    path: `/giao-phap/${item.id}`,
    title: item.title,
    description: item.summary,
    type: 'article',
    schemaType: 'Article',
    indexable: true,
    lastmod,
    breadcrumbs: [
      { name: 'Trang chủ', url: '/' },
      { name: 'Kho Tàng Pháp Bảo', url: dhammaTeachingsPath },
      { name: item.title, url: `/giao-phap/${item.id}` },
    ],
    author: item.author,
    authorType: 'Person',
  }))
}

async function readCuratedSuttaRoutes() {
  const suttasDir = path.join(srcDir, 'data', 'suttas')
  const files = (await fs.readdir(suttasDir))
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .sort()

  const routes = []

  for (const file of files) {
    const filePath = path.join(suttasDir, file)
    const module = await loadTsModule(filePath)
    const item = module.default
    if (!item?.id || !item?.title) {
      continue
    }

    routes.push({
      path: `/phap-bao/${item.id}`,
      title: `${item.code} · ${item.title}`,
      description: item.summary || `Bản đọc ${item.code} trong thư viện Pháp Bảo Nhập Lưu.`,
      type: 'article',
      schemaType: 'Article',
      indexable: true,
      lastmod: await getLastModified(filePath),
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Kho Tàng Pháp Bảo', url: dhammaSuttasPath },
        { name: item.title, url: `/phap-bao/${item.id}` },
      ],
      author: 'Nhập Lưu',
      authorType: 'Organization',
    })
  }

  return routes
}

async function readNikayaRoutes() {
  const nikayaPath = path.join(publicDir, 'data', 'suttacentral-json', 'nikaya_index.json')
  const raw = await fs.readFile(nikayaPath, 'utf8')
  const items = JSON.parse(raw)
  const lastmod = await getLastModified(nikayaPath)

  return items.map((item) => ({
    path: `/nikaya/${item.id}`,
    title: `${String(item.id).toUpperCase()} · ${item.title}`,
    description: item.blurb || `Kinh ${item.title} trong thư viện Nikāya của Nhập Lưu.`,
    type: 'article',
    schemaType: 'Article',
    indexable: true,
    lastmod,
    breadcrumbs: [
      { name: 'Trang chủ', url: '/' },
      { name: 'Kinh Điển Pāli', url: '/nikaya' },
      { name: item.title, url: `/nikaya/${item.id}` },
    ],
    author: 'SuttaCentral / Nhập Lưu',
    authorType: 'Organization',
  }))
}

function baseRoutes() {
  return [
    {
      path: '/',
      title: 'Học Phật Pháp Nguyên Thủy',
      description: siteDescription,
      type: 'website',
      schemaType: 'WebPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [{ name: 'Trang chủ', url: '/' }],
    },
    {
      path: '/phap-bao',
      title: 'Kho Tàng Pháp Bảo',
      description: 'Điểm điều hướng nội bộ chuyển đến các phân khu Kinh Tạng và Giáo Pháp.',
      type: 'website',
      schemaType: 'CollectionPage',
      indexable: false,
      robots: noindexRobots,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Kho Tàng Pháp Bảo', url: '/phap-bao' },
      ],
    },
    {
      path: dhammaSuttasPath,
      title: 'Kho Tàng Pháp Bảo · Kinh Tạng',
      description: 'Kho tàng kinh điển chọn lọc, các bài kinh cốt lõi, và bề mặt đọc tối ưu cho học và hành.',
      type: 'website',
      schemaType: 'CollectionPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Kho Tàng Pháp Bảo', url: dhammaSuttasPath },
      ],
    },
    {
      path: dhammaTeachingsPath,
      title: 'Kho Tàng Pháp Bảo · Giáo Pháp',
      description: 'Tủ sách giáo pháp thực hành, chú giải, bản đồ tu học, và tài liệu nền tảng cho hành giả.',
      type: 'website',
      schemaType: 'CollectionPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Kho Tàng Pháp Bảo', url: dhammaTeachingsPath },
      ],
    },
    {
      path: '/nikaya',
      title: 'Kinh Điển Pāli',
      description: 'Thư viện Nikāya với bản dịch gốc, bản cải tiến, và bề mặt đọc tối ưu cho học và hành.',
      type: 'website',
      schemaType: 'CollectionPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Kinh Điển Pāli', url: '/nikaya' },
      ],
    },
    {
      path: '/cong-dong',
      title: 'Cộng Đồng Thực Hành',
      description: 'Kết nối bạn tu, nhóm thực hành, sự kiện, mentorship, và các hình thức đồng hành bền vững.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Cộng đồng', url: '/cong-dong' },
      ],
    },
    {
      path: '/tim-sangha',
      title: 'Tìm Sangha',
      description: 'Tìm nhóm thực hành, đạo tràng, và điểm hẹn thiền gần bạn.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Tìm Sangha', url: '/tim-sangha' },
      ],
    },
    {
      path: '/quy-tac',
      title: 'Hiến Chương Thành Viên',
      description: 'Nguyên tắc cộng đồng, quy tắc ứng xử, và nền nếp bảo vệ môi trường tu học của Nhập Lưu.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Hiến chương thành viên', url: '/quy-tac' },
      ],
    },
    {
      path: '/lo-trinh-7-ngay',
      title: 'Lộ Trình 7 Ngày',
      description: 'Lộ trình khởi động 7 ngày để bước vào nhịp thực hành: thiền, giữ giới, đọc kinh, và ổn định nền tảng.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Lộ trình 7 ngày', url: '/lo-trinh-7-ngay' },
      ],
    },
    {
      path: '/sangha-circles',
      title: 'Sangha Circles',
      description: 'Nhóm thực hành nhỏ để giữ nhịp, phản tỉnh, và đồng hành lâu dài trên đường tu.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Sangha Circles', url: '/sangha-circles' },
      ],
    },
    {
      path: '/retreats',
      title: 'Retreat & Meetup',
      description: 'Thông tin khóa tu, sự kiện cộng đồng, và các dịp gặp gỡ để hành trì sâu hơn.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Retreat & Meetup', url: '/retreats' },
      ],
    },
    {
      path: '/translation-studio',
      title: 'Translation Studio',
      description: 'Không gian cộng tác dịch thuật và hiệu đính kinh điển, giáo pháp, và ghi chú học pháp.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Translation Studio', url: '/translation-studio' },
      ],
    },
    {
      path: '/mentorship',
      title: 'Kalyāṇamitta Mentorship',
      description: 'Kết nối mentor và mentee theo nhu cầu thực hành, giai đoạn tu học, và định hướng phù hợp.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: true,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Kalyāṇamitta Mentorship', url: '/mentorship' },
      ],
    },
    {
      path: '/auth',
      title: 'Đăng Nhập',
      description: 'Truy cập tài khoản Nhập Lưu để lưu tiến trình tu học và sử dụng các công cụ cá nhân.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: false,
      robots: noindexRobots,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Đăng nhập', url: '/auth' },
      ],
    },
    {
      path: '/onboarding',
      title: 'Chào Mừng',
      description: 'Trang khởi động và cam kết cộng đồng trước khi bước vào hệ thống tu học của Nhập Lưu.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: false,
      robots: noindexRobots,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Chào mừng', url: '/onboarding' },
      ],
    },
    {
      path: '/thien-dinh',
      title: 'Thiền Định',
      description: 'Không gian thiền cá nhân với bộ đếm, nhật ký buổi ngồi, và công cụ giữ giới.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: false,
      robots: noindexRobots,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Thiền định', url: '/thien-dinh' },
      ],
    },
    {
      path: '/thien-dinh/thu-gian',
      title: 'Thư Giãn Trong Tỉnh Thức',
      description: 'Hướng dẫn thư giãn sâu trong khi vẫn giữ tỉnh thức, dùng như tài nguyên nội bộ cho hành giả.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: false,
      robots: noindexRobots,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Thiền định', url: '/thien-dinh' },
        { name: 'Thư giãn trong tỉnh thức', url: '/thien-dinh/thu-gian' },
      ],
    },
    {
      path: '/danh-dau',
      title: 'Mục Đã Đánh Dấu',
      description: 'Thư viện cá nhân gồm các bài kinh và tài liệu đã lưu.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: false,
      robots: noindexRobots,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Mục đã đánh dấu', url: '/danh-dau' },
      ],
    },
    {
      path: '/nhat-ky',
      title: 'Nhật Ký Tuệ Giác',
      description: 'Không gian ghi lại tuệ giác, quán chiếu, và mốc tiến trình riêng tư của người hành trì.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: false,
      robots: noindexRobots,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Nhật ký tuệ giác', url: '/nhat-ky' },
      ],
    },
    {
      path: '/chuong-trinh',
      title: 'Chương Trình 90 Ngày',
      description: 'Lộ trình 90 ngày có cấu trúc dành cho hành giả đang thực sự muốn bước sâu vào đường tu.',
      type: 'website',
      schemaType: 'WebPage',
      indexable: false,
      robots: noindexRobots,
      lastmod: generatedAt,
      breadcrumbs: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Chương trình 90 ngày', url: '/chuong-trinh' },
      ],
    },
  ]
}

function buildBreadcrumbJsonLd(route) {
  const items = route.breadcrumbs?.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.url),
  }))

  if (!items?.length) {
    return null
  }

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

function buildPageJsonLd(route) {
  const pageUrl = absoluteUrl(route.path)

  if (route.schemaType === 'CollectionPage' || route.schemaType === 'WebPage') {
    return {
      '@type': route.schemaType,
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: route.title,
      description: route.description,
      inLanguage: 'vi',
      isPartOf: { '@id': `${siteUrl}/#website` },
    }
  }

  return {
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: route.title,
    description: route.description,
    url: pageUrl,
    inLanguage: 'vi',
    mainEntityOfPage: pageUrl,
    image: defaultOgImage,
    publisher: { '@id': `${siteUrl}/#organization` },
    author: route.author
      ? {
          '@type': route.authorType || 'Person',
          name: route.author,
        }
      : {
          '@type': 'Organization',
          name: siteName,
        },
    dateModified: route.lastmod,
  }
}

function buildSiteGraph(route) {
  const pageUrl = absoluteUrl(route.path)
  const pageSchema = buildPageJsonLd(route)
  const breadcrumbSchema = buildBreadcrumbJsonLd(route)

  return [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      inLanguage: 'vi',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    pageSchema,
    breadcrumbSchema,
  ].filter(Boolean)
}

function buildHeadTags(route) {
  const title = escapeHtml(makeTitle(route.title))
  const description = escapeHtml(route.description)
  const canonical = escapeHtml(absoluteUrl(route.path))
  const robots = escapeHtml(route.robots || (route.indexable ? defaultRobots : noindexRobots))
  const ogType = escapeHtml(route.type || 'website')
  const jsonLd = serializeJsonForScript({
    '@context': 'https://schema.org',
    '@graph': buildSiteGraph(route),
  })

  return `
  <meta name="description" content="${description}" />
  <meta name="robots" content="${robots}" />
  <meta name="googlebot" content="${robots}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${escapeHtml(route.title)}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="${escapeHtml(siteName)}" />
  <meta property="og:locale" content="vi_VN" />
  <meta property="og:image" content="${defaultOgImage}" />
  <meta property="og:image:alt" content="${escapeHtml(defaultOgImageAlt)}" />
  <meta property="og:image:type" content="${defaultOgImageType}" />
  <meta property="og:image:width" content="${defaultOgImageWidth}" />
  <meta property="og:image:height" content="${defaultOgImageHeight}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(route.title)}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${defaultOgImage}" />
  <meta name="twitter:image:alt" content="${escapeHtml(defaultOgImageAlt)}" />
  ${route.author ? `<meta name="author" content="${escapeHtml(route.author)}" />` : ''}
  <script type="application/ld+json" data-jsonld="page">${jsonLd}</script>
  `.trim() + `\n  <title>${title}</title>`
}

function buildNoscript(route) {
  return `
  <noscript>
    <section style="font-family: Georgia, serif; max-width: 860px; margin: 3rem auto; padding: 0 1rem; color: #2d2d2d;">
      <h1 style="font-size: 2rem; line-height: 1.2; margin-bottom: 0.75rem;">${escapeHtml(route.title)}</h1>
      <p style="font-size: 1.05rem; line-height: 1.7; margin: 0 0 1rem;">${escapeHtml(route.description)}</p>
      <p style="font-size: 0.95rem; line-height: 1.7;">Trang này hoạt động tốt nhất khi bật JavaScript. Bạn vẫn có thể quay về <a href="${siteUrl}" style="color: #8c6418;">trang chủ Nhập Lưu</a>.</p>
    </section>
  </noscript>
  `.trim()
}

function injectSeo(template, route) {
  const withoutTitle = template.replace(/<title>[\s\S]*?<\/title>/, '')
  return withoutTitle
    .replace('<!-- SEO_HEAD -->', buildHeadTags(route))
    .replace('<!-- SEO_NOSCRIPT -->', buildNoscript(route))
}

async function ensureRouteHtml(template, route) {
  const routePath = normalizePath(route.path)

  if (routePath === '/') {
    await fs.writeFile(path.join(distDir, 'index.html'), injectSeo(template, route))
    return
  }

  const targetDir = path.join(distDir, routePath.slice(1))
  await fs.mkdir(targetDir, { recursive: true })
  await fs.writeFile(path.join(targetDir, 'index.html'), injectSeo(template, route))
}

function chunkItems(items, size) {
  const chunks = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

function getLatestLastmod(routes) {
  return routes.reduce((latest, route) => {
    const candidate = route.lastmod || generatedAt
    return candidate > latest ? candidate : latest
  }, '1970-01-01T00:00:00.000Z')
}

async function writeUrlSetSitemap(fileName, routes) {
  const urls = routes
    .map((route) => {
      const lastmod = escapeXml(route.lastmod || generatedAt)
      return `  <url><loc>${escapeXml(absoluteUrl(route.path))}</loc><lastmod>${lastmod}</lastmod></url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  await fs.writeFile(path.join(distDir, fileName), xml)
}

async function writeSitemaps(groups) {
  const sitemapEntries = []

  for (const group of groups) {
    const indexableRoutes = group.routes.filter((route) => route.indexable)
    if (!indexableRoutes.length) {
      continue
    }

    const chunks = chunkItems(indexableRoutes, sitemapChunkSize)
    for (let index = 0; index < chunks.length; index += 1) {
      const routes = chunks[index]
      const suffix = chunks.length > 1 ? `-${String(index + 1).padStart(2, '0')}` : ''
      const fileName = `sitemap-${group.slug}${suffix}.xml`
      await writeUrlSetSitemap(fileName, routes)
      sitemapEntries.push({
        fileName,
        lastmod: getLatestLastmod(routes),
      })
    }
  }

  const body = sitemapEntries
    .map(
      (entry) =>
        `  <sitemap><loc>${escapeXml(`${siteUrl}/${entry.fileName}`)}</loc><lastmod>${escapeXml(entry.lastmod)}</lastmod></sitemap>`
    )
    .join('\n')

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), indexXml)

  return sitemapEntries
}

async function writeRobots() {
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  await fs.writeFile(path.join(distDir, 'robots.txt'), robots)
}

async function main() {
  const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8')
  const groups = [
    {
      slug: 'pages',
      routes: baseRoutes(),
    },
    {
      slug: 'giao-phap',
      routes: await readTeachingRoutes(),
    },
    {
      slug: 'phap-bao',
      routes: await readCuratedSuttaRoutes(),
    },
    {
      slug: 'nikaya',
      routes: await readNikayaRoutes(),
    },
  ]
  const routes = groups.flatMap((group) => group.routes)

  for (const route of routes) {
    await ensureRouteHtml(template, route)
  }

  const sitemapEntries = await writeSitemaps(groups)
  await writeRobots()

  console.log(`SEO assets generated for ${routes.length} routes across ${sitemapEntries.length} sitemap files`)
}

main().catch((error) => {
  console.error('Failed to generate SEO assets:', error)
  process.exitCode = 1
})
