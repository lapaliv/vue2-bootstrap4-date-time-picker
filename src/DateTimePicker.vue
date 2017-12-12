<template>
    <div class="form-group" ref="el">
        <label>{{ label }}</label>
        <div class="input-group" @click.stop="show = true" :class="{'above': isAbove}">
            <input type="text"
                   class="form-control"
                   :placeholder="placeholder"
                   :value="inputValue"
                   @input="changeInputValue"
                   @focus="focus"
            >
            <span class="input-group-addon">
                    <i class="fa fa-calendar"></i>
                </span>
            <div class="dropdown-menu dtp-dropdown px-2 py-1 mt-5"
                 :class="{'above': isAbove}"
                 v-show="show"
                 ref="dropdown"
                 @click.stop="show = true">
                <div class="w-100">
                    <button v-if="hasCalendar"
                            class="btn btn-sm"
                            :class="{'btn-link': mode !== MODE_DAYS, 'btn-primary': mode === MODE_DAYS}"
                            @click="mode = MODE_DAYS"
                    >
                        <i class="fa fa-calendar-check-o"></i>
                    </button>
                    <button v-if="hasTime"
                            class="btn btn-sm"
                            :class="{'btn-link': mode !== MODE_TIME, 'btn-primary': mode === MODE_TIME}"
                            @click="mode = MODE_TIME"
                    >
                        <i class="fa fa-clock-o"></i>
                    </button>
                    <button class="btn btn-sm btn-link pull-right" @click="trash" :disabled="inputValue === null">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
                <hr class="my-1">
                <component is="month-template" :lang="lang" v-show="mode === MODE_DAYS" :date="start"></component>
                <component is="time-template"
                           v-show="hasTime && mode === MODE_TIME"
                           :start-hours="start.hours"
                           :start-minutes="start.minutes"
                           :start-seconds="start.seconds"
                           @startHours="inputTime('start', 'hours', $event)"
                           @startMinutes="inputTime('start', 'minutes', $event)"
                           @startSeconds="inputTime('start', 'seconds', $event)"
                ></component>
            </div>
        </div>
    </div>
</template>

<script>
  import MonthTemplate from './components/Month.vue'
  import TimeTemplate from './components/Time.vue'
  import formats from './mixins/formats'
  import i18n from './mixins/i18n.js'
  import * as constants from './constants'

  export default {
    components: {MonthTemplate, TimeTemplate},
    mixins: [i18n, formats],
    props: {
      placeholder: {
        type: String,
        'default': 'Please focus'
      },
      label: {
        type: String,
        'default': 'Label for date picker'
      },
      value: {
        type: String,
        'default': null
      },
      position: {
        type: String,
        'default': 'top',
        // 'default': 'bottom left',
        validator: function (value) {
          return ['bottom', 'top', 'bottom left', 'bottom right', 'top left', 'top right'].indexOf(value) !== -1
        }
      },
      default: {
        type: Object
      }
    },
    data () {
      return {
        show: false,
        mode: null,
        inputValue: null,
        start: {
          year: null,
          month: null,
          day: null,
          hours: 0,
          minutes: 0,
          seconds: 0
        },
        openDirection: '',
        prefferedOpenDirection: 'below'
      }
    },
    computed: {
      MODE_DAYS () {
        return constants.MODE_DAYS
      },
      MODE_YEARS () {
        return constants.MODE_YEARS
      },
      MODE_TIME () {
        return constants.MODE_TIME
      },
      isAbove () {
        if (this.openDirection === 'above' || this.openDirection === 'top') {
          return true
        } else if (this.openDirection === 'below' || this.openDirection === 'bottom') {
          return false
        } else {
          return this.prefferedOpenDirection === 'above'
        }
      }
    },
    methods: {
      focus () {
        this.computedDropdownPosition()
        this.show = true
      },
      isCheckDay (year, month, day) {
        if (this.start.year === null) {
          return false
        }

        return this.start.year === year && this.start.month === month && this.start.day === day
      },
      checkDay (year, month, day) {
        this.start = {
          year, month, day,
          hours: this.start.hours,
          minutes: this.start.minutes,
          seconds: this.start.seconds
        }

        this.inputValue = this.convertToFormat(this.getPrintFormat(), this.start)
        if (this.hasTime &&
          (!this.hasHours || !this.start.hours) &&
          (!this.hasMinutes || !this.start.minutes) &&
          (!this.hasSeconds || !this.start.seconds)
        ) {
          this.mode = constants.MODE_TIME
        }
      },
      trash () {
        this.clear()
      },
      inputTime (type, name, value) {
        this[type][name] = value
        if (this.start.day) {
          this.inputValue = this.convertToFormat(this.getPrintFormat(), this[type])
        }
      },
      /**
       * Конвертирует указанную дату в нужный формат
       * @param format
       * @param data
       * @return {*}
       */
      convertToFormat (format, data) {
        const all = this.getAllParamsForFormat(data.year, data.month, data.day, data.hours, data.minutes, data.seconds)
        for (let key in all) {
          format = format.replace(key, all[key])
        }

        return format
      },
      convertToDoubleNumber (number) {
        if (number < 10) {
          return '0' + parseInt(number)
        }

        return number
      },
      clear () {
        this.inputValue = null
        this.mode = constants.MODE_DAYS
        this.start = {
          year: this.default && this.default.year ? this.default.year : new Date().getFullYear(),
          month: this.default && this.default.month ? this.default.month : new Date().getMonth(),
          day: this.default && this.default.day ? this.default.day : null,
          hours: this.default && this.default.hours ? this.default.hours : 0,
          minutes: this.default && this.default.minutes ? this.default.minutes : 0,
          seconds: this.default && this.default.seconds ? this.default.seconds : 0
        }
      },
      changeInputValue (event) {
        let parse = this.parseFromFormat(event.target.value, this.getPrintFormat())
        if (parse === null) {
          this.clear()
          this.inputValue = event.target.value
        } else {
          this.start = Object.assign({}, this.start, parse)
          this.inputValue = this.convertToFormat(this.getPrintFormat(), this.start)
        }
      },

      /**
       * Вычисляет позицию выпадающего списка
       */
      computedDropdownPosition () {
        if (typeof window === 'undefined') return

        const spaceAbove = this.$el.getBoundingClientRect().top
        const spaceBelow = window.innerHeight - this.$el.getBoundingClientRect().bottom
        const hasEnoughSpaceBelow = spaceBelow > 377

        if (hasEnoughSpaceBelow || spaceBelow > spaceAbove || this.openDirection === 'below' || this.openDirection === 'bottom') {
          this.prefferedOpenDirection = 'below'
          this.optimizedHeight = Math.min(spaceBelow - 40, 377)
        } else {
          this.prefferedOpenDirection = 'above'
          this.optimizedHeight = Math.min(spaceAbove - 40, 377)
        }
      }
    },
    watch: {
      inputValue (date) {
        if (date && this.parseFromFormat(date, this.getPrintFormat()) !== null) {
          this.$emit('input', this.convertToFormat(this.getResultFormat(), this.start))
        } else {
          this.$emit('input', date)
        }
      },
      show (show) {
        if (show) {
          this.mode = this.MODE_DAYS
        }
      }
    },
    mounted () {
      this.$nextTick(() => {
        if (this.value && this.value.length) {
          let parse = this.parseFromFormat(this.value, this.getResultFormat())
          if (parse === null) {
            this.clear()
          } else {
            this.start = Object.assign({}, parse)
            this.inputValue = this.convertToFormat(this.getPrintFormat(), parse)
          }
        } else {
          this.clear()
        }
      })

      document.addEventListener('click', () => {
        this.show = false
      })
    }
  }
</script>

<style scoped>
    .dtp-dropdown {
        position: absolute;
        display: block;
        top: auto;
    }

    .bg-hover-secondary:hover {
        background: #eee;
    }

    .cursor-hover-pointer:hover {
        cursor: pointer;
    }

    .position-bottom {
        margin-top: -12px;
    }

    .top-days {
        margin-top: -435px;
    }

    .top-time {
        margin-top: -435px;
    }

    .above .dtp-dropdown {
        bottom: 100%;
    }

    .input-group {
        position: relative;
    }
</style>