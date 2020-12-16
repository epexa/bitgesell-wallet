document.addEventListener('DOMContentLoaded', () => {

	const transactionsTable = $('#transactions-table').DataTable(
		$.extend({}, dataTableParams, {
			columns: [
				{ data: 'id' },
				{ data: 'tx_id', render: (data) => { return `<input type="text" class="form-control-plaintext form-control-sm offset-3 col-6" value="${data}" readonly="">`; }, width: '62%', class: 'text-center' },
				{ data: 'type', render: (data) => {
					let className = 'danger';
					let text = 'Sended';
					if (data === 0) {
						className = 'success';
						text = 'Received';
					}
					return `<span class="badge badge-${className}">${text}</span>`;
				}, class: 'text-center' },
				{ data: 'tx_id', render: (row, display, column) => {
					let btns = '';
					btns += `<a class="btn btn-warning btn-sm mr-1" target="_blank" href="https://bgl.bitaps.com/${column.tx_id}">Open in explorer</a>`;
					return btns;
				}, class: 'text-right' },
			],
			fnDrawCallback: () => {

			},
		})
	);

	window.transactionsTableDraw = () => {
		transactionsTable.clear();
		transactionsTable.draw(false);
		const address = window.location.hash.substring(14);
		getAddressInfo(address, (apiAddressInfo) => {
			const transactionsData = [];
			let countAddresses = 0;
			apiAddressInfo.list = apiAddressInfo.list;
			for (const key in apiAddressInfo.list) {
				countAddresses++;
				const value = apiAddressInfo.list[key];
				transactionsData.push({
					id: countAddresses,
					type: value.addressInputs,
					tx_id: value.txId,
				});
			}
			transactionsTable.rows.add(transactionsData);
			transactionsTable.draw(false);
		});
	};

	const hash = window.location.hash.substring(1, 13);
	if (hash === 'transactions') {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		transactionsTableDraw();
	}

});

window.navigateTransactions = () => {
	hide($welcome, $dashboard, $newAddress, $send, $myAddresses, $setPassword, $mobileMenu);
	show($main, $transactions);
	transactionsTableDraw();
};
