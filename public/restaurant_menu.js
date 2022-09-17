document.onreadystatechange = () => {
	if (document.readyState === 'interactive') {
		const container = document.getElementById('restaurant-menu');
		const scriptSrc = document.querySelector('script[src*="restaurant_menu.js"]').src;
		if (container) {
			const key = container.dataset.u;
			const name = container.dataset.name;
			if (key && name) {
				const baseUrl = scriptSrc.replace('/restaurant_menu.js', '');
				fetch(`${baseUrl}/restaurants/${name}?u=${key}`)
					.then(res => res.text())
					.then(html => {
						container.innerHTML = `<object
             width='100%'
             height='100%'
             data="data:text/html,${encodeURIComponent(html)}"></object>`;
					});
			}
		}
	}
};