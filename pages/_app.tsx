import { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import Layout from '../components/layout';
import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function App(props: AppProps) {
	const { Component, pageProps } = props;
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				cacheTime: 4000,
				suspense: true
			}
		}
	});

	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
				theme={{
					colorScheme: 'light',
					primaryColor: 'green',
					primaryShade: 8
				}}
			>
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</MantineProvider>
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
}
