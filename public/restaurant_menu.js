document.onreadystatechange = () => {
	if (document.readyState === 'interactive') {
		const container = document.getElementById('restaurant-menu');
		const scriptSrc = document.querySelector('script[src*="restaurant_menu.js"]').src;
		if (container) {
			const key = container.dataset.u;
			const name = container.dataset.name;
			if (key && name) {
				const baseUrl = scriptSrc.replace('/restaurant_menu.js', '');
				// container.innerHTML = `<object data="${baseUrl}/restaurants/${name}?u=${key}"></object>`;
				// fetch(`${baseUrl}/restaurants/${name}?u=${key}`)
				fetch('https://reveal-my-food.vercel.app/restaurants/AREPAS_&_CACHAPAS')
					.then(res => res.text())
					.then(html => {
						container.innerHTML = `<object data="data:text/html,${html}"></object>`;
					});
			}
		}
	}
};
