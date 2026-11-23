import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  				"m3-tertiary-fixed-dim": "#ffb3ad",
  				"m3-surface-bright": "#f7f9fb",
  				"m3-primary": "#004ac6",
  				"m3-surface-variant": "#e0e3e5",
  				"m3-on-error": "#ffffff",
  				"m3-tertiary": "#ab0b1c",
  				"m3-on-secondary-fixed-variant": "#3f465c",
  				"m3-on-primary-container": "#eeefff",
  				"m3-surface-dim": "#d8dadc",
  				"m3-on-background": "#191c1e",
  				"m3-primary-container": "#2563eb",
  				"m3-inverse-primary": "#b4c5ff",
  				"m3-surface-container-highest": "#e0e3e5",
  				"m3-on-secondary": "#ffffff",
  				"m3-outline-variant": "#c3c6d7",
  				"m3-inverse-surface": "#2d3133",
  				"m3-on-surface-variant": "#434655",
  				"m3-on-error-container": "#93000a",
  				"m3-on-tertiary-fixed": "#410004",
  				"m3-tertiary-container": "#cf2c30",
  				"m3-on-primary": "#ffffff",
  				"m3-surface-container-lowest": "#ffffff",
  				"m3-on-secondary-container": "#5c647a",
  				"m3-surface-container": "#eceef0",
  				"m3-primary-fixed-dim": "#b4c5ff",
  				"m3-inverse-on-surface": "#eff1f3",
  				"m3-surface-container-low": "#f2f4f6",
  				"m3-error": "#ba1a1a",
  				"m3-secondary-fixed": "#dae2fd",
  				"m3-secondary-fixed-dim": "#bec6e0",
  				"m3-on-primary-fixed": "#00174b",
  				"m3-error-container": "#ffdad6",
  				"m3-outline": "#737686",
  				"m3-secondary-container": "#dae2fd",
  				"m3-on-secondary-fixed": "#131b2e",
  				"m3-on-surface": "#191c1e",
  				"m3-on-tertiary-container": "#ffecea",
  				"m3-on-primary-fixed-variant": "#003ea8",
  				"m3-surface": "#f7f9fb",
  				"m3-primary-fixed": "#dbe1ff",
  				"m3-on-tertiary-fixed-variant": "#930013",
  				"m3-tertiary-fixed": "#ffdad7",
  				"m3-surface-tint": "#0053db",
  				"m3-secondary": "#565e74",
  				"m3-background": "#f7f9fb",
  				"m3-surface-container-high": "#e6e8ea",
  				"m3-on-tertiary": "#ffffff",
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
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		spacing: {
  			"m3-margin": "1rem",
  			"m3-space-lg": "1.5rem",
  			"m3-gutter-desktop": "1.25rem",
  			"m3-gutter": "0.75rem",
  			"m3-space-xs": "0.25rem",
  			"m3-space-sm": "0.5rem",
  			"m3-space-xl": "2.25rem",
  			"m3-margin-desktop": "2rem",
  			"m3-space-md": "1rem"
  		},
  		fontSize: {
  			"m3-price-display": ["20px", {"lineHeight": "26px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
  			"m3-body-lg": ["16px", {"lineHeight": "26px", "letterSpacing": "0em", "fontWeight": "400"}],
  			"m3-headline-md": ["18px", {"lineHeight": "26px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
  			"m3-label-sm": ["10px", {"lineHeight": "14px", "letterSpacing": "0.06em", "fontWeight": "700"}],
  			"m3-label-lg": ["14px", {"lineHeight": "20px", "letterSpacing": "0.02em", "fontWeight": "600"}],
  			"m3-label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "600"}],
  			"m3-headline-xl": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.03em", "fontWeight": "700"}],
  			"m3-body-sm": ["12px", {"lineHeight": "18px", "letterSpacing": "0.01em", "fontWeight": "400"}],
  			"m3-headline-lg": ["22px", {"lineHeight": "30px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
  			"m3-body-md": ["14px", {"lineHeight": "22px", "letterSpacing": "0em", "fontWeight": "400"}],
  			"m3-headline-xl-mobile": ["26px", {"lineHeight": "34px", "letterSpacing": "-0.02em", "fontWeight": "700"}]
  		},
  		fontFamily: {
  			"m3-price-display": ["var(--font-space-grotesk)", "var(--font-cairo)", "Cairo", 'sans-serif'],
  			"m3-body-lg": ["var(--font-jakarta)", "var(--font-cairo)", "Cairo", 'sans-serif'],
  			"m3-headline-md": ["var(--font-space-grotesk)", "var(--font-cairo)", "Cairo", 'sans-serif'],
  			"m3-label-sm": ["var(--font-space-grotesk)", "var(--font-cairo)", "Cairo", 'sans-serif'],
  			"m3-label-lg": ["var(--font-space-grotesk)", "var(--font-cairo)", "Cairo", 'sans-serif'],
  			"m3-label-md": ["var(--font-space-grotesk)", "var(--font-cairo)", "Cairo", 'sans-serif'],
  			"m3-headline-xl": ["var(--font-space-grotesk)", "var(--font-cairo)", "Cairo", 'sans-serif'],
  			"m3-body-sm": ["var(--font-jakarta)", "var(--font-cairo)", "Cairo", 'sans-serif'],
  			"m3-headline-lg": ["var(--font-space-grotesk)", "var(--font-cairo)", "Cairo", 'sans-serif'],
  			"m3-body-md": ["var(--font-jakarta)", "var(--font-cairo)", "Cairo", 'sans-serif'],
  			"m3-headline-xl-mobile": ["var(--font-space-grotesk)", "var(--font-cairo)", "Cairo", 'sans-serif']
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
