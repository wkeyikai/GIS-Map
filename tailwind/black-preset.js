module.exports = {
  theme: {
    colors: {
      positive: {
        DEFAULT: '#11AC19'
      }
    },
    extend: {
      lineHeight: {
        4.5: '18px'
      },
      boxShadow: {
        low: '0px 8.14815px 6.51852px rgba(0, 0, 0, 0.0274815), 0px 1.85185px 3.14815px rgba(0, 0, 0, 0.0168519)',
        md: '0px 38.5185px 25.4815px rgba(0, 0, 0, 0.0425185), 0px 20px 13px rgba(0, 0, 0, 0.035), 0px 8.14815px 6.51852px rgba(0, 0, 0, 0.0274815), 0px 1.85185px 3.14815px rgba(0, 0, 0, 0.0168519)'
      },
      inset: {
        nav: '96px'
      },
      width: {
        page: '92%'
      },
      padding: {
        page: '24px',
        nav: '1.5rem'
      },
      margin: {
        page: '4%',
        nav: '96px'
      },
      height: {
        btn: '44px',
        'btn-lg': '52px',
        'btn-sm': '36px'
      },
      zIndex: {
        5: '5',
        10: '10',
        15: '15',
        25: '25'
      },
      colors: {
        gradient: {
          nav: 'radial-gradient(100% 229.03% at 100% 0%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%), #0A3A99;'
        },
        // accent
        accent: {
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)'
        },
        // semantic
        semantic: {
          negtive: 'var(--color-semantic-negtive)',
          positive: 'var(--color-semantic-positive)',
          warning: 'var(--color-semantic-warning)',
          proactive: 'var(--color-semantic-proactive)',
          promo: 'var(--color-semantic-promo)',
          ease: 'var(--color-semantic-ease)',
          process: 'var(--color-semantic-process)',
          loading: 'var(--color-semantic-loading)',
          dramatic: 'var(--color-semantic-dramatic)'
        },
        // bg-primary-500
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          1000: 'var(--color-primary-1000)',
          1100: 'var(--color-primary-1100)'
        },
        // secondary
        secondary: {
          floor: 'var(--color-secondary-floor)',
          navbar: 'var(--color-secondary-navbar)',
          0: 'var(--color-secondary-000)',
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          200: 'var(--color-secondary-200)',
          300: 'var(--color-secondary-300)',
          400: 'var(--color-secondary-400)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
          800: 'var(--color-secondary-800)',
          900: 'var(--color-secondary-900)'
        },
        // neutral
        neutral: {
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
          dark: 'var(--color-neutral-dark)',
          light: 'var(--color-neutral-light)'
        },
        // alpha
        alpha: {
          DEFAULT: 'alpha',
          'light-05': 'rgba(255, 255, 255, 0.05)',
          'light-10': 'rgba(255, 255, 255, 0.1)',
          'light-20': 'rgba(255, 255, 255, 0.2)',
          'light-40': 'var(--color-light-40)',
          'light-50': 'var(--color-light-50)',
          'light-60': 'rgba(255, 255, 255, 0.6)',
          'light-70': 'var(--color-light-70)',
          'light-80': 'var(--color-light-80)',
          'light-100': 'var(--color-light-100)',
          // 'dark-60': 'var(--color-dark-60)',
          'dark-10': 'var(--color-dark-10)',
          'dark-20': 'var(--color-dark-20)',
          'dark-40': 'var(--color-dark-40)',
          'dark-50': 'var(--color-dark-50)',
          'dark-70': 'var(--color-dark-70)',
          'dark-60': 'var(--color-dark-60)',
          'dark-80': 'var(--color-dark-80)'
        },
        transparent: {
          DEFAULT: 'var(--color-transparent-DEFAULT)',
          'dark-05': 'var(--color-dark-05)',
          'dark-10': 'var(--color-dark-10)',
          'dark-20': 'var(--color-dark-20)',
          'dark-40': 'var(--color-dark-40)',
          'dark-60': 'var(--color-dark-60)',
          'dark-80': 'var(--color-dark-80)',
          'light-10': 'var(--color-light-10)',
          'light-20': 'var(--color-light-20)',
          'light-40': 'var(--color-light-40)',
          'light-50': 'var(--color-light-50)',
          'light-60': 'var(--color-light-60)',
          'light-80': 'var(--color-light-80)'
        },
        aurora: {
          DEFAULT: '#03FC96'
        },
        white: {
          DEFAULT: 'var(--color-white-DEFAULT)',
          'opacity-05': 'var(--color-white-opacity-05)',
          'opacity-1': 'var(--color-white-opacity-1)',
          'opacity-2': 'var(--color-white-opacity-2)',
          'opacity-3': 'var(--color-white-opacity-3)',
          'opacity-4': 'var(--color-white-opacity-4)',
          'opacity-5': 'var(--color-white-opacity-5)',
          'opacity-6': 'var(--color-white-opacity-6)',
          'opacity-7': 'var(--color-white-opacity-7)',
          'opacity-8': 'var(--color-white-opacity-8)',
          'opacity-9': 'var(--color-white-opacity-9)'
        },
        black: {
          DEFAULT: 'var(--color-black-DEFAULT)'
        },
        negative: {
          DEFAULT: 'var(--color-negative-DEFAULT)'
        },
        warning: {
          DEFAULT: 'var(--color-warning-DEFAULT)'
        },
        positive: {
          DEFAULT: 'var(--color-positive-DEFAULT)'
        }
      }
    }
  }
}
