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

	$sendFromVal.addEventListener('change', addressBalance);

	$sendToVal.addEventListener('change', () => {
		const isValid = isAddressValid($sendToVal.value);
		if (isValid) {
			$sendToVal.classList.remove('is-invalid');
			$sendToVal.classList.add('is-valid');
			calcAmountSpent();
		}
		else {
			$sendToVal.classList.remove('is-valid');
			$sendToVal.classList.add('is-invalid');
		}
	});

	$sendAmountVal.addEventListener('input', () => {
		calcAmountSpent();
	});
	$sendFeeVal.addEventListener('input', calcAmountSpent);

	formHandler($send.querySelector('form'), () => {
		send();
	});

	$sendAmountMax.addEventListener('click', () => {
		if (sendParams.fromAmount) {
			if ( ! sendParams.feeAmount) sendParams.feeAmount = sb.toSatoshi($sendFeeVal.value);
			$sendAmountVal.value = sb.toBitcoin(sendParams.fromAmount - sendParams.feeAmount);
			calcAmountSpent();
		}
	});

});

const generateTransaction = () => {
	const fromPublicAddress = $sendFromVal.value;
	const toPublicAddress = $sendToVal.value;
	const privateKey = storage.addresses[fromPublicAddress].private;
	// console.log('send tx', privateKey, fromPublicAddress, toPublicAddress, sendParams.fromAmount, sendParams.toAmount, sendParams.feeAmount, sendParams.newFromAmount);
	const tx = new Transaction();
	if (apiAddressUtxo) {
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
	}
};

const calcAmountSpent = () => {
	let amountSpent;
	if ($sendAmountVal.value) {
		sendParams.toAmount = sb.toSatoshi($sendAmountVal.value);
		$sendAmountPrice.querySelector('span').innerText = ($sendAmountVal.value * coinPrice.price).toFixed(2);
		show($sendAmountPrice);
		sendParams.feeAmount = sb.toSatoshi($sendFeeVal.value);
		amountSpent = sendParams.toAmount + sendParams.feeAmount;
	}
	else {
		delete sendParams.toAmount;
		delete sendParams.newFromAmount;
		hide($sendAmountPrice);
	}
	$sendFormBtn.innerHTML = `Send <span class="badge bg-info">${amountSpent > 0 ? sb.toBitcoin(amountSpent) : ''}</span> BGL`;

	$sendAmountVal.classList.remove('is-invalid');
	if (sendParams.fromAmount >= 0 && sendParams.toAmount >= 0) {
		sendParams.newFromAmount = sendParams.fromAmount - sendParams.toAmount - sendParams.feeAmount;
		$sendNewBalance.querySelector('span').innerText = sb.toBitcoin(sendParams.newFromAmount);
		show($sendNewBalance);

		if (sendParams.newFromAmount >= 0) {
			generateTransaction();
		}
		else $sendAmountVal.classList.add('is-invalid');
	}
	else hide($sendNewBalance);
};

const addressBalance = () => {
	apiAddressUtxo = null;
	$sendFromVal.classList.remove('is-invalid');
	hide($sendBalance, $sendNewBalance);
	if ($sendFromVal.value) {
		sendParams.fromAmount = storage.addresses[$sendFromVal.value].balance;
		const humanAmount = sb.toBitcoin(sendParams.fromAmount);
		$sendBalance.querySelector('span').innerText = humanAmount;
		$sendBalance.querySelector('span:nth-child(2)').innerText = (humanAmount * coinPrice.price).toFixed(2);
		show($sendBalance);
		if (sendParams.fromAmount > 0) {
			getAddressUtxo($sendFromVal.value, (result) => {
				if (result.length) {
					apiAddressUtxo = result;
					calcAmountSpent();
				}
				else {
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
						if (result.value) {
							window.location.hash = `transactions/${$sendFromVal.value}#reload`;
						}
					});
				}
			});
		}
		else $sendFromVal.classList.add('is-invalid');
	}
	else delete sendParams.fromAmount;
	calcAmountSpent();
};

const sendFormInit = () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
	const $form = $send.querySelector('form');
	$form.reset();
	sendParams = {};
	newTx = null;
	while ($sendFromVal.length > 1) {
		$sendFromVal.remove(1);
	}
	for (const [ key ] of Object.entries(storage.addresses)) {
		$sendFromVal.add(new Option(key, key));
	}
	const selectedAddress = window.location.hash.substring(6);
	$sendFromVal.value = selectedAddress;
	addressBalance();
	$sendToVal.classList.remove('is-valid', 'is-invalid');
};

const send = () => {
	if ($send.querySelector('.is-invalid')) return;
	$send.querySelector('fieldset').setAttribute('disabled', '');
	const url = new URL(localStorage.nodeAddress);
	const fetchParams = {
		method: 'POST',
		// mode: 'no-cors',
		headers: {
			'Content-Type': 'application/json',
		},
		body: `{"jsonrpc":"1.0","id":"curltext","method":"sendrawtransaction","params":["${newTx}"]}`,
	};
	if (url.username && url.password) fetchParams.headers['Authorization'] = `Basic ${btoa(`${url.username}:${url.password}`)}`;
	fetchQuery(url.origin, (responseJson) => {
		// console.log('new txId', responseJson.result);
		const fromPublicAddress = $sendFromVal.value;
		storage.addresses[fromPublicAddress].balance = sendParams.newFromAmount;
		storage.addresses[fromPublicAddress].input_count++;
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
			if (result.value) {
				window.location.hash = `transactions/${fromPublicAddress}#reload`;
			}
		});
	}, fetchParams, (responseJson) => {
		return {
			title: 'Error in creating a transaction!',
			message: `<p class="text-danger">${responseJson.error.message}</p>Change the parameters and try again!`,
		};
	}, () => {
		$send.querySelector('fieldset').removeAttribute('disabled');
	});
};

window.navigateSend = () => {
	hide($welcome, $dashboard, $myAddresses, $newAddress, $transactions, $setPassword, $mobileMenu);
	show($main, $send);
	sendFormInit();
};
