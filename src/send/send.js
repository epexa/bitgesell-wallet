let sendParams = {};
let apiAddressUtxo;
let newTx;

document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#send-from-val',
		'#send-balance',
		'#send-to-val',
		'#send-amount-val',
		'#send-amount-max',
		'#send-amount-price',
		'#send-fee-val',
		'#send-form-btn',
		'#send-new-balance',
	);

	$dom.sendFromVal.addEventListener('change', addressBalance);

	$dom.sendToVal.addEventListener('change', () => {
		const isValid = jsbgl.isAddressValid($dom.sendToVal.value);
		if (isValid) {
			$dom.sendToVal.classList.remove('is-invalid');
			$dom.sendToVal.classList.add('is-valid');
			calcAmountSpent();
		}
		else {
			$dom.sendToVal.classList.remove('is-valid');
			$dom.sendToVal.classList.add('is-invalid');
		}
	});

	$dom.sendAmountVal.addEventListener('input', () => {
		calcAmountSpent();
	});
	$dom.sendFeeVal.addEventListener('input', calcAmountSpent);

	formHandler($dom.send.querySelector('form'), () => {
		send();
	});

	$dom.sendAmountMax.addEventListener('click', () => {
		if ( ! sendParams.fromAmount) return;

		if ( ! sendParams.feeAmount) sendParams.feeAmount = sb.toSatoshi($dom.sendFeeVal.value);
		$dom.sendAmountVal.value = sb.toBitcoin(sendParams.fromAmount - sendParams.feeAmount);
		calcAmountSpent();
	});

});

const generateTransaction = () => {
	const fromPublicAddress = $dom.sendFromVal.value;
	const toPublicAddress = $dom.sendToVal.value;
	const privateKey = window.storage.addresses[fromPublicAddress].private;
	// console.log('send tx', privateKey, fromPublicAddress, toPublicAddress, sendParams.fromAmount, sendParams.toAmount, sendParams.feeAmount, sendParams.newFromAmount);
	const tx = new jsbgl.Transaction();

	if ( ! toPublicAddress || ! apiAddressUtxo) return;

	for (const key in apiAddressUtxo) {
		const utxo = apiAddressUtxo[key];
		tx.addInput({
			txId: utxo.txId,
			vOut: utxo.vOut,
			address: fromPublicAddress,
		});
	}
	tx.addOutput({
		value: sendParams.toAmount,
		address: toPublicAddress,
	});
	if (sendParams.newFromAmount > 0) {
		tx.addOutput({
			value: sendParams.newFromAmount,
			address: fromPublicAddress,
		});
	}
	let utxoCount = 0;
	for (const key in apiAddressUtxo) {
		const utxo = apiAddressUtxo[key];
		tx.signInput(utxoCount, {
			privateKey: privateKey,
			value: utxo.amount,
		});
		utxoCount++;
	}
	newTx = tx.serialize();
};

const calcAmountSpent = () => {
	let amountSpent;
	if ($dom.sendAmountVal.value) {
		sendParams.toAmount = sb.toSatoshi($dom.sendAmountVal.value);
		$dom.sendAmountPrice.querySelector('span').innerText = ($dom.sendAmountVal.value * coinPrice.price).toFixed(2);
		show($dom.sendAmountPrice);
		sendParams.feeAmount = sb.toSatoshi($dom.sendFeeVal.value);
		amountSpent = sendParams.toAmount + sendParams.feeAmount;
	}
	else {
		delete sendParams.toAmount;
		delete sendParams.newFromAmount;
		hide($dom.sendAmountPrice);
	}
	$dom.sendFormBtn.innerHTML = `Send <span class="badge bg-info">${amountSpent > 0 ? sb.toBitcoin(amountSpent) : ''}</span> BGL`;

	$dom.sendAmountVal.classList.remove('is-invalid');

	if (sendParams.fromAmount < 0 || sendParams.toAmount === undefined || sendParams.toAmount < 0) {
		hide($dom.sendNewBalance);
		return;
	}

	sendParams.newFromAmount = sendParams.fromAmount - sendParams.toAmount - sendParams.feeAmount;
	$dom.sendNewBalance.querySelector('span').innerText = sb.toBitcoin(sendParams.newFromAmount);
	show($dom.sendNewBalance);

	if (sendParams.newFromAmount < 0) {
		$dom.sendAmountVal.classList.add('is-invalid');
		return;
	}

	generateTransaction();
};

const checkAdressUxto = () => {
	getAddressUtxo($dom.sendFromVal.value, (result) => {
		if ( ! result.length) {
			Swal.fire({
				showCloseButton: true,
				icon: 'error',
				title: `Please wait for confirmation of the previous transaction!`,
				html: `It may take about 1 hour...`,
				customClass: {
					actions: 'btn-group',
					confirmButton: 'btn btn-success btn-lg',
					cancelButton: 'btn btn-danger btn-lg',
				},
				showCancelButton: true,
				confirmButtonText: 'Show transaction',
				cancelButtonText: 'Ok, close',
			}).then((result) => {
				if ( ! result.value) return;

				window.location.hash = `transactions/${$dom.sendFromVal.value}#reload`;
			});
			return;
		}

		apiAddressUtxo = result;
		calcAmountSpent();
	});
};

const addressBalance = () => {
	apiAddressUtxo = null;
	$dom.sendFromVal.classList.remove('is-invalid');
	hide($dom.sendBalance, $dom.sendNewBalance);

	if ( ! $dom.sendFromVal.value) {
		delete sendParams.fromAmount;
		calcAmountSpent();
		return;
	}

	sendParams.fromAmount = window.storage.addresses[$dom.sendFromVal.value].balance;
	const humanAmount = sb.toBitcoin(sendParams.fromAmount);
	$dom.sendBalance.querySelector('span').innerText = humanAmount;
	$dom.sendBalance.querySelector('span:nth-child(2)').innerText = (humanAmount * coinPrice.price).toFixed(2);
	show($dom.sendBalance);

	if (sendParams.fromAmount <= 0) {
		$dom.sendFromVal.classList.add('is-invalid');
		return;
	}

	calcAmountSpent();

	checkAdressUxto();
};

const sendFormInit = () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
	const $form = $dom.send.querySelector('form');
	$form.reset();
	sendParams = {};
	newTx = null;
	while ($dom.sendFromVal.length > 1) {
		$dom.sendFromVal.remove(1);
	}
	for (const [ key ] of Object.entries(window.storage.addresses)) {
		$dom.sendFromVal.add(new window.Option(key, key));
	}
	const selectedAddress = window.location.hash.substring(6);
	$dom.sendFromVal.value = selectedAddress;
	addressBalance();
	$dom.sendToVal.classList.remove('is-valid', 'is-invalid');
};

const send = () => {
	if ($dom.send.querySelector('.is-invalid')) return;

	$dom.send.querySelector('fieldset').setAttribute('disabled', '');
	const url = new window.URL(window.localStorage.nodeAddress);
	const fetchParams = {
		method: 'POST',
		// mode: 'no-cors',
		headers: {
			'Content-Type': 'application/json',
		},
		body: `{"jsonrpc":"1.0","id":"curltext","method":"sendrawtransaction","params":["${newTx}"]}`,
	};
	if (url.username && url.password) fetchParams.headers['Authorization'] = `Basic ${window.btoa(`${url.username}:${url.password}`)}`;
	fetchQuery(url.origin, (responseJson) => {
		// console.log('new txId', responseJson.result);
		const fromPublicAddress = $dom.sendFromVal.value;
		window.storage.addresses[fromPublicAddress].balance = sendParams.newFromAmount;
		window.storage.addresses[fromPublicAddress].input_count++;
		getBalanceSum();
		saveToCryptoStorage();
		Swal.fire({
			showCloseButton: true,
			icon: 'success',
			title: 'Your transaction has been created!',
			html: `<b class="text-danger">Transaction ID:</b><input type="text" class="form-control-plaintext form-control-sm fw-bold" value="${responseJson.result}" readonly="">It can take about an hour to process the transaction.`,
			customClass: {
				actions: 'btn-group',
				confirmButton: 'btn btn-success btn-lg',
				cancelButton: 'btn btn-warning btn-lg',
			},
			showCancelButton: true,
			confirmButtonText: 'Show transaction',
			cancelButtonText: 'Great! Close',
		}).then((result) => {
			if ( ! result.value) return;

			window.location.hash = `transactions/${fromPublicAddress}#reload`;
		});
	}, fetchParams, (responseJson) => {
		if (responseJson.error.code === -22) {
			checkAdressUxto();
			return false;
		}

		return {
			title: 'Error in creating a transaction!',
			message: `<p class="text-danger">${responseJson.error.message}</p>Change the parameters and try again!`,
		};
	}, () => {
		$dom.send.querySelector('fieldset').removeAttribute('disabled');
	});
};

window.navigateSend = () => {
	hide($dom.welcome, $dom.dashboard, $dom.myAddresses, $dom.newAddress, $dom.transactions, $dom.setPassword, $dom.mobileMenu);
	show($dom.main, $dom.send);
	sendFormInit();
};
