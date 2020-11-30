let newAddressQRcode;

document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#new-address-qrcode',
		'#save-qr-new-address',
		'#new-address-val',
		'#add-new-address-btn',
	);

	newAddressQRcode = new QRCode($newAddressQrcode, {
		width: 192,
		height: 192,
		colorDark: '#000000',
		colorLight: '#ffffff',
		correctLevel: QRCode.CorrectLevel.H,
	});

	$addNewAddressBtn.addEventListener('click', () => {
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
	$qrCodeModal.Modal.hide();
	window.scrollTo({ top: 0, behavior: 'smooth' });
	const $form = $newAddress.querySelector('form');
	$form.reset();
	$newAddressVal.value = generateAddress(storage.entropy, Object.keys(storage.addresses).length).address;
	newAddressQRcode.clear();
	newAddressQRcode.makeCode(`bgl:${$newAddressVal.value}`);
	$saveQrNewAddress.href = $newAddressQrcode.querySelector('canvas').toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
};

window.navigateNewAddress = () => {
	hide($welcome, $myAddresses, $send, $transactions, $setPassword);
	show($main, $newAddress);
	newAddressGenerate();
};
