import Head from 'next/head';

interface SEOProps {
	title: string;
	description: string;
}

const SEO = ({ title, description }: SEOProps) => {
	return (
		<Head>
			<title>{title}</title>
			<meta name='viewport' content='width=device-width, initial-scale=1' />
			<meta charSet='utf-8' />
			<meta name={'description'} content={description} />
			<meta property='og:title' content={title} key={'ogtitle'} />
			<meta property='og:description' content={description} key={'ogdesc'} />
		</Head>
	);
};

export default SEO;
