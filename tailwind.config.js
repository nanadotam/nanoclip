/** @type {import('tailwindcss').Config} */

const {
	default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");
const { fontFamily } = require('tailwindcss/defaultTheme')


module.exports = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			fontFamily: {
				sans: ['var(--font-mono-sans)', ...fontFamily.sans],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			animation: {
				tilt: "tilt 10s infinite linear",
			},
			keyframes: {
				tilt: {
					"0%, 50%, 100%": {
						transform: "rotate(0deg)",
					},
					"25%": {
						transform: "rotate(0.5deg)",
					},
					"75%": {
						transform: "rotate(-0.5deg)",
					},
				},
			},
		}
	},
	plugins: [function addVariablesForColors({ addBase, theme }) {
		let allColors = flattenColorPalette(theme("colors"));
		let newVars = Object.fromEntries(
			Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
		);
	
		addBase({
			":root": newVars,
		});
	}, require("tailwindcss-animate")],
};
