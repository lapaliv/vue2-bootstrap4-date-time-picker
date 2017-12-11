import modules from '../i18n'

const DEFAULT_LANGUAGE = 'ru'

export default {
  props: {
    i18n: {
      type: [Object, String],
      'default': DEFAULT_LANGUAGE,
      validator: function (value) {
        if (typeof value === 'string') {
          return modules.hasOwnProperty(value)
        }

        return true
      }
    }
  },
  computed: {
    lang () {
      if (typeof this.i18n === 'object') {
        return Object.assign({}, this.i18n, modules[DEFAULT_LANGUAGE])
      }

      return modules[this.i18n]
    }
  }
}
