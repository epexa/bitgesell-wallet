document.addEventListener('DOMContentLoaded', () => {

	const $form = $restore.querySelector('form');

	formHandler($form, (data) => {
		if ( ! jsbgl.isMnemonicCheckSumValid(data.phrase)) {
			Swal.fire({
				showCloseButton: true,
				icon: 'error',
				title: 'Seed words incorrect!',
				html: `You entered the wrong words, please try again!`,
				customClass: {
					cancelButton: 'btn btn-danger btn-lg',
				},
				showConfirmButton: false,
				showCancelButton: true,
				cancelButtonText: 'Ok',
			});
			return;
		}

		const entropy = jsbgl.mnemonicToEntropy(data.phrase);
		storage.entropy = entropy;
		storage.addresses = {};
		const newAddress = generateAddress(entropy, 0);
		$form.reset();
		window.location.hash = locationDefault;
		Swal.fire({
			showCloseButton: true,
			icon: 'success',
			title: 'Seed words is correct!',
			html: `Your wallet has been restored!<br>Only one address added, generate new addresses if you need more of your old addresses.`,
			customClass: {
				confirmButton: 'btn btn-success btn-lg',
			},
			confirmButtonText: 'Wonderful! I understood.',
		});
	});

});

window.navigateRestore = () => {
	if ( ! localPassword) {
		window.location.hash = 'login';
		return;
	}

	hide($main, $welcome, $setPassword);
	show($restore);
};
