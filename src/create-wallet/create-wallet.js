import { hide, show, Swal } from '../utils';
import { locationDefault, getBalanceSum, saveToCryptoStorage, downloadHrefValue, NETWORK } from '../app';
import { entropyToMnemonic, mnemonicToSeedSync, generateMnemonic, mnemonicToEntropy } from 'bip39';
import { payments as Payments } from 'bitcoinjs-lib';
import BIP32Factory from 'bip32';
import * as ecc from '@bitcoinerlab/secp256k1';
import { Buffer } from 'buffer';

const bip32 = BIP32Factory(ecc);

const generateAddress = (entropy, indexAddress = 0) => {
	const mnemonic = entropyToMnemonic(entropy);
	const seed = mnemonicToSeedSync(mnemonic);
	const root = bip32.fromSeed(seed, NETWORK);
	const child = root.derivePath(`m/84'/0'/0'/0/${indexAddress}`);
	const address = Payments.p2wpkh({
		pubkey: Buffer.from(child.publicKey),
		network: NETWORK,
	});
	window.storage.addresses[address.address] = {
		private: child.toWIF(),
		balance: 0,
		input_count: 0,
	};
	getBalanceSum();
	saveToCryptoStorage();
	return { mnemonic: mnemonic, address: address.address };
};

const createWallet = () => {
	const mnemonic = generateMnemonic(256);
	const entropy = mnemonicToEntropy(mnemonic).toString('hex');
	window.storage.entropy = entropy;
	window.storage.addresses = {};
	generateAddress(entropy, 0);
	$dom.backupPhrase.value = mnemonic;
};

const goCreateWalletScreen = () => {
	hide($dom.main, $dom.welcome, $dom.setPassword);
	show($dom.createWallet);
	createWallet();
};

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
