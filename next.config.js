/** @type {import('next').NextConfig} */
const ContentSecurityPolicy = `
  default-src 'self' 'unsafe-inline';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com;
  font-src 'self';  
`;

const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'X-Frame-Options', value: 'DENY' },
					{
						key: 'X-DNS-Prefetch-Control',
						value: 'on'
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff'
					},
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin'
					},
					{
						key: 'Content-Security-Policy',
						value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
					}
					// { key: 'Access-Control-Allow-Credentials', value: 'true' },
					// 		{ key: 'Access-Control-Allow-Origin', value: '*' },
					// 		{
					// 			key: 'Access-Control-Allow-Methods',
					// 			value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
					// 		},
					// 		{
					// 			key: 'Access-Control-Allow-Headers',
					// 			value:
					// 				'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
					// 		}
				]
			}
		];
	}
};

module.exports = nextConfig;
