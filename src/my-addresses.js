document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#address-qrcode',
		'#save-qr-address',
		'#bitgesell-address',
		'#copy-address',
		'#add-new-address-btn',
		'#qr-code-modal',
	);

	new Modal($qrCodeModal);

	const addressQRcode = new QRCode($addressQrcode, {
		width: 256,
		height: 256,
		colorDark: '#000000',
		colorLight: '#ffffff',
		correctLevel: QRCode.CorrectLevel.H,
	});

	const myAddressesTable = $('#my-addresses-table').DataTable(
		$.extend({}, dataTableParams, {
			columns: [
				{ data: 'id' },
				{ data: 'address', render: (data) => { return `<input type="text" class="form-control-plaintext form-control-sm offset-3 col-6 font-weight-bold address" value="${data}" readonly="">`; }, width: '42%', class: 'text-center' },
				{ data: 'balance', render: (data) => { return humanAmountFormat(data); }, class: 'text-center' },
				{ data: 'input_count', class: 'text-center' },
				{ render: (row, display, column) => {
					let btns = '';
					btns += `<a class="btn btn-success btn-sm mr-1" href="#transactions/${column.address}">Transactions</a>`;
					btns += `<button class="btn btn-info btn-sm mr-1 passwords-list-btn" data-address="${column.address}">QR Code</button>`;
					btns += `<a class="btn btn-danger btn-sm mr-1" href="#send/${column.address}">Send</a>`;
					btns += `<a class="btn btn-warning btn-sm mr-1" target="_blank" href="https://bitgesellexplorer.com/address/${column.address}">Open in explorer</a>`;
					btns += `<button class="btn btn-primary btn-sm mr-1 copy-address-btn">Copy address</button>`;
					return btns;
				}, class: 'text-right' },
			],
			fnDrawCallback: () => {
				document.querySelectorAll('.passwords-list-btn').forEach(($btn) => {
					$btn.addEventListener('click', () => {
						addressQRcode.clear();
						addressQRcode.makeCode(`bitgesell:${$btn.dataset.address}`);
						$saveQrAddress.href = $addressQrcode.querySelector('canvas').toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
						$qrCodeModal.Modal.show();
					});
				});
				document.querySelectorAll('.copy-address-btn').forEach(($btn) => {
					$btn.addEventListener('click', () => {
						const $select = $btn.closest('tr').querySelectorAll('td')[1].querySelector('input');
						copyToBuffer($select);
					});
				});
				document.querySelectorAll('.address').forEach(($input) => {
					$input.addEventListener('click', () => {
						$input.select();
						copyToBuffer($input, false);
					});
				});
			},
		})
	);

	window.myAddressesTableDraw = () => {
		const myAddressesData = [];
		let countAddresses = 0;
		for (const [ key, value ] of Object.entries(storage.addresses)) {
			countAddresses++;
			myAddressesData.push({
				id: countAddresses,
				address: key,
				input_count: value.input_count,
				balance: value.balance,
			});
		}
		myAddressesTable.clear();
		myAddressesTable.rows.add(myAddressesData);
		myAddressesTable.draw(false);
	};

	const hash = window.location.hash.substring(1);
	if (hash === 'my-addresses') {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		myAddressesTableDraw();
	}

	$bitgesellAddress.addEventListener('click', () => {
		$bitgesellAddress.select();
		copyToBuffer($bitgesellAddress, false);
	});

	$copyAddress.addEventListener('click', () => {
		copyToBuffer($bitgesellAddress);
	});

});

const getAddressInfo = (address, callback) => {
	// https://blockchain.info/rawaddr/1G7ifTs1qXnz1BpqhXMRx9hkx3hk1KzwM7
	fetch(`https://api.smartbit.com.au/v1/blockchain/address/${address}/?limit=1`)
			.then((response) => { return response.json(); })
			.then((json) => {
				const addressInfo = {
					balance: parseFloat(json.address.total.balance).toFixed(8),
					input_count: json.address.total.input_count,
				};
				if (json.address.transactions) addressInfo.lastTxid = json.address.transactions[0].txid;
				callback(addressInfo);
			});
};

const getAllAddressInfo = () => {
	storage.balance = '0.00000000';
	for (const key in storage.myAddresses) {
		getAddressInfo(storage.myAddresses[key].address, (addressInfo) => {
			console.log(addressInfo);
			storage.myAddresses[key].balance = addressInfo.balance;
			storage.myAddresses[key].input_count = addressInfo.input_count;
			storage.myAddresses[key].lastTxid = addressInfo.lastTxid;
			storage.balance = (parseFloat(storage.balance) + parseFloat(addressInfo.balance)).toFixed(8);
			// myAddresses[storage.myAddresses[key].address] = storage.myAddresses[key];
		});
	}
};

