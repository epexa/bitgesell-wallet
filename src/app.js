import aes4js from 'aes4js';
import sb from 'satoshi-bitcoin';
import * as bootstrap from 'bootstrap';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';

import { isTwa, setItem, getItem } from './twa';
import { getCoinInfo } from './api';
import { Swal, camelCase, autoInitHtmlElements, hide, show } from './utils';
import packageJson from '../package.json';
import './custom.css';

const jsbgl = {};
window.jsbtc.asyncInit(jsbgl);

const version = packageJson.version;
const locationDefault = 'dashboard';

window.storage = {
	balance: 0,
	addresses: {},
};
window.tempStorage = {};

const coinPrice = {
	price: 0,
	change: 0,
};

const getBalanceSum = () => {
	let balanceSum = 0;
	for (const [ , value ] of Object.entries(window.storage.addresses)) {
		balanceSum += value.balance;
	}
	window.storage.balance = balanceSum;
	document.querySelectorAll('.amount-sum').forEach(($btn) => {
		$btn.innerHTML = humanAmountFormat(window.storage.balance);
	});
};

const encryptedMimeType = 'data:application/octet-stream;base64,';

window.localPassword = null;

const saveToCryptoStorage = () => {
	aes4js.encrypt(window.localPassword, JSON.stringify(window.storage))
			.then((encrypted) => {
				// need to save together in one item, otherwise there are problems with cloud storage due to desynchronization
				setItem('cryptoStorage', JSON.stringify({
					encrypted: encrypted.encrypted.replace(encryptedMimeType, ''),
					iv: encrypted.iv,
				}));
			});
};

window.qrCodeModal = null;

document.addEventListener('DOMContentLoaded', () => {

	autoInitHtmlElements();

	document.onselectstart = new Function('return false;');
	// document.oncontextmenu = new Function('return false;');

	window.qrCodeModal = new bootstrap.Modal('#qr-code-modal');

	const $nodeAddressInput = $dom.nodeAddress.querySelector('.form-control[name="node-address"]');

	if (window.localStorage.nodeAddress) $nodeAddressInput.value = window.localStorage.nodeAddress;
	else window.localStorage.nodeAddress = $nodeAddressInput.value;

	const nodeAddressModal = new bootstrap.Modal($dom.nodeAddressModal);

	document.querySelectorAll('.node-address-btn').forEach(($btn) => {
		$btn.addEventListener('click', () => {
			nodeAddressModal.show();
		});
	});

	$dom.nodeAddress.addEventListener('submit', (e) => {
		e.preventDefault();
		window.localStorage.nodeAddress = $nodeAddressInput.value;
		window.location.reload();
	});

	document.querySelectorAll('.logout').forEach(($btn) => {
		if (isTwa) {
			if ($btn.closest('li')) $btn = $btn.closest('li');
			if ($btn.previousElementSibling) $btn.previousElementSibling.remove();
			$btn.remove();
			return;
		}

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

	if ( ! window.localStorage.convertPrice) window.localStorage.convertPrice = 0;

	const convertPrice = () => {
		document.querySelectorAll('.amount-sum').forEach(($btn) => {
			$btn.innerHTML = humanAmountFormat(window.storage.balance);
		});
		window.myAddressesTable.rows().every((index) => {
			const row = window.myAddressesTable.row(index);
			row.data(row.data());
			window.addEventButtons();
		});
	};

	getCoinInfo((coinInfo) => {
		coinPrice.price = coinInfo.data.price;
		coinPrice.change = coinInfo.data.percentChange24h;
		if (needConvertPrice()) convertPrice();
	});

	document.querySelectorAll('.amount-sum').forEach(($btn) => {
		$btn.addEventListener('click', (e) => {
			e.preventDefault();
			if (needConvertPrice()) window.localStorage.convertPrice = 0;
			else window.localStorage.convertPrice = 1;
			convertPrice();
		});
	});

	const themeModal = new bootstrap.Modal($dom.themeModal);

	$dom.themeModal.addEventListener('shown.bs.modal', () => {
		$dom.themeModal.querySelector('.form-control').focus();
	});

	document.querySelectorAll('.theme-btn').forEach(($btn) => {
		$btn.addEventListener('click', () => {
			themeModal.show();
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
	for (const [ , value ] of Object.entries(themes.light))
		addOptionInSelect($dom.themeVal.querySelector('optgroup'), value);
	for (const [ , value ] of Object.entries(themes.dark))
		addOptionInSelect($dom.themeVal.querySelector('optgroup:nth-child(2)'), value);

	$dom.themeVal.addEventListener('change', () => {
		$dom.theme.setAttribute('href', `/themes/${$dom.themeVal.value}.min.css`);
		window.localStorage.theme = $dom.themeVal.value;
		if ($dom.themeVal.selectedIndex > 0) $dom.prevTheme.removeAttribute('disabled');
		else $dom.prevTheme.setAttribute('disabled', '');
		if ($dom.themeVal.selectedIndex < $dom.themeVal.length - 1) $dom.nextTheme.removeAttribute('disabled');
		else $dom.nextTheme.setAttribute('disabled', '');
	});

	$dom.prevTheme.addEventListener('click', () => {
		if ($dom.themeVal.selectedIndex > 0) {
			$dom.themeVal.selectedIndex--;
			trigger($dom.themeVal, 'change');
		}
	});
	$dom.nextTheme.addEventListener('click', () => {
		if ($dom.themeVal.selectedIndex < $dom.themeVal.length - 1) {
			$dom.themeVal.selectedIndex++;
			trigger($dom.themeVal, 'change');
		}
	});

	if (window.localStorage.theme) {
		if ([ 'cerulean', 'default', 'journal', 'lux', 'quartz', 'materia', 'minty', 'morph', 'pulse', 'sandstone', 'slate', 'simplex', 'spacelab', 'solar', 'superhero', 'united' ].indexOf(window.localStorage.theme) !== -1) window.localStorage.theme = 'lumen';
		$dom.themeVal.value = window.localStorage.theme;
		trigger($dom.themeVal, 'change');
	}
	else $dom.themeVal.value = 'lumen';

	const currentYear = new Date().getFullYear();

	document.querySelectorAll('.current-year').forEach(($currentYear) => {
		$currentYear.innerText = currentYear;
	});

	document.querySelectorAll('.version').forEach(($version) => {
		$version.innerText = version;
	});

});

document.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('hashchange', () => {
		const hash = window.location.hash.substring(1);
		if ( ! hash) return;
		const params = hash.split('/');
		if ( ! params[0]) return;
		const screenName = camelCase(`navigate-${params[0]}`); // navigateDashboard();
		if (window[screenName]) window[screenName]();
		else window.location.hash = locationDefault;
		/* start highlight active link in apple mobile menu */
		$dom.appleMobileMenu.querySelectorAll('a').forEach(($li) => {
			if (params[0] === $li.getAttribute('href').substring(1)) $li.classList.add('selected');
			else $li.classList.remove('selected');
		});
		/* end highlight active link in apple mobile menu */
	});
	window.dispatchEvent(new window.CustomEvent('hashchange'));
});

const needConvertPrice = () => {
	if (parseInt(window.localStorage.convertPrice, 10) === 1) return true;
	else return false;
};

const humanAmountFormat = (amount) => {
	let humanAmount = sb.toBitcoin(amount);
	const needConvertPriceVal = needConvertPrice();
	if (needConvertPriceVal) humanAmount = (humanAmount * coinPrice.price).toFixed(2);
	return `<span class="fw-bold ${needConvertPriceVal ? `text-${coinPrice.change > 0 ? 'success' : 'danger'}" title="24 Hour Change: ${coinPrice.change}%` : ''}">${humanAmount}</span> ${needConvertPriceVal ? 'USD' : 'BGL'}`;
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
	return new window.QRCode(text, {
		width: size,
		height: size,
		colorDark: '#000000',
		colorLight: '#ffffff',
		correctLevel: window.QRCode.CorrectLevel.H,
	});
};

const trigger = (element, event) => {
	const evt = document.createEvent('HTMLEvents');
	evt.initEvent(event, true, true);
	return ! element.dispatchEvent(evt);
};

const themes = {
	light: [
		'cosmo',
		'flatly',
		'litera',
		'lumen',
		'sketchy',
		'yeti',
		'zephyr',
	],
	dark: [
		'cyborg',
		'darkly',
		'vapor',
	],
};

const replacesInnerText = (...agrs) => {
	agrs.slice(1).forEach(($elem) => $elem.innerText = $elem.innerText.replace(agrs[0], ''));
};

const downloadHrefValue = (value) => `data:text/plain;charset=utf-8,${encodeURIComponent(value)}`;

const hideDataTablePagingIfOnlyOnePage = (oSettings) => {
	if ( ! oSettings) return;

	const $paging = oSettings.nTableWrapper.querySelector('.dt-paging').closest('.row');

	if (oSettings._iDisplayLength >= oSettings.fnRecordsDisplay()) hide($paging);
	else show($paging);
};

window.navigateMobileMenu = () => {
	hide($dom.dashboard, $dom.myAddresses, $dom.send, $dom.setPassword, $dom.welcome, $dom.newAddress, $dom.transactions, $dom.createWallet, $dom.exportWallet);
	show($dom.main, $dom.mobileMenu);
};

(async () => {
	const cryptoStorage = await getItem('cryptoStorage');

	if ( ! cryptoStorage) {
		window.location.hash = 'welcome';
		return;
	}

	try {
		window.tempStorage = JSON.parse(cryptoStorage);

		/* start encrypt data who use unencrypted */
		if ( ! window.tempStorage.iv) {
			window.storage = window.tempStorage;

			window.location.hash = 'set-password';
			return;
		}
		/* end encrypt data who use unencrypted */

		/* start restructure data who use telegram 0.9.7 */
		if ( ! window.tempStorage.encrypted) window.tempStorage.encrypted = window.tempStorage.cryptoStorage;
		/* end restructure data who use telegram 0.9.7 */
	}
	catch {
		/* start restructure data who use 0.9.7 */
		window.tempStorage = { encrypted: cryptoStorage };

		const iv = await getItem('iv');

		window.tempStorage.iv = JSON.parse(iv);
		/* end restructure data who use 0.9.7 */
	}

	window.location.hash = 'login';

})();

export {
	locationDefault,
	getBalanceSum,
	generateQRCode,
	hideDataTablePagingIfOnlyOnePage,
	saveToCryptoStorage,
	encryptedMimeType,
	humanAmountFormat,
	copyToBuffer,
	jsbgl,
	replacesInnerText,
	downloadHrefValue,
	coinPrice,
};
