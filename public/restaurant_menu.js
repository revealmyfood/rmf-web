document.onreadystatechange = () => {
	if (document.readyState === 'interactive') {
		const container = document.getElementById('restaurant-menu');
		const scriptSrc = document.querySelector('script[src*="restaurant_menu.js"]').src;
		if (container) {
			const key = container.dataset.u;
			const name = container.dataset.name;
			if (key && name) {
				const baseUrl = scriptSrc.replace('/restaurant_menu.js', '');
				// const baseUrl = 'https://reveal-my-food.vercel.app';
				fetch(`${baseUrl}/restaurants/${name}?u=${key}`)
					.then(res => res.text())
					.then(html => {
						const doc = new DOMParser().parseFromString(html, 'text/html');
						doc.head.innerHTML = doc.head.innerHTML.replaceAll(
							/"\//g,
							'"' + baseUrl + '/'
						);
						document.head.append(...doc.head.children);
					});
			}
		}
	}
};
