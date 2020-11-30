document.addEventListener('DOMContentLoaded', () => {

});

window.navigateWelcome = () => {
	hide($main, $restore, $login);
	show($welcome);
};
