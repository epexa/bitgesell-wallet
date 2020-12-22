const rgbToHex = (rgb) => {
	return `#${rgb.substr(4, rgb.indexOf(')') - 4).split(',').map((color) => String(`0${parseInt(color).toString(16)}`).slice(-2)).join('')}`;
};

const geckoCome = (noReload) => {
	const geckoDiv = document.querySelector('div.coingecko-coin-price-chart-widget');
	const bgColor = rgbToHex(window.getComputedStyle(document.body).backgroundColor);
	if ( ! noReload || geckoDiv.getAttribute('data-background-color') !== bgColor) {
		geckoDiv.setAttribute('data-background-color', bgColor);
		const hasGecko = document.querySelector('coingecko-coin-price-chart-widget');
		if (hasGecko) hasGecko.remove();
		const name = '.coingecko-coin-price-chart-widget';
		const allElements = document.querySelectorAll(name);
		allElements.forEach((element) => {
			const data = {};
			[].forEach.call(element.attributes, (attr) => {
				if (/^data-/.test(attr.name)) data[attr.name.substr(5)] = attr.value;
			});
			const el = document.createElement('coingecko-coin-price-chart-widget');
			Object.keys(data).forEach((name) => {
				el.setAttribute(name, data[name]);
			});
			element.appendChild(el);
		});
	}
};

window.navigateDashboard = () => {
	hide($welcome, $createWallet, $myAddresses, $newAddress, $send, $transactions, $restore, $login, $setPassword, $mobileMenu);
	show($main, $dashboard);
	getBalanceSum();
	geckoCome();
};
