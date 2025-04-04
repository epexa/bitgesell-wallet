let newAddressQRcode;

document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#new-address-qrcode',
		'#save-qr-new-address',
		'#new-address-val',
		'#add-new-address-btn',
	);

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
	qrCodeModal.hide();
	window.scrollTo({ top: 0, behavior: 'smooth' });
	const $form = $dom.newAddress.querySelector('form');
	$form.reset();
	$dom.newAddressVal.value = generateAddress(storage.entropy, Object.keys(storage.addresses).length).address;
	newAddressQRcode.clear();
	newAddressQRcode.makeCode(`bgl:${$dom.newAddressVal.value}`);
	$dom.saveQrNewAddress.href = $dom.newAddressQrcode.querySelector('canvas').toDataURL('image/png').replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
};

window.navigateNewAddress = () => {
	hide($dom.welcome, $dom.myAddresses, $dom.send, $dom.transactions, $dom.setPassword, $dom.mobileMenu);
	show($dom.main, $dom.newAddress);
	newAddressGenerate();
};
