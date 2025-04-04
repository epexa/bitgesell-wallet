document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#export-phrase',
		'#save-export-phrase',
		'#export-wallet-btn',
	);

	$dom.saveExportPhrase.addEventListener('click', () => {
		$dom.saveExportPhrase.href = downloadHrefValue($dom.exportPhrase.value);
	});

	$dom.exportWalletBtn.addEventListener('click', () => {
		window.location.hash = locationDefault;
	});

});

const exportWallet = () => {
	$dom.exportPhrase.value = jsbgl.entropyToMnemonic(window.storage.entropy);
};

const goExportWalletScreen = () => {
	hide($dom.main);
	show($dom.exportWallet);
	exportWallet();
};

window.navigateExportWallet = () => {
	if ( ! storage.entropy) {
		window.location.hash = 'login';
		return;
	}

	Swal.fire({
		title: 'Are you sure you want to show phrases?',
		html: 'These phrases will restore full access to your wallet!<br><b class="text-danger">Never share it with anyone!</b>',
		icon: 'question',
		showCancelButton: true,
		customClass: {
			actions: 'btn-group',
			confirmButton: 'btn btn-success btn-lg',
			cancelButton: 'btn btn-outline-danger btn-lg',
		},
		showCloseButton: true,
	}).then((result) => {
		if ( ! result.value) {
			window.location.hash = locationDefault;
			return;
		}

		goExportWalletScreen();
	});
};
