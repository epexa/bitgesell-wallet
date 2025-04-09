import { hide, show } from '../utils';

window.navigateWelcome = () => {
	hide($dom.main, $dom.restore, $dom.login, $dom.createWallet);
	show($dom.welcome);
};
