const google = require('eslint-config-google');

if (google.rules['valid-jsdoc']) {
	delete google.rules['valid-jsdoc'];
	delete google.rules['require-jsdoc'];
}

module.exports = [
	google,
	{
		languageOptions: {
			parserOptions: {
				ecmaVersion: 13,
			},
		},
		rules: {
			'no-unused-vars': 'off',
			'no-tabs': 'off',
			'one-var': 'off',
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
