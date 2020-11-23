document.addEventListener('DOMContentLoaded', () => {

	formHandler($login.querySelector('form'), 'login', (response) => {
		window.location.hash = locationDefault;
		hide($login);
	});

});

window.navigateWelcome = () => {
	hide($main, $restore);
	show($welcome);
};
