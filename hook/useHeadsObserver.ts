import { useEffect, useRef, useState } from 'react';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

export function useHeadsObserver(itemsToWatch: any) {
	const observer = useRef<IntersectionObserver>();
	const [activeId, setActiveId] = useState<string>('');

	useIsomorphicLayoutEffect(() => {
		const handleObserver = (entries: IntersectionObserverEntry[]) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					setActiveId(entry.target.id);
				}
			});
		};

		observer.current = new IntersectionObserver(handleObserver, {
			rootMargin: '20% 0px -35% 0px',
			threshold: [1]
		});
		const elements = document.querySelectorAll('[data-toc]');
		elements.forEach(element => observer.current?.observe(element));

		return () => observer.current?.disconnect();
	}, [itemsToWatch]);

	return { activeId };
}
