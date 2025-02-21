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
          "accent_light" : "#FFEBE1",
          "accent_blue" : "#00B4D8",
          "primary_dark": "#212835",
          "primary_light": "#687791",
          "button_bg": "#3D4656",
          "textInput_bg": "#e9e9e9",
          "error": "#FF6F61",
          "error_bg": "#FF9B91",
          "error_border": "#B82214",
          "green": "#63F19E",
          "error_subtle": "#6E4246",
          "green_subtle": "#25383D",





          
        },
        fontSize: {
          "hero": "30px",
          "heading": "24px",
          'text': '20px',
          "btn_title": "18px",
          "medium": "16px",
          "small": "14px",
          "extra_small": '12px',
          "icon_text": '10px'
          
        },
        fontFamily: {
          'Display': ['"Oxygen Mono"', 'serif'],
          'Sans': ['Poppins', 'sans-serif']
        },
      },
  },
  plugins: [],
};