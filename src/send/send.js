document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#send-from-val',
	);

	formSave($send.querySelector('form'), (data) => {
		send(data.from, data.to, data.amount, data.fee);
	});

});

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
};

const send = (fromPublicAddresss, toPublicAddress, toAmount, feeAmount) => {
	toAmount = sb.toSatoshi(toAmount);
	feeAmount = sb.toSatoshi(feeAmount);
	const addressInfo = storage.addresses[fromPublicAddresss];
	const privateKey = addressInfo.private;

	getAddressInfo(fromPublicAddresss, (apiAddressInfo) => {
		const fromAmount = sb.toSatoshi(apiAddressInfo.balance);
		const newFromAmount = fromAmount - toAmount - feeAmount;
		const txId = apiAddressInfo.last_txs.reverse()[0].addresses;

		console.log('send tx', privateKey, fromPublicAddresss, toPublicAddress, fromAmount, toAmount, feeAmount, newFromAmount, txId);

		const tx = new Transaction();
		tx.addInput({
			txId: txId,
			vOut: 1,
			address: fromPublicAddresss,
		});
		tx.addOutput({
			value: toAmount,
			address: toPublicAddress,
		});
		tx.addOutput({
			value: newFromAmount,
			address: fromPublicAddresss,
		});
		tx.signInput(0, {
			privateKey: privateKey,
			sigHashType: SIGHASH_ALL,
			value: fromAmount,
		});
		console.log('newFromAmount', newFromAmount);
		console.log('newFromAmount human format', sb.toBitcoin(newFromAmount));
		const newTx = tx.serialize();
		console.log('newTx', newTx);

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
		fetch(url.origin, fetchParams)
				.then((response) => {
					return response.json();
				})
				.then((json) => {
					// console.log(json);
					if ( ! json.error) {
						console.log('new txId', json.result);
						storage.addresses[fromPublicAddresss].balance = newFromAmount;
						storage.addresses[fromPublicAddresss].input_count++;
						getBalanceSum();
						saveToCryptoStorage();
						Swal.fire({
							showCloseButton: true,
							icon: 'success',
							title: 'Your transaction has been created!',
							html: `<b class="text-danger">Transaction ID:</b><input type="text" class="form-control-plaintext form-control-sm font-weight-bold" value="${json.result}" readonly="">It can take about an hour to process the transaction.`,
							customClass: {
								cancelButton: 'btn btn-success btn-lg',
							},
							showConfirmButton: false,
							showCancelButton: true,
							cancelButtonText: 'Great!',
						});
					}
					else {
						console.log('error', json.error);
						Swal.fire({
							showCloseButton: true,
							icon: 'danger',
							title: 'Error creating transaction!',
							html: `<p class="text-danger">${json.error.message}</p>Change the parameters and try again!`,
							customClass: {
								cancelButton: 'btn btn-danger btn-lg',
							},
							showConfirmButton: false,
							showCancelButton: true,
							cancelButtonText: 'Ok',
						});
					}
					// callback(json);
				});

	});

};
