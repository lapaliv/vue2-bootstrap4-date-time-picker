<template>
    <div class="form-group" ref="el" v-if="label">
        <label>{{ label }}</label>
        <component is="picker" @input="input" :format="format" :resultFormat="resultFormat" :printFormat="printFormat"></component>
    </div>
    <component is="picker" @input="input" :format="format" :resultFormat="resultFormat" :printFormat="printFormat" v-else></component>
</template>

<script>
  import Picker from './components/Picker'

  export default {
    components: {Picker},
    props: {
      placeholder: {
        type: String,
        'default': 'Please focus'
      },
      label: {
        type: String,
        'default': null
      },
      value: {
        type: String,
        'default': null
      },
      default: {
        type: Object
      },
      format: {
        type: String,
        'default': 'Y-m-d H:i:s'
      },
      resultFormat: {
        type: String,
        'default': null
      },
      printFormat: {
        type: String,
        'default': null
      }
    },
    methods: {
      input (value) {
        this.$emit('input', value)
      }
    }
  }
</script>