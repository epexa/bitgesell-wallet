import * as bootstrap from 'bootstrap';
import DataTable from 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css';

import { initHtmlElements, hide, show, dataTableParams, formHandler, Swal } from '../utils';
import { generateQRCode, humanAmountFormat, hideDataTablePagingIfOnlyOnePage, copyToBuffer, getBalanceSum, saveToCryptoStorage, jsbgl } from '../app';
import { getAddressesBalance } from '../api';

document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#my-addresses-table',
		'#address-qrcode',
		'#save-qr-address',
		'#bitgesell-address',
		'#add-new-address-btn',
		'#import-address-btn',
		'#import-address-modal',
	);

	const importAddressModal = new bootstrap.Modal($dom.importAddressModal);

	const addressQRcode = generateQRCode($dom.addressQrcode, 256);

	window.addEventButtons = (oSettings) => {
		$dom.myAddressesTable.querySelectorAll('.qr-code-btn').forEach(($btn) => {
			$btn.addEventListener('click', () => {
				addressQRcode.clear();
				addressQRcode.makeCode(`bgl:${$btn.dataset.address}`);
				$dom.saveQrAddress.href = $dom.addressQrcode.querySelector('canvas').toDataURL('image/png').replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
				$dom.bitgesellAddress.value = $btn.dataset.address;
				window.qrCodeModal.show();
			});
		});
		$dom.myAddressesTable.querySelectorAll('.address').forEach(($input) => {
			$input.addEventListener('click', () => {
				$input.select();
				copyToBuffer($input);
			});
		});

		hideDataTablePagingIfOnlyOnePage(oSettings);
	};

	const optionsButtonHtml = (address) => (
		`<a class="btn btn-danger btn-sm" href="#send/${address}"><i class="fa-solid fa-paper-plane visible-sr"></i><span class="hidden-sr">Send</span></a>` +
		`<button class="btn btn-info btn-sm qr-code-btn" data-address="${address}"><i class="fa-solid fa-download visible-sr"></i><span class="hidden-sr">Receive</span></button>` +
		`<a class="btn btn-warning btn-sm" target="_blank" href="https://bgl.bitaps.com/${address}"><i class="fa-solid fa-binoculars visible-sr"></i><span class="hidden-sr">Explorer</span></a>` +
		`<a class="btn btn-success btn-sm" href="#transactions/${address}"><i class="fa-solid fa-circle-nodes visible-sr"></i><span class="hidden-sr">Transactions</span></a>`
	);

	window.myAddressesTable = new DataTable($dom.myAddressesTable,
		Object.assign({}, dataTableParams, {
			columnDefs: [
				{
					className: 'dtr-control',
					orderable: false,
					targets: 0,
				},
			],
			order: [ 1, 'asc' ],
			responsive: {
				details: {
					type: 'column',
					target: 'tr',
				},
			},
		}, {
			columns: [
				{ render: () => { return null; } },
				{ data: 'id' },
				{ data: 'address', render: (data) => (`<input type="text" class="form-control-plaintext form-control-sm offset-lg-3 col-lg-6 fw-bold address" value="${data}" readonly="">`), width: '42%', className: 'text-center desktop' },
				{ data: 'balance', render: humanAmountFormat, className: 'text-center' },
				{ data: 'input_count', className: 'text-center desktop' },
				{ data: 'address', render: optionsButtonHtml, className: 'd-flex justify-content-end grid gap-1' },
			],
			drawCallback: window.addEventButtons,
		}),
	)
			.on('responsive-display', (e, datatable, row, showHide) => {
				if ( ! showHide) return;
				const $row = row.selector.rows[0];
				if ( ! $row) return;
				const $subRow = $row.nextElementSibling;
				$subRow.querySelector('.address').addEventListener('click', (e) => copyToBuffer(e.target));
			});

	window.myAddressesTableDraw = () => {
		const myAddressesData = [];
		const addresses = [];
		let countAddresses = 0;
		for (const [ key, value ] of Object.entries(window.storage.addresses)) {
			countAddresses++;
			myAddressesData.push({
				id: countAddresses,
				address: key,
				input_count: value.input_count,
				balance: value.balance,
			});
			addresses.push(key);
		}
		window.myAddressesTable.clear();
		window.myAddressesTable.rows.add(myAddressesData);
		window.myAddressesTable.draw(false);

		getAddressesBalance(addresses, (apiAddressesBalance) => {
			window.myAddressesTable.rows().every((index) => {
				const row = window.myAddressesTable.row(index);
				const data = row.data();
				data.balance = apiAddressesBalance[data.address].confirmed;
				data.input_count = apiAddressesBalance[data.address].sentTxCount;
				row.data(data);
				window.addEventButtons();
				window.storage.addresses[data.address].balance = data.balance;
				window.storage.addresses[data.address].input_count = data.input_count;
				getBalanceSum();
				saveToCryptoStorage();
			});
		});
	};

	const hash = window.location.hash.substring(1);
	if (hash === 'my-addresses') {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		window.myAddressesTableDraw();
	}

	$dom.importAddressBtn.addEventListener('click', () => {
		importAddressModal.show();
	});

	formHandler($dom.importAddressModal.querySelector('form'), (data) => {
		if ( ! jsbgl.isWifValid(data.wif)) {
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
			return;
		}

		const address = new jsbgl.Address(data.wif);

		if (window.storage.addresses[address.address]) {
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
			return;
		}

		window.storage.addresses[address.address] = {
			private: data.wif,
			balance: 0,
			input_count: 0,
		};
		saveToCryptoStorage();
		importAddressModal.hide();
		window.myAddressesTableDraw();
		Swal.fire({
			showCloseButton: true,
			icon: 'success',
			title: 'Your address is imported!',
			customClass: {
				confirmButton: 'btn btn-success btn-lg',
			},
			confirmButtonText: 'Nice!',
		});
	});

});

window.navigateMyAddresses = () => {
	hide($dom.welcome, $dom.dashboard, $dom.newAddress, $dom.send, $dom.transactions, $dom.setPassword, $dom.mobileMenu);
	show($dom.main, $dom.myAddresses);
	window.myAddressesTableDraw();
};
