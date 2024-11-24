/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      './app/**/*.{js,jsx,ts,tsx}',
      './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
      extend: {
        colors: {
          "primary": "#2A3445",
          "accent" : "#FFC1A1",
          "primary_dark": "#212835",
          "primary_light": "#687791",
          "button_bg": "#3D4656",
          "textInput_bg": "#e9e9e9",
          "error": "#FF6F61"


          
        },
        fontSize: {
          "heading": "24px",
          'text': '20px',
          "btn_title": "18px",
          "medium": "16px",
          "small": "14px",
          "extra_small": '12px'
        },
        fontFamily: {
          'Display': ['"Oxygen Mono"', 'serif'],
          'Sans': ['Poppins', 'sans-serif']
        },
      },
  },
  plugins: [],
};