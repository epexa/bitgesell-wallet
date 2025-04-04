import { initHtmlElements, hide, show, Swal } from '../utils';
import { locationDefault, getBalanceSum, saveToCryptoStorage, downloadHrefValue, jsbgl } from '../app';

document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#backup-phrase',
		'#save-backup-phrase',
		'#create-wallet-btn',
	);

	$dom.saveBackupPhrase.addEventListener('click', () => {
		$dom.saveBackupPhrase.href = downloadHrefValue($dom.backupPhrase.value);
	});

	$dom.createWalletBtn.addEventListener('click', () => {
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
	window.storage.addresses[address.address] = {
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
	window.storage.entropy = entropy;
	window.storage.addresses = {};
	const newAddress = generateAddress(entropy, 0);
	$dom.backupPhrase.value = newAddress.mnemonic;
};

const goCreateWalletScreen = () => {
	hide($dom.main, $dom.welcome, $dom.setPassword);
	show($dom.createWallet);
	createWallet();
};

window.navigateCreateWallet = () => {
	if ( ! window.localPassword) {
		window.location.hash = 'set-password';
		return;
	}
	if ( ! window.storage.entropy) {
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

export {
	generateAddress,
};
