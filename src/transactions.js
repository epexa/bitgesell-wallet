document.addEventListener('DOMContentLoaded', () => {

	const transactionsTable = $('#transactions-table').DataTable(
		$.extend({}, dataTableParams, {
			columns: [
				{ data: 'id' },
				{ data: 'address', render: (data) => { return `<input type="text" class="form-control-plaintext form-control-sm offset-3 col-6 address" value="${data}" readonly="">`; }, width: '42%', class: 'text-center' },
				{ data: 'input_count', class: 'text-center' },
				{ data: 'balance', render: (data) => { return humanAmountFormat(data); }, class: 'text-center' },
				{ render: (row, display, column) => {
					let btns = '';
					btns += `<a class="btn btn-warning btn-sm mr-1" target="_blank" href="https://bitgesellexplorer.com/address/${column.address}">Open in explorer</a>`;
					return btns;
				}, class: 'text-right' },
			],
			fnDrawCallback: () => {

			},
		})
	);

	window.transactionsTableDraw = () => {
		const transactionsData = [
			{ id: 1, address: 'bgl1qqx2f5uwjvyd6hutps5788f56hxy8cylya39svk', input_count: 0, balance: 0 },
			{ id: 2, address: 'bgl1qqx2f5uwjvyd6hutps5788f56hxy8cylya39svk', input_count: 0, balance: 0 },
			{ id: 3, address: 'bgl1qqx2f5uwjvyd6hutps5788f56hxy8cylya39svk', input_count: 0, balance: 0 },
		];
		transactionsTable.clear();
		transactionsTable.rows.add(transactionsData);
		transactionsTable.draw(false);
	};

	const hash = window.location.hash.substring(1);
	if (hash === 'transactions') {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		transactionsTableDraw();
	}

});

