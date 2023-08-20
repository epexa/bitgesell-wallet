window.navigateDashboard = () => {
	hide($welcome, $createWallet, $exportWallet, $myAddresses, $newAddress, $send, $transactions, $restore, $login, $setPassword, $mobileMenu);
	show($main, $dashboard);
	getBalanceSum();
};
