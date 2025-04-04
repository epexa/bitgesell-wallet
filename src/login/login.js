document.addEventListener('DOMContentLoaded', () => {

	const $form = $dom.login.querySelector('form');

	formHandler($form, (data) => {
		aes4js.decrypt(data.password, {
			encrypted: encryptedMimeType + window.tempStorage.encrypted,
			iv: window.tempStorage.iv,
			bin: false,
		})
				.then((decrypted) => {
					window.localPassword = data.password;
					window.storage = JSON.parse(decrypted);
					if (window.storage.entropy) window.location.hash = locationDefault;
					else window.location.hash = 'welcome';
					$form.reset();
					Swal.fire({
						showCloseButton: true,
						icon: 'success',
						title: 'Authorization was successful!',
						showConfirmButton: false,
						cancelButtonText: 'Ok',
						toast: true,
						position: 'top',
						timer: 2000,
						timerProgressBar: true,
					});
				})
				.catch((e) => {
					Swal.fire({
						showCloseButton: true,
						icon: 'error',
						title: 'Incorrect password!',
						showConfirmButton: false,
						cancelButtonText: 'Ok',
						toast: true,
						position: 'top',
						timer: 2000,
						timerProgressBar: true,
					});
					$dom.login.querySelector('input').focus();
				});
	});

	if (isTwa) replacesInnerText(/local /ig, $dom.login.querySelector('p'), $dom.login.querySelector('label'));

});

window.navigateLogin = () => {
	hide($dom.main, $dom.setPassword);
	show($dom.login);
	window.setTimeout(() => {
		$dom.login.querySelector('input').focus();
	}, 100);
};
