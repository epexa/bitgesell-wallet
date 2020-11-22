document.addEventListener('DOMContentLoaded', () => {

	const $form = $restore.querySelector('form');

	formHandler($form, (data) => {
		if (isMnemonicCheckSumValid(data.phrase)) {
			const entropy = mnemonicToEntropy(data.phrase);
			storage.entropy = entropy;
			storage.addresses = {};
			const newAddress = generateAddress(entropy, 0);
			$form.reset();
			window.location.hash = 'dashboard';
			Swal.fire({
				showCloseButton: true,
				icon: 'success',
				title: 'Seed worlds is correct!',
				html: `Your wallet has been restored!<br>Only one address added, generate new addresses if you need more of your old addresses.`,
				customClass: {
					confirmButton: 'btn btn-success btn-lg',
				},
				confirmButtonText: 'Wonderful! I understood.',
			});
		}
		else {
			Swal.fire({
				showCloseButton: true,
				icon: 'error',
				title: 'Seed worlds incorrect!',
				html: `You entered the wrong words, please try again!`,
				customClass: {
					cancelButton: 'btn btn-danger btn-lg',
				},
				showConfirmButton: false,
				showCancelButton: true,
				cancelButtonText: 'Ok',
			});
		}
	});

});
