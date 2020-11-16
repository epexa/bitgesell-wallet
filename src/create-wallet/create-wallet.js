document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#backup-phrase',
		'#copy-backup-phrase',
		'#save-backup-phrase',
		'#create-wallet-btn',
	);

	$backupPhrase.addEventListener('click', () => {
		$backupPhrase.select();
		copyToBuffer($backupPhrase, false);
	});

	$copyBackupPhrase.addEventListener('click', () => {
		copyToBuffer($backupPhrase);
	});

	$saveBackupPhrase.addEventListener('click', () => {
		$saveBackupPhrase.href = `data:text/plain;charset=utf-8,${encodeURIComponent($backupPhrase.value)}`;
	});

	$createWalletBtn.addEventListener('click', () => {
		Swal.fire({
			title: 'Are you sure you saved the phrase?',
			html: 'They are not saved anywhere, so you can\'t get them anywhere else!',
			icon: 'question',
			showCancelButton: true,
			customClass: {
				actions: 'btn-group',
				confirmButton: 'btn btn-success btn-lg',
				cancelButton: 'btn btn-outline-danger btn-lg',
			},
			showCloseButton: true,
			showLoaderOnConfirm: true,
		}).then((result) => {
			if (result.value) {
				window.location.hash = 'dashboard';
			}
		});
	});

});

const createWallet = () => {
	const entropy = generateEntropy();
	const mnemonic = entropyToMnemonic(entropy);
	$backupPhrase.value = mnemonic;
	const wallet = new Wallet({ from: mnemonic });
	const address = wallet.getAddress(0);
	storage.addresses[address.address] = {
		private: address.privateKey,
		balance: 0,
		input_count: 0,
	};
	saveToCryptoStorage();
};
