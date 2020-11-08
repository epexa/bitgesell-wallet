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
			icon: 'success',
			title: 'New your address added!',
		});
	});

});

const generateBGLAddress = () => {
	const mnemonic = 'young crime force door joy subject situate hen pen sweet brisk snake nephew sauce point skate life truly hockey scout assault lab impulse boss';
	const seed = mnemonicToSeed(mnemonic, { hex: true });
	console.log(seed);
	const xPrivateKey = createMasterXPrivateKey(seed, { hex: true });
	console.log(xPrivateKey);
	console.log(isXPrivateKeyValid(xPrivateKey));
	const xPublicKey = xPrivateToXPublicKey(xPrivateKey, { hex: true });
	console.log(xPublicKey);
	console.log(isXPublicKeyValid(xPublicKey));
	// const publicKey = publicKeyToAddress(xPublicKey);
	// const publicKey = hashToAddress(xPublicKey);
	// Error: hex encoding required :hex
	const publicKey = xPublicKey;
	// console.log(isAddressValid(publicKey));
	return publicKey;

};

const newAddressGenerate = () => {
	$qrCodeModal.Modal.hide();
	window.scrollTo({ top: 0, behavior: 'smooth' });
	const $form = $newAddress.querySelector('form');
	$form.reset();
	$newAddressVal.value = generateBGLAddress();
	newAddressQRcode.clear();
	newAddressQRcode.makeCode(`bitgesell:${$newAddressVal.value}`);
	$saveQrNewAddress.href = $newAddressQrcode.querySelector('canvas').toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
};

