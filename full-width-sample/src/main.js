    import { createApp } from 'vue'
    import App from './App.vue'

    // Vuetify
    import 'vuetify/styles'
    import { createVuetify } from 'vuetify'
    import * as components from 'vuetify/components'
    import * as directives from 'vuetify/directives'

    const vuetify = createVuetify({
      components,
      directives,
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            primary: '#1976D2',
            secondary: '#424242',
            accent: '#82B1FF',
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FFC107'
          },
          dark: {
            primary: '#2196F3',
            secondary: '#424242',
            accent: '#FF4081',
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FFC107'
          }
        }
      }
    })

    const app = createApp(App)
    app.use(vuetify)
    app.mount('#app')
