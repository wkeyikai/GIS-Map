import './lib/excanvas_r3/excanvas.js'
import './lib/gis.css'
import gisMap from './components/gis-map.vue'
import gisLine from './components/gis-line.vue'
import gisMark from './components/gis-mark.vue'

export default {
	install(app) {
		console.log('test')
		// app.config.globalProperties.$gis = gis
		app.component('gisMap', gisMap)
		app.component('gisLine', gisLine)
		app.component('gisMark', gisMark)
	}
}