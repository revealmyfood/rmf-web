import { useEffect, useRef, useState } from 'react';
import { createStyles, Box, Text, Group, Tooltip, Tabs, ScrollArea } from '@mantine/core';
import { IconMenu2 } from '@tabler/icons';
import { useHeadsObserver } from '../hook/useHeadsObserver';
import { scrollIntoView } from 'seamless-scroll-polyfill';

const LINK_HEIGHT = 38;
const INDICATOR_SIZE = 10;
const INDICATOR_OFFSET = (LINK_HEIGHT - INDICATOR_SIZE) / 2;

const useStyles = createStyles(theme => ({
	link: {
		...theme.fn.focusStyles(),
		display: 'block',
		textDecoration: 'none',
		color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
		lineHeight: `${LINK_HEIGHT}px`,
		fontSize: theme.fontSizes.sm,
		height: LINK_HEIGHT,
		borderTopRightRadius: theme.radius.sm,
		borderBottomRightRadius: theme.radius.sm,
		borderLeft: `2px solid ${
			theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
		}`,

		'&:hover': {
			backgroundColor:
				theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
		}
	},

	linkActive: {
		fontWeight: 500,
		color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 3 : 7]
	},

	links: {
		position: 'relative'
	},

	indicator: {
		transition: 'transform 150ms ease',
		border: `2px solid ${
			theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 3 : 7]
		}`,
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
		height: INDICATOR_SIZE,
		width: INDICATOR_SIZE,
		borderRadius: INDICATOR_SIZE,
		position: 'absolute',
		left: -INDICATOR_SIZE / 2 + 1
	},
	nav: {
		padding: 4,
		alignSelf: 'flex-start',
		position: 'sticky',
		top: 10
	}
}));

interface TableOfContentsFloatingProps {
	links: { label: string; link: string; order: number }[];
}

interface Link {
	id: string;
	label: string;
	level: number;
	index: number;
}

const TableOfContents = ({ items: itemsToWatch }: { items: any }) => {
	const [headings, setHeadings] = useState<Map<string, Link>>(new Map());
	const { activeId } = useHeadsObserver(itemsToWatch);
	const { classes, cx } = useStyles();

	useEffect(() => {
		const elements = [...document.querySelectorAll('[data-toc]')].map(
			(el, index) =>
				[
					el.id,
					{
						id: el.id,
						label: (el as HTMLElement).attributes.getNamedItem('data-toc-title')?.value,
						level: +(el.attributes.getNamedItem('data-toc')?.value ?? 1),
						index: index
					}
				] as [string, Link]
		);
		setHeadings(new Map(elements));
	}, [itemsToWatch]);

	const items = [...headings.values()].map((item, index) => (
		<Tooltip key={index} label={item.label} withinPortal openDelay={1000}>
			<Text key={item.label} lineClamp={1}>
				<Box<'a'>
					component='a'
					href={item.label}
					onClick={event => {
						event.preventDefault();
						scrollIntoView(document.querySelector(`#${item.id}`) as HTMLElement, {
							behavior: 'smooth'
						});
					}}
					className={cx(classes.link, {
						[classes.linkActive]: headings.get(activeId)?.index === index
					})}
					sx={theme => ({ paddingLeft: (item.level ?? 1) * theme.spacing.lg })}
				>
					{item.label}
				</Box>
			</Text>
		</Tooltip>
	));

	return (
		<nav className={classes.nav}>
			<Group mb='md'>
				<IconMenu2 size={18} stroke={1.5} />
				<Text>Dishes</Text>
			</Group>
			<div className={classes.links}>
				<div
					className={classes.indicator}
					style={{
						transform: `translateY(${
							(headings.get(activeId)?.index ?? 0) * LINK_HEIGHT + INDICATOR_OFFSET
						}px)`
					}}
				/>
				{items}
			</div>
		</nav>
	);
};

export default TableOfContents;
