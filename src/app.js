jsbtc.asyncInit(window);

const locationDefault = 'dashboard';

let storage = { // eslint-disable-line prefer-const
	balance: 0,
	addresses: {},
};

const getBalanceSum = () => {
	let balanceSum = 0;
	for (const [ key, value ] of Object.entries(storage.addresses)) {
		balanceSum += value.balance;
	}
	storage.balance = balanceSum;
	$amountSum.innerHTML = humanAmountFormat(storage.balance);
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
		'#amount-sum',
		'#export-wallet-btn',
		'#mobile-menu',
		'#apple-mobile-menu',
	);

	getBalanceSum();

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

	getBalanceSum();

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

const humanAmountFormat = (amount) => {
	return `<span class="font-weight-bold">${(sb.toBitcoin(amount))}</span> BGL`;
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

const fetchQuery = (url, callback, fetchParams = null, errorFunc = null) => {
	fetch(url, fetchParams)
			.then((response) => { return response.json(); })
			.then((responseJson) => {
				// console.log(responseJson);
				if ( ! responseJson.error && ! responseJson.error_code) callback(responseJson);
				else {
					let errorObj = {};
					if (errorFunc) errorObj = errorFunc(responseJson);
					if ( ! errorObj.title) errorObj.title = `Error in response HTTP query to: <a target="_blank" href="${url}">${url}</a>`;
					if ( ! errorObj.message) errorObj.message = responseJson.error ? responseJson.error : responseJson.message;
					const swalParams = {
						showCloseButton: true,
						icon: 'error',
						title: errorObj.title,
						html: errorObj.message,
						customClass: {
							cancelButton: 'btn btn-danger btn-lg',
						},
						showConfirmButton: false,
						showCancelButton: true,
						cancelButtonText: 'Ok',
					};
					Swal.fire(swalParams);
				}
			})
			.catch((error) => {
				if (error == 'TypeError: Failed to fetch') error += '<br><br>Maybe it is CORS! Check please <a class="btn btn-sm btn-info" target="_blank" href="https://github.com/epexa/bitgesell-wallet-js-dist/blob/master/CORS.md#cors">manual here.</a>';
				Swal.fire({
					showCloseButton: true,
					icon: 'error',
					title: `Error on HTTP query to: <a target="_blank" href="${url}">${url}</a>`,
					html: `<p class="text-danger">${error}</p>`,
					customClass: {
						cancelButton: 'btn btn-danger btn-lg',
					},
					showConfirmButton: false,
					showCancelButton: true,
					cancelButtonText: 'Ok',
				});
			});
};

const getAddressInfo = (address, callback) => {
	const url = `https://api.bitaps.com/bgl/v1/blockchain/address/transactions/${address}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson.data);
	}, null, () => {
		return {
			title: `Error in get address info query: <a target="_blank" href="${url}">${url}</a>`,
		};
	});
};

const getAddressBalance = (address, callback) => {
	const url = `https://api.bitaps.com/bgl/v1/blockchain/address/state/${address}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson.data);
	}, null, () => {
		return {
			title: `Error in get address balance query: <a target="_blank" href="${url}">${url}</a>`,
		};
	});
};

window.navigateMobileMenu = () => {
	hide($dashboard, $myAddresses, $send, $setPassword, $welcome, $newAddress, $transactions, $createWallet);
	show($main, $mobileMenu);
};
