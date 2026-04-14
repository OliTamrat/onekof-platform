import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/onboarding', '/select-organization'],
      },
    ],
    sitemap: 'https://onekof.com/sitemap.xml',
  };
}
