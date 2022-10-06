import { ScrollArea, Tabs } from '@mantine/core';
import { IconTent } from '@tabler/icons';
import React, { useEffect, useState } from 'react';
import { scrollIntoView } from 'seamless-scroll-polyfill';

interface Tabs {
	id: string;
	label: string;
	level: number;
}

const MenuCategoriesTabs = ({ items: itemsToWatch }: { items: any }) => {
	const [headings, setHeadings] = useState<Map<string, Tabs>>(new Map());

	useEffect(() => {
		const elements = [...document.querySelectorAll('[data-toc]')].map(
			(el, index) =>
				[
					el.id,
					{
						id: el.id,
						label: (el as HTMLElement).attributes.getNamedItem('data-toc-title')?.value,
						level: +(el.attributes.getNamedItem('data-toc')?.value ?? 1)
					}
				] as [string, Tabs]
		);
		setHeadings(new Map(elements));
	}, [itemsToWatch]);

	const items = [...headings.values()]
		.filter(e => e.level === 1)
		.map((item, index) => (
			<Tabs.Tab
				key={item.label}
				value={item.label}
				onClick={event => {
					event.preventDefault();
					scrollIntoView(document.querySelector(`#${item.id}`) as HTMLElement, {
						behavior: 'smooth'
					});
				}}
			>
				{item.label}
			</Tabs.Tab>
		));

	return (
		<Tabs>
			<ScrollArea>
				<Tabs.List grow>{items}</Tabs.List>
			</ScrollArea>
		</Tabs>
	);
};

export default MenuCategoriesTabs;
