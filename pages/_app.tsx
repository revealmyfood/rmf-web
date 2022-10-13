import { AppProps } from 'next/app';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import Layout from '../components/layout';
import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RecoilRoot } from 'recoil';
import useFirebaseAuth from '../hook/useFirebaseAuth';
import { ReactNode, useState } from 'react';

const Auth = ({ children }: { children: ReactNode }) => {
	useFirebaseAuth();
	return <>{children}</>;
};

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
	const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
	const toggleColorScheme = (value?: ColorScheme) => {
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
	};

	return (
		<QueryClientProvider client={queryClient}>
			<ColorSchemeProvider
				colorScheme={colorScheme}
				toggleColorScheme={toggleColorScheme}
			>
				<MantineProvider
					withGlobalStyles
					withNormalizeCSS
					theme={{
						colorScheme,
						primaryColor: 'green',
						primaryShade: 8
					}}
				>
					<RecoilRoot>
						<Layout>
							<Auth>
								<Component {...pageProps} />
							</Auth>
						</Layout>
					</RecoilRoot>
				</MantineProvider>
			</ColorSchemeProvider>
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
}
