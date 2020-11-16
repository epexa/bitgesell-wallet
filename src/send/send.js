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
	for (const [ key ] of Object.entries(storage.addresses)) {
		$sendFromVal.add(new Option(key, key));
	}
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

		fetch('http://161.35.123.34:8332', {
			method: 'POST',
			mode: 'no-cors',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Basic ${btoa('bgl_user:12345678')}`,
			},
			body: body,
		})
				.then((response) => {
					return response.json();
				})
				.then((json) => {
					// console.log(json);
					if ( ! json.error) {
						console.log('new txId', json.result);
						storage.addresses[fromPublicAddresss].balance = newFromAmount;
						getBalanceSum();
						saveToCryptoStorage();
						alert(json.result);
					}
					else {
						console.log('error', json.error);
						alert(json.error.message);
					}
					// callback(json);
				});

	});

};
