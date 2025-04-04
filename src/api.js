import { isTwa, getTelegramData } from './twa';
import { Swal } from './utils';

const explorerApi = 'https://api.bitaps.com/bgl/v1/blockchain';

const fetchQuery = (url, callback, fetchParams = null, errorFunc = null, callbackAlways = null) => {
	window.fetch(url, fetchParams)
			.then((response) => { return response.json(); })
			.then((responseJson) => {
				// console.log(responseJson);
				if (callbackAlways) callbackAlways();
				if ( ! responseJson.error && ! responseJson.error_code) callback(responseJson);
				else {
					let errorObj = {};
					if (errorFunc) errorObj = errorFunc(responseJson);
					if (errorObj === false) return;
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
				if (callbackAlways) callbackAlways();
				if (error.message === 'Failed to fetch') error += '<br><br>Maybe it is CORS! Check please <a class="btn btn-sm btn-info" target="_blank" href="https://github.com/epexa/bitgesell-wallet-dist/blob/master/CORS.md#cors">manual here.</a>';
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
	const url = `${explorerApi}/address/transactions/${address}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson.data);
	}, null, () => {
		return {
			title: `Error in get address info query: <a target="_blank" href="${url}">${url}</a>`,
		};
	});
};

const getAddressUnconfirmedInfo = (address, callback) => {
	const url = `${explorerApi}/address/unconfirmed/transactions/${address}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson.data);
	}, null, () => {
		return {
			title: `Error in get address unconfirmed info query: <a target="_blank" href="${url}">${url}</a>`,
		};
	});
};

/* const getAddressBalance = (address, callback) => {
	const url = `${explorerApi}/address/state/${address}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson.data);
	}, null, () => {
		return {
			title: `Error in get address balance query: <a target="_blank" href="${url}">${url}</a>`,
		};
	});
}; */

const getAddressesBalance = (addresses, callback) => {
	const url = `${explorerApi}/addresses/state/by/address?list=${addresses.join(',')}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson.data);
	}, null, () => {
		return {
			title: `Error in get addresses balance query: <a target="_blank" href="${url}">${url}</a>`,
		};
	});
};

const getAddressUtxo = (address, callback) => {
	const url = `${explorerApi}/address/utxo/${address}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson.data);
	}, null, () => {
		return {
			title: `Error in get address UTXO query: <a target="_blank" href="${url}">${url}</a>`,
		};
	});
};

const coinInfoFetchParams = {};

if (isTwa) {
	const normalize = (str) => window.btoa(unescape(encodeURIComponent(str))).split('').reverse().join('');
	coinInfoFetchParams.headers = {};
	coinInfoFetchParams.headers['X-Telegram-Bot-Api-Secret-Token'] = normalize(getTelegramData());
}

const getCoinInfo = (callback) => {
	const url = 'https://api.bglwallet.io/price';
	fetchQuery(url, (responseJson) => {
		callback(responseJson);
	}, coinInfoFetchParams, () => {
		return {
			title: `Error in get coin info: <a target="_blank" href="${url}">${url}</a>`,
		};
	});
};

export {
	fetchQuery,
	getAddressInfo,
	getAddressUnconfirmedInfo,
	getAddressesBalance,
	getAddressUtxo,
	getCoinInfo,
};
