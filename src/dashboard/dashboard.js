window.navigateDashboard = () => {
	hide($dom.welcome, $dom.createWallet, $dom.exportWallet, $dom.myAddresses, $dom.newAddress, $dom.send, $dom.transactions, $dom.restore, $dom.login, $dom.setPassword, $dom.mobileMenu);
	show($dom.main, $dom.dashboard);
	getBalanceSum();
};
