export default defineSitemapEventHandler(() => {
  return [
    {
      loc: '/',
      lastmod: new Date(),
      changefreq: 'weekly',
      priority: 1.0,
    },
    {
      loc: '/examples',
      lastmod: new Date(),
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: '/examples/preload',
      lastmod: new Date(),
      changefreq: 'monthly',
      priority: 0.6,
    },
  ];
});
