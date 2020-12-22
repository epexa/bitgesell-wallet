jsbtc.asyncInit(window);

const locationDefault = 'dashboard';

let storage = { // eslint-disable-line prefer-const
	balance: 0,
	addresses: {},
};

const coinPrice = {
	price: 0,
	change: 0,
};

const getBalanceSum = () => {
	let balanceSum = 0;
	for (const [ key, value ] of Object.entries(storage.addresses)) {
		balanceSum += value.balance;
	}
	storage.balance = balanceSum;
	document.querySelectorAll('.amount-sum').forEach(($btn) => {
		$btn.innerHTML = humanAmountFormat(storage.balance);
	});
};

const encryptedMimeType = 'data:application/octet-stream;base64,';

let localPassword;

const saveToCryptoStorage = () => {
	aes4js.encrypt(localPassword, JSON.stringify(storage))
			.then((encrypted) => {
				localStorage.iv = JSON.stringify(encrypted.iv);
				localStorage.cryptoStorage = encrypted.encrypted.replace(encryptedMimeType, '');
			});
};

if (localStorage.cryptoStorage) {
	// start temp crutch for those who have used the wallet before
	if ( ! localStorage.iv) {
		storage = JSON.parse(localStorage.cryptoStorage);
		window.location.hash = 'set-password';
	}
	// end temp crutch for those who have used the wallet before
	else window.location.hash = 'login';
}
else window.location.hash = 'welcome';

document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#main',
		'#welcome',
		'#restore',
		'#create-wallet',
		'#set-password',
		'#login',
		'#dashboard',
		'#my-addresses',
		'#new-address',
		'#send',
		'#transactions',
		'#node-address-modal',
		'#node-address',
		'#export-wallet-btn',
		'#mobile-menu',
		'#apple-mobile-menu',
		'#theme',
		'#theme-modal',
		'#theme-val',
		'#prev-theme',
		'#next-theme',
	);

	document.onselectstart = new Function('return false;');
	// document.oncontextmenu = new Function('return false;');

	const $nodeAddressInput = $nodeAddress.querySelector('.form-control[name="node-address"]');

	if (localStorage.nodeAddress) $nodeAddressInput.value = localStorage.nodeAddress;
	else localStorage.nodeAddress = $nodeAddressInput.value;

	new BSN.Modal($nodeAddressModal);

	document.querySelectorAll('.node-address-btn').forEach(($btn) => {
		$btn.addEventListener('click', () => {
			$nodeAddressModal.Modal.show();
		});
	});

	$nodeAddress.addEventListener('submit', (e) => {
		e.preventDefault();
		localStorage.nodeAddress = $nodeAddressInput.value;
		window.location.reload();
	});

	document.querySelectorAll('.logout').forEach(($btn) => {
		$btn.addEventListener('click', () => { // (csrf protect)
			/* Swal.fire({
				showCloseButton: true,
				showConfirmButton: false,
				toast: true,
				position: 'top',
				timer: 3000,
				timerProgressBar: true,
				icon: 'success',
				title: 'You logout!',
			});
			window.location.hash = 'login'; */
			window.location.reload();
		});
	});

	document.querySelectorAll('.copy-val').forEach(($input) => {
		$input.addEventListener('click', () => {
			$input.select();
			copyToBuffer($input);
		});
	});

	if ( ! localStorage.convertPrice) localStorage.convertPrice = 0;

	const convertPrice = () => {
		document.querySelectorAll('.amount-sum').forEach(($btn) => {
			$btn.innerHTML = humanAmountFormat(storage.balance);
		});
		myAddressesTable.rows().every((index) => {
			const row = myAddressesTable.row(index);
			row.data(row.data());
			addEventButtons();
		});
	};

	getCoinInfo((coinInfo) => {
		coinPrice.price = coinInfo.bitgesell.usd;
		coinPrice.change = coinInfo.bitgesell.usd_24h_change.toFixed(1);
		if (needConvertPrice()) convertPrice();
	});

	document.querySelectorAll('.amount-sum').forEach(($btn) => {
		$btn.addEventListener('click', (e) => {
			e.preventDefault();
			if (needConvertPrice()) localStorage.convertPrice = 0;
			else localStorage.convertPrice = 1;
			convertPrice();
		});
	});

	new BSN.Modal($themeModal);

	$themeModal.addEventListener('shown.bs.modal', () => {
		$themeModal.querySelector('.form-control').focus();
	});

	document.querySelectorAll('.theme-btn').forEach(($btn) => {
		$btn.addEventListener('click', () => {
			$themeModal.Modal.show();
			if (window.location.hash.substring(1) === 'mobile-menu') window.location.hash = 'my-addresses';
		});
	});

	const addOptionInSelect = ($select, value) => {
		// $select.add(new Option(value[0].toUpperCase() + value.slice(1), value));
		const $option = document.createElement('option');
		$option.value = value;
		$option.text = value[0].toUpperCase() + value.slice(1);
		$select.appendChild($option);
	};
	for (const [ key, value ] of Object.entries(themes.light))
		addOptionInSelect($themeVal.querySelector('optgroup'), value);
	for (const [ key, value ] of Object.entries(themes.dark))
		addOptionInSelect($themeVal.querySelector('optgroup:nth-child(2)'), value);

	$themeVal.addEventListener('change', () => {
		$theme.setAttribute('href', `themes/${$themeVal.value}.min.css`);
		localStorage.theme = $themeVal.value;
		if ($themeVal.selectedIndex > 0) $prevTheme.removeAttribute('disabled');
		else $prevTheme.setAttribute('disabled', '');
		if ($themeVal.selectedIndex < $themeVal.length - 1) $nextTheme.removeAttribute('disabled');
		else $nextTheme.setAttribute('disabled', '');
		geckoCome(true);
	});

	$prevTheme.addEventListener('click', () => {
		if ($themeVal.selectedIndex > 0) {
			$themeVal.selectedIndex--;
			trigger($themeVal, 'change');
		}
	});
	$nextTheme.addEventListener('click', () => {
		if ($themeVal.selectedIndex < $themeVal.length - 1) {
			$themeVal.selectedIndex++;
			trigger($themeVal, 'change');
		}
	});

	if (localStorage.theme) {
		$themeVal.value = localStorage.theme;
		trigger($themeVal, 'change');
	}
	else $themeVal.value = 'flatly';

});

document.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('hashchange', () => {
		const hash = window.location.hash.substring(1);
		if (hash) {
			const params = hash.split('/');
			if (params[0]) {
				const screenName = camelCase(`navigate-${params[0]}`); // navigateDashboard();
				if (window[screenName]) window[screenName]();
				else window.location.hash = locationDefault;
				/* start highlight active link in apple mobile menu */
				$appleMobileMenu.querySelectorAll('a').forEach(($li) => {
					if (params[0] === $li.getAttribute('href').substring(1)) $li.classList.add('active');
					else $li.classList.remove('active');
				});
				/* end highlight active link in apple mobile menu */
			}
		}
	});
	window.dispatchEvent(new CustomEvent('hashchange'));
});

const needConvertPrice = () => {
	if (parseInt(localStorage.convertPrice) === 1) return true;
	else return false;
};

const humanAmountFormat = (amount) => {
	let humanAmount = sb.toBitcoin(amount);
	const needConvertPriceVal = needConvertPrice();
	if (needConvertPriceVal) humanAmount = (humanAmount * coinPrice.price).toFixed(2);
	return `<span class="font-weight-bold ${needConvertPriceVal ? `text-${coinPrice.change > 0 ? 'success' : 'danger'}" title="24 Hour Change: ${coinPrice.change}%` : ''}">${humanAmount}</span> ${needConvertPriceVal ? 'USD' : 'BGL'}`;
};

const copyToBuffer = ($select) => {
	$select.select();
	document.execCommand('copy');
	Swal.fire({
		showCloseButton: true,
		showConfirmButton: false,
		toast: true,
		position: 'top',
		timer: 3000,
		timerProgressBar: true,
		icon: 'success',
		title: 'Copied to clipboard!',
	});
	$select.blur();
};

const generateQRCode = (text, size) => {
	return new QRCode(text, {
		width: size,
		height: size,
		colorDark: '#000000',
		colorLight: '#ffffff',
		correctLevel: QRCode.CorrectLevel.H,
	});
};

const trigger = (element, event) => {
	const evt = document.createEvent('HTMLEvents');
	evt.initEvent(event, true, true);
	return ! element.dispatchEvent(evt);
};

const themes = {
	light: [
		'cerulean',
		'cosmo',
		'default',
		'flatly',
		'journal',
		'litera',
		'lumen',
		'lux',
		'materia',
		'minty',
		'pulse',
		'sandstone',
		'simplex',
		'sketchy',
		'spacelab',
		'united',
		'yeti',
	],
	dark: [
		'cyborg',
		'darkly',
		'slate',
		'solar',
		'superhero',
	],
};

window.navigateMobileMenu = () => {
	hide($dashboard, $myAddresses, $send, $setPassword, $welcome, $newAddress, $transactions, $createWallet);
	show($main, $mobileMenu);
};
