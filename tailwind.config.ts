
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
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
				garden: {
					flower: '#E5DEFF',
					bud: '#D3E4FD',
					stem: '#F2FCE2'
				},
				typegarden: {
					light: '#F6F6F7',
					dark: '#1A1F2C',
					accent: '#8B5CF6',
					muted: '#8E9196',
					surface: 'rgba(255, 255, 255, 0.8)'
				}
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
				},
				'bloom': {
					'0%': { transform: 'scale(0.8)', opacity: '0.7' },
					'50%': { transform: 'scale(1.05)', opacity: '0.85' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'pulse-gentle': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.03)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-left': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-right': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'bloom': 'bloom 1.2s ease-in-out forwards',
				'fade-in': 'fade-in 0.6s ease-out forwards',
				'float': 'float 3s ease-in-out infinite',
				'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
				'slide-up': 'slide-up 0.4s ease-out forwards',
				'slide-down': 'slide-down 0.4s ease-out forwards', 
				'slide-left': 'slide-left 0.4s ease-out forwards',
				'slide-right': 'slide-right 0.4s ease-out forwards',
				'scale-in': 'scale-in 0.3s ease-out forwards'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
				mono: ['SF Mono', 'monospace']
			},
			backdropFilter: {
				'none': 'none',
				'blur': 'blur(8px)'
			},
			boxShadow: {
				'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
				'card': '0px 2px 8px rgba(0, 0, 0, 0.05)',
				'elevated': '0px 8px 24px rgba(0, 0, 0, 0.08)',
				'button': '0px 1px 2px rgba(0, 0, 0, 0.05)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
