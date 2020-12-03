document.addEventListener('DOMContentLoaded', () => {

});

window.navigateWelcome = () => {
	hide($main, $restore, $login, $createWallet);
	show($welcome);
};
