import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import utils from './utils'
import vcolorpicker from 'vcolorpicker'

Vue.use(vcolorpicker)

Vue.prototype.$utils = utils

Vue.config.productionTip = false
Vue.config.devtools = false


new Vue({
	render: h => h(App),
}).$mount('#app')
