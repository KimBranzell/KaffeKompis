import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"
	],
	safelist: ["dark"],
	theme: {
    	container: {
    		center: 'true',
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
					main: '#FD9745',
					mainAccent: '#fc7303', // not needed for shadcn components
					overlay: 'rgba(0,0,0,0.8)', // background color overlay for alert dialogs, modals, etc.

					// light mode
					bg: '#fff4e0',
					text: '#000',
					border: '#000',

					// dark mode
					darkBg: '#272933',
					darkText: '#eeefe9',
					darkBorder: '#000',
					secondaryBlack: '#212121',
    		},
    		borderRadius: {
					base: '4px',
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
				boxShadow: {
					light: '4px 4px 0px 0px #000',
					dark: '4px 4px 0px 0px #000',
				},
				translate: {
					boxShadowX: '4px',
					boxShadowY: '4px',
					reverseBoxShadowX: '-4px',
					reverseBoxShadowY: '-4px',
				},
				fontWeight: {
					base: '500',
					heading: '700',
				},
    		fontFamily: {
    			sans: [...fontFamily.sans]
    		}
    	}
    },
	plugins: [
		require('preline/plugin'),
        require("tailwindcss-animate")
    ]
};

export default config;
