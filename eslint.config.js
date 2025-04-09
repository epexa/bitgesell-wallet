import google from 'eslint-config-google';

if (google.rules['valid-jsdoc']) {
	delete google.rules['valid-jsdoc'];
	delete google.rules['require-jsdoc'];
}

export default [
	google,
	{
		files: [ '*.js' ],
		languageOptions: {
			globals: {
				console: 'readonly',
				process: 'readonly',
			},
		},
	},
	{
		languageOptions: {
			parserOptions: {
				ecmaVersion: 13,
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				$dom: 'readonly',
			},
		},
		rules: {
			'no-undef': 'error',
			'no-tabs': 'off',
			'brace-style': [ 'error', 'stroustrup', { allowSingleLine: true } ],
			'max-len': 'off',
			'no-multiple-empty-lines': [ 'error', { max: 1, maxBOF: 1 } ],
			'padded-blocks': 'off',
			'curly': 'off',
			'object-curly-spacing': [ 'error', 'always' ],
			'block-spacing': [ 'error', 'always' ],
			'array-bracket-spacing': [ 'error', 'always' ],
			'prefer-template': 'error',
			'new-cap': 'off',
			'guard-for-in': 'off',
			'quotes': [ 'error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': false } ],
			'indent': [
				'error',
				'tab',
				{
					CallExpression: { arguments: 1 },
					FunctionDeclaration: { body: 1, parameters: 2 },
					FunctionExpression: { body: 1, parameters: 2 },
					MemberExpression: 2,
					ObjectExpression: 1,
					SwitchCase: 1,
					ignoredNodes: [ 'ConditionalExpression', 'VariableDeclarator' ],
				},
			],
		},
	},
];
