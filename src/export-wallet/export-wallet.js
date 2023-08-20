document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#export-phrase',
		'#save-export-phrase',
		'#export-wallet-btn',
	);

	$saveExportPhrase.addEventListener('click', () => {
		$saveExportPhrase.href = `data:text/plain;charset=utf-8,${encodeURIComponent($exportPhrase.value)}`;
	});

	$exportWalletBtn.addEventListener('click', () => {
		window.location.hash = locationDefault;
	});

});

const exportWallet = () => {
	$exportPhrase.value = entropyToMnemonic(storage.entropy);
};

const goExportWalletScreen = () => {
	hide($main);
	show($exportWallet);
	exportWallet();
};

window.navigateExportWallet = () => {
	if (storage.entropy) {
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
			if (result.value) goExportWalletScreen();
			else window.location.hash = locationDefault;
		});
	}
	else window.location.hash = 'login';
};
