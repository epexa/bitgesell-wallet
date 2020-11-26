document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#my-addresses-table',
		'#address-qrcode',
		'#save-qr-address',
		'#bitgesell-address',
		'#add-new-address-btn',
		'#qr-code-modal',
		'#import-address-btn',
		'#import-address-modal',
	);

	new BSN.Modal($qrCodeModal);
	new BSN.Modal($importAddressModal);

	const addressQRcode = new QRCode($addressQrcode, {
		width: 256,
		height: 256,
		colorDark: '#000000',
		colorLight: '#ffffff',
		correctLevel: QRCode.CorrectLevel.H,
	});

	const addEventButtons = () => {
		$myAddressesTable.querySelectorAll('.qr-code-btn').forEach(($btn) => {
			$btn.addEventListener('click', () => {
				addressQRcode.clear();
				addressQRcode.makeCode(`bgl:${$btn.dataset.address}`);
				$saveQrAddress.href = $addressQrcode.querySelector('canvas').toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
				$bitgesellAddress.value = $btn.dataset.address;
				$qrCodeModal.Modal.show();
			});
		});
		$myAddressesTable.querySelectorAll('.address').forEach(($input) => {
			$input.addEventListener('click', () => {
				$input.select();
				copyToBuffer($input);
			});
		});
	};

	const myAddressesTable = $('#my-addresses-table').DataTable(
		$.extend({}, dataTableParams, {
			columns: [
				{ data: 'id' },
				{ data: 'address', render: (data) => { return `<input type="text" class="form-control-plaintext form-control-sm offset-3 col-6 font-weight-bold address" value="${data}" readonly="">`; }, width: '42%', class: 'text-center' },
				{ data: 'balance', render: (data) => { return humanAmountFormat(data); }, class: 'text-center' },
				{ data: 'input_count', class: 'text-center' },
				{ render: (row, display, column) => {
					let btns = '';
					btns += `<a class="btn btn-danger btn-sm mr-1" href="#send/${column.address}">Send</a>`;
					btns += `<button class="btn btn-info btn-sm mr-1 qr-code-btn" data-address="${column.address}">Receive</button>`;
					btns += `<a class="btn btn-warning btn-sm mr-1" target="_blank" href="https://bgl.bitaps.com/${column.address}">Explorer</a>`;
					btns += `<a class="btn btn-success btn-sm mr-1" href="#transactions/${column.address}">Transactions</a>`;
					return btns;
				}, class: 'text-right' },
			],
			fnDrawCallback: addEventButtons,
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

		myAddressesTable.rows().every((index) => {
			const row = myAddressesTable.row(index);
			const data = row.data();
			getAddressBalance(data.address, (apiAddressBalance) => {
				data.balance = apiAddressBalance.balance;
				data.input_count = apiAddressBalance.sentTxCount;
				row.data(data);
				addEventButtons();
				storage.addresses[data.address].balance = data.balance;
				storage.addresses[data.address].input_count = data.input_count;
				getBalanceSum();
				saveToCryptoStorage();
			});
		});
	};

	const hash = window.location.hash.substring(1);
	if (hash === 'my-addresses') {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		myAddressesTableDraw();
	}

	$importAddressBtn.addEventListener('click', () => {
		$importAddressModal.Modal.show();
	});

	formHandler($importAddressModal.querySelector('form'), (data) => {
		if (isWifValid(data.wif)) {
			const address = new Address(data.wif);
			if ( ! storage.addresses[address.address]) {
				storage.addresses[address.address] = {
					private: data.wif,
					balance: 0,
					input_count: 0,
				};
				saveToCryptoStorage();
				$importAddressModal.Modal.hide();
				myAddressesTableDraw();
				Swal.fire({
					showCloseButton: true,
					icon: 'success',
					title: 'Your address is imported!',
					customClass: {
						confirmButton: 'btn btn-success btn-lg',
					},
					confirmButtonText: 'Nice!',
				});
			}
			else {
				Swal.fire({
					showCloseButton: true,
					icon: 'error',
					title: 'This address has already been imported!',
					customClass: {
						cancelButton: 'btn btn-danger btn-lg',
					},
					showConfirmButton: false,
					showCancelButton: true,
					cancelButtonText: 'Ok',
				});
			}
		}
		else {
			Swal.fire({
				showCloseButton: true,
				icon: 'error',
				title: 'WIF is not correct!',
				html: `Please check your WIF.`,
				customClass: {
					cancelButton: 'btn btn-danger btn-lg',
				},
				showConfirmButton: false,
				showCancelButton: true,
				cancelButtonText: 'Ok',
			});
		}
	});

});

window.navigateMyAddresses = () => {
	hide($welcome, $dashboard, $newAddress, $send, $transactions);
	show($main, $myAddresses);
	myAddressesTableDraw();
};
