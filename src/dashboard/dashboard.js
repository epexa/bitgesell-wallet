window.navigateDashboard = () => {
	hide($welcome, $createWallet, $myAddresses, $newAddress, $send, $transactions, $restore);
	show($main, $dashboard);
};
