import DataTable from 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css';

import { hide, show, dataTableParams, dateTimeFormat } from '../utils';
import { locationDefault, copyToBuffer, humanAmountFormat, hideDataTablePagingIfOnlyOnePage } from '../app';
import { getAddressUnconfirmedInfo, getAddressInfo } from '../api';

const transactionsTable = new DataTable($dom.transactionsTable,
	Object.assign({}, dataTableParams, {
		columnDefs: [
			{
				className: 'dtr-control',
				orderable: false,
				targets: 0,
			},
		],
		order: [ 1, 'asc' ],
		responsive: {
			details: {
				type: 'column',
				target: 'tr',
			},
		},
	}, {
		columns: [
			{ render: () => { return null; } },
			{ data: 'id', render: (row, display, column) => {
				let $html = '<div class="d-flex align-items-baseline">';
				$html += `<div class="flex-fill">${column.id}</div>`;
				if (column.confirmations === '-') $html += `
					<div class="flex-fill">
						<div class="spinner-border spinner-border-sm" role="status">
							<span class="sr-only">Loading...</span>
						</div>
					</div>
				`;
				$html += '</div>';
				return $html;
			} },
			{ data: 'timestamp', render: dateTimeFormat, className: 'text-center desktop' },
			{ data: 'tx_id', render: (data) => (`<input type="text" class="form-control-plaintext form-control-sm" value="${data}" readonly="">`), width: '30%', className: 'text-center desktop' },
			{ data: 'amount', render: (data) => {
				let className = 'danger';
				let text = 'Sended';
				if (data > 0) {
					className = 'success';
					text = 'Received';
				}
				return `<span class="badge bg-${className}">${text}</span>`;
			}, className: 'text-center' },
			{ data: 'amount', render: humanAmountFormat },
			{ data: 'confirmations', className: 'none' },
			{ data: 'block_height', className: 'none' },
			{ data: 'fee', className: 'none', render: humanAmountFormat },
			{ data: 'rbf', className: 'none', render: (data) => (data ? 'Yes' : 'No') },
			{ data: 'coinbase', className: 'none', render: (data) => (data ? 'Yes' : 'No') },
			{ data: 'tx_id', render: (data) => (
				`<a class="btn btn-outline-secondary btn-sm d-inline-flex" target="_blank" href="https://bgl.bitaps.com/${data}"><i class="fa-solid fa-binoculars mt-1"></i><span class="hidden-sr ms-1">Explorer</span></a>`
			), className: 'd-flex justify-content-end' },
		],
		drawCallback: (oSettings) => {
			$dom.transactionsTable.querySelectorAll('input').forEach(($input) => {
				$input.addEventListener('click', () => copyToBuffer($input));
			});

			hideDataTablePagingIfOnlyOnePage(oSettings);
		},
	}),
)
		.on('responsive-display', (e, datatable, row, showHide) => {
			if ( ! showHide) return;
			const $row = row.selector.rows[0];
			if ( ! $row) return;
			const $subRow = $row.nextElementSibling;
			const $input = $subRow.querySelector('input');
			if ($input) $input.addEventListener('click', (e) => copyToBuffer(e.target));
		});

window.transactionsTableDraw = () => {
	transactionsTable.clear();
	transactionsTable.draw(false);
	const address = window.location.hash.substr(14, 43);
	if ( ! address) return;

	let countAddresses = 0;
	const transactionsData = [];
	const addToTransactionData = (apiAddressInfo) => {
		for (const key in apiAddressInfo.list) {
			countAddresses++;
			const value = apiAddressInfo.list[key];
			transactionsData.push({
				DT_RowClass: ! value.confirmations ? 'table-warning' : null,
				id: countAddresses,
				tx_id: value.txId,
				timestamp: value.timestamp,
				amount: value.amount,
				confirmations: value.confirmations ? value.confirmations : '-',
				block_height: value.blockHeight ? value.blockHeight : '-',
				rbf: value.rbf,
				coinbase: value.coinbase,
				fee: value.fee,
			});
		}
	};
	getAddressUnconfirmedInfo(address, (apiAddressUnconfirmedInfo) => {
		addToTransactionData(apiAddressUnconfirmedInfo);
		getAddressInfo(address, (apiAddressInfo) => {
			addToTransactionData(apiAddressInfo);
			transactionsTable.rows.add(transactionsData);
			transactionsTable.draw(false);

			const isReload = window.location.hash.substr(-6) === 'reload' ? true : false;
			if (apiAddressUnconfirmedInfo.list.length > 0) {
				window.setTimeout(() => {
					if ( ! isReload) window.transactionsTableDraw();
					else window.location.hash = `transactions/${address}`;
				}, 60000);
			}
			else if (isReload) window.setTimeout(() => window.transactionsTableDraw(), 3000);
		});
	});
};

window.navigateTransactions = () => {
	hide($dom.welcome, $dom.dashboard, $dom.newAddress, $dom.send, $dom.myAddresses, $dom.setPassword, $dom.mobileMenu);
	show($dom.main, $dom.transactions);
	const address = window.location.hash.substring(14);
	if (address) window.transactionsTableDraw();
	else window.location.hash = locationDefault;
};
