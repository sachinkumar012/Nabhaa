/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1A73E8', // Medical Blue
                    50: '#E3F2FD',
                    100: '#BBDEFB',
                    200: '#90CAF9',
                    300: '#64B5F6',
                    400: '#42A5F5',
                    500: '#1A73E8',
                    600: '#1E88E5',
                    700: '#1976D2',
                    800: '#1565C0',
                    900: '#0D47A1',
                },
                secondary: {
                    DEFAULT: '#4FC3F7', // Light Blue
                    50: '#E1F5FE',
                    100: '#B3E5FC',
                    200: '#81D4FA',
                    300: '#4FC3F7',
                    400: '#29B6F6',
                    500: '#03A9F4',
                    600: '#039BE5',
                    700: '#0288D1',
                    800: '#0277BD',
                    900: '#01579B',
                },
                accent: {
                    DEFAULT: '#00BFA6', // Teal
                    50: '#E0F2F1',
                    100: '#B2DFDB',
                    200: '#80CBC4',
                    300: '#4DB6AC',
                    400: '#26A69A',
                    500: '#009688',
                    600: '#00897B',
                    700: '#00796B',
                    800: '#00695C',
                    900: '#004D40',
                },
                background: '#F7F9FC', // Soft White/Grey
                text: '#1A1A1A', // Dark Grey
                surface: '#FFFFFF',
            },
            fontFamily: {
                sans: ['Inter', 'Poppins', 'sans-serif'],
            },
            boxShadow: {
                'soft-sm': '0 2px 8px rgba(0, 0, 0, 0.05)',
                'soft-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
                'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
        },
    },
    plugins: [],
}
