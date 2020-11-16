let newAddressQRcode;

document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#new-address-qrcode',
		'#save-qr-new-address',
		'#new-address-val',
		'#new-address-copy',
		'#add-new-address-btn',
	);

	newAddressQRcode = new QRCode($newAddressQrcode, {
		width: 192,
		height: 192,
		colorDark: '#000000',
		colorLight: '#ffffff',
		correctLevel: QRCode.CorrectLevel.H,
	});

	$newAddressVal.addEventListener('click', () => {
		$newAddressVal.select();
		copyToBuffer($newAddressVal, false);
	});

	$newAddressCopy.addEventListener('click', () => {
		copyToBuffer($newAddressVal);
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
	newAddressQRcode.makeCode(`bitgesell:${$newAddressVal.value}`);
	$saveQrNewAddress.href = $newAddressQrcode.querySelector('canvas').toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
};
