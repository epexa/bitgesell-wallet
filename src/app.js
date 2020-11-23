jsbtc.asyncInit(window);

const locationDefault = 'dashboard';

const urlSecure = window.location.protocol === 'https:' ? 's' : '';

let storage = {
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

const saveToCryptoStorage = () => {
	// need AES encrypt
	localStorage.cryptoStorage = JSON.stringify(storage);
};

if (localStorage.cryptoStorage) {
	// need AES descrypt
	storage = JSON.parse(localStorage.cryptoStorage);
	if (storage.entropy) window.location.hash = locationDefault;
	else window.location.hash = 'welcome';
}
else {
	saveToCryptoStorage();
	window.location.hash = 'welcome';
}

document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#main',
		'#welcome',
		'#restore',
		'#create-wallet',
		'#set-password',
		'#login',
		'#user-email',
		'#dashboard',
		'#my-addresses',
		'#new-address',
		'#send',
		'#transactions',
		'#node-address-modal',
		'#node-address',
		'#node-address-modal-btn',
		'#amount-sum',
		'#export-wallet-btn',
		'#logout-btn',
	);

	getBalanceSum();

	const $nodeAddressInput = $nodeAddress.querySelector('.form-control[name="node-address"]');

	if (localStorage.nodeAddress) $nodeAddressInput.value = localStorage.nodeAddress;
	else localStorage.nodeAddress = $nodeAddressInput.value;

	new BSN.Modal($nodeAddressModal);

	$nodeAddressModalBtn.addEventListener('click', () => {
		$nodeAddressModal.Modal.show();
	});

	$nodeAddress.addEventListener('submit', (e) => {
		e.preventDefault();
		localStorage.nodeAddress = $nodeAddressInput.value;
		window.location.reload();
	});

	$logoutBtn.addEventListener('click', () => {
		Swal.fire({
			showCloseButton: true,
			showConfirmButton: false,
			toast: true,
			position: 'top',
			timer: 3000,
			timerProgressBar: true,
			icon: 'success',
			title: 'You logout!',
		});
		window.location.hash = 'login';
	});

	document.querySelectorAll('.copy-val').forEach(($input) => {
		$input.addEventListener('click', () => {
			$input.select();
			copyToBuffer($input, false);
		});
	});
	document.querySelectorAll('.copy-btn').forEach(($btn) => {
		$btn.addEventListener('click', () => {
			const $input = $btn.parentElement.querySelector('.copy-val');
			copyToBuffer($input);
		});
	});

	getBalanceSum();

});

window.addEventListener('hashchange', () => {
	const hash = window.location.hash.substring(1);
	if (hash) {
		const params = hash.split('/');
		if (params[0]) {
			const screenName = camelCase(`navigate-${params[0]}`); // navigateDashboard();
			if (window[screenName]) window[screenName]();
			else window.location.hash = locationDefault;
		}
	}
});
document.addEventListener('DOMContentLoaded', () => {
	window.dispatchEvent(new CustomEvent('hashchange'));
});

const humanAmountFormat = (amount) => {
	return `<span class="font-weight-bold">${(sb.toBitcoin(amount))}</span> BGL`;
};

const copyToBuffer = ($select, deselect = true) => {
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
	if (deselect) setTimeout(() => window.getSelection().removeAllRanges(), 3000);
};

const fetchQuery = (url, callback, fetchParams = null, errorFunc = null, swalToast = false, notShowError = null) => {
	fetch(url, fetchParams)
			.then((response) => { return response.json(); })
			.then((responseJson) => {
				// console.log(responseJson);
				if ( ! responseJson.error) callback(responseJson);
				else if ( ! notShowError || notShowError !== responseJson.error) {
					let errorObj = {};
					if (errorFunc) errorObj = errorFunc(responseJson);
					if ( ! errorObj.title) errorObj.title = `Error in response HTTP query to: <a target="_blank" href="${url}">${url}</a>`;
					if ( ! errorObj.message) errorObj.message = responseJson.error;
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
					if (swalToast) {
						swalParams.toast = true;
						swalParams.position = 'top-end';
						swalParams.timer = 5000;
						swalParams.timerProgressBar = true;
						swalParams.showCancelButton = false;
					}
					Swal.fire(swalParams);
				}
			})
			.catch((error) => {
				if (error == 'TypeError: Failed to fetch') error += '<br><br>Maybe it is CORS! Check please <a class="btn btn-sm btn-info" target="_blank" href="https://github.com/epexa/bitgesell-wallet-js-frontend-core-dist#readme">manual here.</a>';
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
	const url = `http${urlSecure}://bitgesellexplorer.com/ext/getaddress/${address}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson);
	}, null, () => {
		return {
			title: `Error in get address info query: <a target="_blank" href="${url}">${url}</a>`,
		};
	});
};

const getAddressBalance = (address, callback) => {
	const url = `http${urlSecure}://bitgesellexplorer.com/ext/getbalance/${address}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson);
	}, null, () => {
		return {
			title: `Error in get address balance query: <a target="_blank" href="${url}">${url}</a>`,
		};
	}, true, 'address not found.');
};
