/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
		'./app/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {},
		plugins: [],
		colors: {
			primarytext: '#f3f3f3',
			primarybg: '#212121',
			secondarybg: '#121212',
			primaryaccent: '#343434',
			secondaryaccent: '#737373',
			primary: '#1db954',
		},
	},
};
