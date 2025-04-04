document.addEventListener('DOMContentLoaded', () => {

});

window.navigateWelcome = () => {
	hide($dom.main, $dom.restore, $dom.login, $dom.createWallet);
	show($dom.welcome);
};
