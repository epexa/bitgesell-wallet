document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#send-from-val',
	);

	formHandler($send.querySelector('form'), (data) => {
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
		// console.log('send tx', privateKey, fromPublicAddresss, toPublicAddress, fromAmount, toAmount, feeAmount, newFromAmount, txId);
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
			storage.addresses[fromPublicAddresss].balance = newFromAmount;
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

	});
};

window.navigateSend = () => {
	hide($welcome, $myAddresses, $newAddress, $transactions);
	show($main, $send);
	sendFormInit();
};
