<template>
    <div class="input-group" @click.stop="focus" :class="{'above': isAbove}" :style="{zIndex: show ? 1100 : null}">
        <input type="text"
               class="form-control"
               :placeholder="$parent.placeholder"
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
            <component is="month-template"
                       :lang="lang"
                       v-if="hasCalendar"
                       v-show="mode === MODE_DAYS"
                       :date="start"></component>
            <component is="time-template"
                       v-if="hasTime"
                       v-show="mode === MODE_TIME"
                       :start-hours="start.hours"
                       :start-minutes="start.minutes"
                       :start-seconds="start.seconds"
                       @startHours="inputTime('start', 'hours', $event)"
                       @startMinutes="inputTime('start', 'minutes', $event)"
                       @startSeconds="inputTime('start', 'seconds', $event)"
            ></component>
        </div>
    </div>
</template>

<script>
  import MonthTemplate from './Month.vue'
  import TimeTemplate from './Time.vue'
  import formats from '../mixins/formats'
  import i18n from '../mixins/i18n.js'
  import * as constants from '../constants'

  export default {
    components: {MonthTemplate, TimeTemplate},
    mixins: [i18n, formats],
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
        prefferedOpenDirection: 'below',
        oldScroll: 0
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
        document.body.click()
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
          year,
          month,
          day,
          hours: this.start.hours,
          minutes: this.start.minutes,
          seconds: this.start.seconds
        }

        this.inputValue = this.convertToFormat(this.getPrintFormat(), this.start)
        if (this.hasTime) {
          this.mode = constants.MODE_TIME
        }
      },
      trash () {
        this.clear()
      },
      inputTime (type, name, value) {
        let data = Object.assign({}, this[type])
        data[name] = value
        this[type] = data
      },
      /**
       * Конвертирует указанную дату в нужный формат
       * @param format
       * @param date
       * @return {*}
       */
      convertToFormat (format, date) {
        const all = this.getAllParamsForFormat(date.year, date.month, date.day, date.hours, date.minutes, date.seconds)
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
        this.mode = this.hasCalendar ? constants.MODE_DAYS : constants.MODE_TIME
        const defaultValues = this.$parent.default

        let start = {
          year: null,
          month: null,
          day: null,
          hours: 0,
          minutes: 0,
          seconds: 0
        }

        // year
        if (defaultValues instanceof Object && defaultValues.year) {
          start.year = defaultValues.year
        } else if (this.hasYear) {
          start.year = new Date().getFullYear()
        }

        // month
        if (defaultValues instanceof Object && defaultValues.month) {
          start.month = defaultValues.month
        } else if (this.hasMonth) {
          start.month = new Date().getMonth()
        }

        // day
        if (defaultValues instanceof Object && defaultValues.day) {
          start.day = defaultValues.day
        }

        // time
        if (defaultValues instanceof Object && defaultValues.hours) {
          start.hours = defaultValues.hours
        }
        if (defaultValues instanceof Object && defaultValues.minutes) {
          start.minutes = defaultValues.minutes
        }
        if (defaultValues instanceof Object && defaultValues.seconds) {
          start.seconds = defaultValues.seconds
        }

        this.start = start
      },
      changeInputValue (event) {
        let parse = this.parseFromFormat(event.target.value, this.getPrintFormat())
        if (parse === null) {
          this.clear()
          this.inputValue = event.target.value
          this.$emit('input', event.target.value)
        } else {
          this.start = Object.assign({}, this.start, parse)
        }
      },

      /**
       * Вычисляет позицию выпадающего списка
       */
      computedDropdownPosition () {
        if (typeof window === 'undefined') return

        const spaceAbove = this.$el.getBoundingClientRect().top
        const spaceBelow = window.innerHeight - this.$el.getBoundingClientRect().bottom
        const hasEnoughSpaceBelow = spaceBelow > 400

        if (hasEnoughSpaceBelow || spaceBelow > spaceAbove || this.openDirection === 'below' || this.openDirection === 'bottom') {
          this.prefferedOpenDirection = 'below'
          this.optimizedHeight = Math.min(spaceBelow - 40, 400)
        } else {
          this.prefferedOpenDirection = 'above'
          this.optimizedHeight = Math.min(spaceAbove - 40, 400)
        }
      }
    },
    watch: {
      show (show) {
        if (show) {
          this.mode = this.hasCalendar ? constants.MODE_DAYS : constants.MODE_TIME
        }
      },
      '$parent.value' (date) {
        if (date && this.parseFromFormat(date, this.getResultFormat()) !== null) {
          this.start = this.parseFromFormat(date, this.getResultFormat())
        } else {
          this.clear()
        }
      },
      start (start) {
        const hasDay = !this.hasCalendar || start.day !== null
        const hasHours = !this.hasTime || start.hours !== null

        if (hasDay && hasHours) {
          this.inputValue = this.convertToFormat(this.getPrintFormat(), start)
          this.$emit('input', this.convertToFormat(this.getResultFormat(), start))
        }
      }
    },
    mounted () {
      this.$nextTick(() => {
        if (this.$parent.value && this.$parent.value.length) {
          let parse = this.parseFromFormat(this.$parent.value, this.getResultFormat())
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
      
      let el = this.$el
      do {
        el = el.parentNode
        if (el) {
          el.addEventListener('click', () => {
            this.show = false
          })
        }
      } while(el)
      
      this.oldScroll = window.scrollY
      window.addEventListener('scroll', () => {
        if(window.scrollY + 100 > this.oldScroll) {
          this.show = false
          this.oldScroll = window.scrollY
        }
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
        border-right: 1px solid rgba(0, 0, 0, .15);
        border-top-right-radius: .25rem;
        border-bottom-right-radius: .25rem;
        z-index: 0;
    }
</style>
