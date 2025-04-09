import { hide, show, Swal } from '../utils';
import { locationDefault, downloadHrefValue, jsbgl } from '../app';

const exportWallet = () => {
	$dom.exportPhrase.value = jsbgl.entropyToMnemonic(window.storage.entropy);
};

const goExportWalletScreen = () => {
	hide($dom.main);
	show($dom.exportWallet);
	exportWallet();
};

$dom.saveExportPhrase.addEventListener('click', () => {
	$dom.saveExportPhrase.href = downloadHrefValue($dom.exportPhrase.value);
});

$dom.exportWalletBtn.addEventListener('click', () => {
	window.location.hash = locationDefault;
});

window.navigateExportWallet = () => {
	if ( ! window.storage.entropy) {
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
