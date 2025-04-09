import { hide, show, Swal } from '../utils';
import { generateQRCode } from '../app';
import { generateAddress } from '../create-wallet/create-wallet';

let newAddressQRcode;

document.addEventListener('DOMContentLoaded', () => {

	newAddressQRcode = generateQRCode($dom.newAddressQrcode, 192);

	$dom.addNewAddressBtn.addEventListener('click', () => {
		newAddressGenerate();
		Swal.fire({
			showCloseButton: true,
			showConfirmButton: false,
			toast: true,
			position: 'top',
			timer: 3000,
			timerProgressBar: true,
			icon: 'success',
			title: 'New your address added!',
		});
	});

});

const newAddressGenerate = () => {
	window.qrCodeModal.hide();
	window.scrollTo({ top: 0, behavior: 'smooth' });
	const $form = $dom.newAddress.querySelector('form');
	$form.reset();
	$dom.newAddressVal.value = generateAddress(window.storage.entropy, Object.keys(window.storage.addresses).length).address;
	newAddressQRcode.clear();
	newAddressQRcode.makeCode(`bgl:${$dom.newAddressVal.value}`);
	$dom.saveQrNewAddress.href = $dom.newAddressQrcode.querySelector('canvas').toDataURL('image/png').replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
};

window.navigateNewAddress = () => {
	hide($dom.welcome, $dom.myAddresses, $dom.send, $dom.transactions, $dom.setPassword, $dom.mobileMenu);
	show($dom.main, $dom.newAddress);
	newAddressGenerate();
};
