/* global Telegram */

const getTelegramData = () => {
	if (Telegram.WebApp.initData) return Telegram.WebApp.initData;
	else return '';
};

const isTwa = getTelegramData() ? true : false;

const hapticFeedback = (field, type = null) => {
	if (Telegram.WebApp.HapticFeedback && Telegram.WebApp.HapticFeedback[field]) {
		Telegram.WebApp.HapticFeedback[field](type);
	}
};

const impactOccurredHeavy = () => hapticFeedback('impactOccurred', 'heavy');

const showAlert = (message, callback = null) => {
	if ( ! isTwa) return window.alert(message);

	try {
		Telegram.WebApp.showAlert(message, callback);
	}
	catch {
		window.alert(message);
	}
};

const setItem = async (key, value) => {
	if ( ! isTwa) return window.localStorage.setItem(key, value);

	try {
		const result = await new Promise((resolve, reject) => {
			Telegram.WebApp.CloudStorage.setItem(key, value, (error, result) => {
				if (error) {
					reject(error);
				}
				else {
					resolve(result);
				}
			});
		});

		return result;
	}
	catch (e) {
		if (e.message === 'WebAppMethodUnsupported') return window.localStorage.setItem(key, value);
		else showAlert(`error saving to telegram cloud: ${e}`);
	}
};

const getItem = async (key) => {
	if ( ! isTwa) return window.localStorage.getItem(key);

	try {
		const result = await new Promise((resolve, reject) => {
			Telegram.WebApp.CloudStorage.getItem(key, (error, result) => {
				if (error) {
					reject(error);
				}
				else {
					resolve(result);
				}
			});
		});

		return result;
	}
	catch (e) {
		if (e.message === 'WebAppMethodUnsupported') return window.localStorage.getItem(key);
		else showAlert(`error getting to telegram cloud: ${e}`);
	}
};

if (isTwa && Telegram.WebApp.ready) {
	Telegram.WebApp.ready();

	impactOccurredHeavy();

	// console.info('initData:', getTelegramData());
}

if (isTwa && Telegram.WebApp.expand) {
	Telegram.WebApp.expand();
}

if (isTwa && Telegram.WebApp.enableClosingConfirmation) {
	Telegram.WebApp.enableClosingConfirmation();
}

if (isTwa && Telegram.WebApp.disableVerticalSwipes) {
	Telegram.WebApp.disableVerticalSwipes();
}

export {
	getTelegramData,
	isTwa,
	showAlert,
	setItem,
	getItem,
};
