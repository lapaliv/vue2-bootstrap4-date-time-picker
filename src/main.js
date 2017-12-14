// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import DateTimePicker from './DateTimePicker.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome/css/font-awesome.min.css'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<div><DateTimePicker v-model="date" print-format="Y-m-d H:i" :default="{hours: 23}"/> value: {{ date }}</div>',
  data () {
    return {
      date: null
    }
  },
  components: {DateTimePicker}
})
