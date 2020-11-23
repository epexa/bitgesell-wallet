document.addEventListener('DOMContentLoaded', () => {

	formHandler($login.querySelector('form'), 'login', (response) => {
		window.location.hash = locationDefault;
		hide($login);
	});

});

window.navigateSetPassword = () => {
	hide($main, $createWallet);
	show($setPassword);
};
