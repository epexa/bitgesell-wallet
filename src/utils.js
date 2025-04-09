import Swal from 'sweetalert2';
import dayjs from 'dayjs';

Swal.mixin({
	buttonsStyling: false,
	confirmButtonText: 'I\'m sure!',
	cancelButtonText: 'Stop, I have to think...',
});

const camelCase = (str) => {
	str = str.replace(/[=\[\]"]/g, ' ').replace(/  +/g, ' ').replace(/[#\.]/g, '');
	str = str.replace(/-([a-z])/g, (_m, l) => {
		return l.toUpperCase();
	});
	return str.replace(/ ([a-z])/g, (_m, l) => {
		return l.toUpperCase();
	});
};

window.$dom = {};

const initHtmlElements = (...agrs) => {
	agrs.forEach(($htmlElement) => {
		const nameConst = camelCase($htmlElement);
		window.$dom[nameConst] = document.querySelector($htmlElement);
	});
};

const autoInitHtmlElements = () => {
	const allHtmlElemenetsWithIds = Array.from(document.querySelectorAll('[id]'))
			.map((element) => `#${element.id}`);

	if ( ! allHtmlElemenetsWithIds.length) return;

	initHtmlElements(...allHtmlElemenetsWithIds);
};

const hide = (...agrs) => {
	agrs.forEach((el) => {
		el.classList.add('d-none');
	});
};

const show = (...agrs) => {
	agrs.forEach((el) => {
		el.classList.remove('d-none');
	});
};

const formHandler = ($formName, callback) => {
	$formName.addEventListener('submit', (e) => {
		e.preventDefault();
		const data = {};
		$formName.querySelectorAll('input, select, textarea').forEach((row) => {
			if (row.name) data[row.name] = row.value;
		});
		callback(data);
	});
};

const dataTableParams = {
	processing: true,
	pagingType: 'simple_numbers',
	stateDuration: -1,
	lengthChange: false,
	pageLength: 50,
	autoWidth: false,
	responsive: true,
	ordering: false,
	searching: false,
	serverSide: false,
	ajax: '',
	stateSave: false,
};

const dateTimeFormat = (timestamp) => {
	return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
};

export {
	Swal,
	camelCase,
	autoInitHtmlElements,
	hide,
	show,
	formHandler,
	dataTableParams,
	dateTimeFormat,
};
