const sendParams = {};

document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#send-from-val',
		'#send-balance',
		'#send-to-val',
		'#send-amount-val',
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
		}
		else {
			$sendToVal.classList.remove('is-valid');
			$sendToVal.classList.add('is-invalid');
		}
	});

	const calcAmountSpent = () => {
		sendParams.toAmount = sb.toSatoshi($sendAmountVal.value);
		sendParams.feeAmount = sb.toSatoshi($sendFeeVal.value);
		const amountSpent = sendParams.toAmount + sendParams.feeAmount;
		$sendFormBtn.innerHTML = `Send <span class="badge badge-info">${sb.toBitcoin(amountSpent)}</span> BGL`;

		if (sendParams.fromAmount) {
			sendParams.newFromAmount = sendParams.fromAmount - sendParams.toAmount - sendParams.feeAmount;
			$sendNewBalance.querySelector('span').innerText = sb.toBitcoin(sendParams.newFromAmount);
			show($sendNewBalance);
		}
		else hide($sendNewBalance);
	};
	$sendAmountVal.addEventListener('input', calcAmountSpent);
	$sendFeeVal.addEventListener('input', calcAmountSpent);

	formHandler($send.querySelector('form'), () => {
		send();
	});

});

const addressBalance = () => {
	hide($sendBalance, $sendNewBalance);
	if ($sendFromVal.value) {
		sendParams.fromAmount = storage.addresses[$sendFromVal.value].balance;
		$sendBalance.querySelector('span').innerText = sb.toBitcoin(sendParams.fromAmount);
		show($sendBalance);
		if (sendParams.newFromAmount) show($sendNewBalance);
	}
};

const sendFormInit = () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
	const $form = $send.querySelector('form');
	$form.reset();
	while ($sendFromVal.length > 1) {
		$sendFromVal.remove(1);
	}
	for (const [ key ] of Object.entries(storage.addresses)) {
		$sendFromVal.add(new Option(key, key));
	}
	const selectedAddress = window.location.hash.substring(6);
	$sendFromVal.value = selectedAddress;
	addressBalance();
};

const send = () => {
	const fromPublicAddresss = $sendFromVal.value;
	const toPublicAddress = $sendToVal.value;
	const privateKey = storage.addresses[fromPublicAddresss].private;
	// console.log('send tx', privateKey, fromPublicAddresss, toPublicAddress, sendParams.fromAmount, sendParams.toAmount, sendParams.feeAmount, sendParams.newFromAmount);
	const tx = new Transaction();
	getAddressUtxo($sendFromVal.value, (apiAddressUtxo) => {
		if (apiAddressUtxo.length) {
			for (const key in apiAddressUtxo) {
				const utxo = apiAddressUtxo[key];
				tx.addInput({
					txId: utxo.txId,
					vOut: utxo.vOut,
					address: fromPublicAddresss,
				});
			}
			tx.addOutput({
				value: sendParams.toAmount,
				address: toPublicAddress,
			});
			if (sendParams.newFromAmount > 0) {
				tx.addOutput({
					value: sendParams.newFromAmount,
					address: fromPublicAddresss,
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
			const newTx = tx.serialize();

			const body = `{"jsonrpc":"1.0","id":"curltext","method":"sendrawtransaction","params":["${newTx}"]}`;
			const url = new URL(localStorage.nodeAddress);
			const fetchParams = {
				method: 'POST',
				// mode: 'no-cors',
				headers: {
					'Content-Type': 'application/json',
				},
				body: body,
			};
			if (url.username && url.password) fetchParams.headers['Authorization'] = `Basic ${btoa(`${url.username}:${url.password}`)}`;
			fetchQuery(url.origin, (responseJson) => {
				// console.log('new txId', responseJson.result);
				storage.addresses[fromPublicAddresss].balance = sendParams.newFromAmount;
				storage.addresses[fromPublicAddresss].input_count++;
				getBalanceSum();
				saveToCryptoStorage();
				Swal.fire({
					showCloseButton: true,
					icon: 'success',
					title: 'Your transaction has been created!',
					html: `<b class="text-danger">Transaction ID:</b><input type="text" class="form-control-plaintext form-control-sm font-weight-bold" value="${responseJson.result}" readonly="">It can take about an hour to process the transaction.`,
					customClass: {
						cancelButton: 'btn btn-success btn-lg',
					},
					showConfirmButton: false,
					showCancelButton: true,
					cancelButtonText: 'Great!',
				});
			}, fetchParams, (responseJson) => {
				return {
					title: 'Error in creating a transaction!',
					message: `<p class="text-danger">${responseJson.error.message}</p>Change the parameters and try again!`,
				};
			});
		}
		else {
			Swal.fire({
				showCloseButton: true,
				icon: 'error',
				title: `Please wait for confirmation of the previous transaction!`,
				html: `It may take about 1 hour...`,
				customClass: {
					cancelButton: 'btn btn-danger btn-lg',
				},
				showConfirmButton: false,
				showCancelButton: true,
				cancelButtonText: 'Ok',
			});
		}
	});
};

window.navigateSend = () => {
	hide($welcome, $dashboard, $myAddresses, $newAddress, $transactions, $setPassword, $mobileMenu);
	show($main, $send);
	sendFormInit();
};
