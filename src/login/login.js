document.addEventListener('DOMContentLoaded', () => {

	/* formHandler($login.querySelector('form'), 'login', (response) => {
		window.location.hash = locationDefault;
		hide($login);
	}); */

});

window.navigateLogin = () => {
	hide($main);
	show($login);
	setTimeout(() => {
		$login.querySelector('input').focus();
	}, 100);
};
