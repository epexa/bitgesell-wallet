document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#backup-phrase',
		'#save-backup-phrase',
		'#create-wallet-btn',
	);

	$saveBackupPhrase.addEventListener('click', () => {
		$saveBackupPhrase.href = downloadHrefValue($backupPhrase.value);
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
		}).then((result) => {
			if ( ! result.value) return;

			window.location.hash = locationDefault;
		});
	});

});

const generateAddress = (entropy, indexAddress = 0) => {
	const mnemonic = jsbgl.entropyToMnemonic(entropy);
	const wallet = new jsbgl.Wallet({ from: mnemonic });
	const address = wallet.getAddress(indexAddress);
	storage.addresses[address.address] = {
		private: address.privateKey,
		balance: 0,
		input_count: 0,
	};
	getBalanceSum();
	saveToCryptoStorage();
	return { mnemonic: mnemonic, address: address.address };
};

const createWallet = () => {
	const entropy = jsbgl.generateEntropy();
	storage.entropy = entropy;
	storage.addresses = {};
	const newAddress = generateAddress(entropy, 0);
	$backupPhrase.value = newAddress.mnemonic;
};

const goCreateWalletScreen = () => {
	hide($main, $welcome, $setPassword);
	show($createWallet);
	createWallet();
};

window.navigateCreateWallet = () => {
	if ( ! localPassword) {
		window.location.hash = 'set-password';
		return;
	}
	if ( ! storage.entropy) {
		goCreateWalletScreen();
		return;
	}

	Swal.fire({
		title: 'Are you sure want to create a new wallet?',
		html: 'The current local wallet will be deleted from the current device.<br><b class="text-danger">Please take care of current wallet backup.</b>',
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

		Swal.fire({
			showCloseButton: true,
			showConfirmButton: false,
			toast: true,
			position: 'top',
			timer: 3000,
			timerProgressBar: true,
			icon: 'success',
			title: 'You deleted the previous local wallet from this device!',
		});
		goCreateWalletScreen();
	});
};
