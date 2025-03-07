document.addEventListener('DOMContentLoaded', () => {

	const $form = $setPassword.querySelector('form');

	formHandler($form, (data) => {
		if (data.signup_password !== data.retype_signup_password) {
			Swal.fire({
				showCloseButton: true,
				icon: 'error',
				title: 'Passwords do not match!',
				showConfirmButton: false,
				cancelButtonText: 'Ok',
				toast: true,
				position: 'top',
				timer: 2000,
				timerProgressBar: true,
			});
			return;
		}

		localPassword = data.signup_password;
		saveToCryptoStorage();
		if (window.history.length > 1) window.history.go(-1);
		else window.location.hash = 'login';
		$form.reset();
		Swal.fire({
			showCloseButton: true,
			icon: 'success',
			title: 'Password set!',
			showConfirmButton: false,
			cancelButtonText: 'Ok',
			toast: true,
			position: 'top',
			timer: 2000,
			timerProgressBar: true,
		});
	});

	if (isTwa) {
		replacesInnerText(/local /ig, $setPassword.querySelector('h1'), $setPassword.querySelector('p'), $setPassword.querySelector('button'));
		hide($setPassword.querySelector('p.text-warning'));
	}

});

window.navigateSetPassword = () => {
	hide($main, $welcome);
	show($setPassword);
	setTimeout(() => {
		$setPassword.querySelector('input').focus();
	}, 100);
};
