window.navigateDashboard = () => {
	hide($welcome, $createWallet, $myAddresses, $newAddress, $send, $transactions, $restore, $login, $setPassword, $mobileMenu);
	show($main, $dashboard);
};
