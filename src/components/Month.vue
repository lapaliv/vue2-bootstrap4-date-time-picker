<template>
    <div>
        <div class="btn-group w-100">
            <button class="btn btn-link" @click="prevMonth">
                <i class="fa fa-chevron-left"></i>
            </button>
            <button class="btn btn-link w-100">{{ months[month] }} {{ year }}</button>
            <button class="btn btn-link" @click="setToday">
                <i class="fa fa-dot-circle-o"></i>
            </button>
            <button class="btn btn-link" @click="nextMonth">
                <i class="fa fa-chevron-right"></i>
            </button>
        </div>
        <hr class="my-1">
        <table>
            <thead>
            <tr>
                <th v-for="day in days" class="text-center p-2">{{ day }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="week in daysForStartMonth">
                <td v-for="day in week" :class="getCssClassForDay(day)">
                    <div class="p-1 bg-hover-secondary cursor-hover-pointer rounded" :class="{
                            'bg-secondary text-white': isToday(day.year, day.month, day.day),
                            'bg-warning': $parent.isCheckDay(day.year, day.month, day.day)
                        }" @click="$parent.checkDay(day.year, day.month, day.day)">
                        {{ day.day }}
                    </div>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
  export default {
    props: {
      lang: {
        type: Object,
        required: true
      }
      // show: {
      //   type: Boolean,
      //   required: true
      // }
    },
    data () {
      return {
        year: null,
        month: null,
        day: null
      }
    },
    computed: {
      daysForStartMonth () {
        return this.getDaysForMonth(this.year, this.month)
      },
      months () {
        return [
          this.lang.january,
          this.lang.february,
          this.lang.march,
          this.lang.april,
          this.lang.may,
          this.lang.june,
          this.lang.july,
          this.lang.august,
          this.lang.september,
          this.lang.october,
          this.lang.november,
          this.lang.december
        ]
      },
      days () {
        return [
          this.lang.shortMonday,
          this.lang.shortTuesday,
          this.lang.shortWednesday,
          this.lang.shortThursday,
          this.lang.shortFriday,
          this.lang.shortSaturday,
          this.lang.shortSunday
        ]
      }
    },
    methods: {
      getDaysForMonth (year, month) {
        let prevMonth = month === 0 ? 11 : month - 1
        let nextMonth = month === 11 ? 0 : month + 1
        let yearForPrevMonth = prevMonth === 11 ? year - 1 : year
        let yearForNextMonth = nextMonth === 0 ? year + 1 : year

        // Определяем день недели с которого начинается этот месяц
        let firstDayInCurrentMonth = new Date(year, month).getDay() > 0 ? new Date(year, month).getDay() : 7
        // Определяем количество дней в месяце
        let countDaysInCurrentMonth = 33 - new Date(year, month, 33).getDate()
        // Определяем количество дней предыдущего месяца в первой неделе
        let countDaysPrevMonth = firstDayInCurrentMonth - 1
        // Определяем кол-во дней в предыдущем месяце и число, с которого начинается первая неделя
        let countDaysInPrevMonth = 33 - new Date(yearForPrevMonth, prevMonth, 33).getDate()
        let firstDayInPrevMonth = countDaysInPrevMonth - countDaysPrevMonth + 1
        // Определяем количество недель в текущем месяце
        let countWeeksInCurrentMonth = Math.ceil((countDaysInCurrentMonth + countDaysPrevMonth) / 7)

        // Формируем массив из дней. Дни предыдущего и следующего месяца оставляем
        let days = []
        let tmpDay = firstDayInPrevMonth
        let tmpYear = yearForPrevMonth
        let tmpMonth = prevMonth
        for (let week = 1; week <= 6; week++) {
          let arrayWeek = []
          for (let day = 1; day <= 7; day++, tmpDay++) {
            let isLostPrevMonth = week === 1 && tmpDay > countDaysInPrevMonth
            let isLostCurrentMonth = week >= countWeeksInCurrentMonth && tmpDay > countDaysInCurrentMonth

            if (isLostPrevMonth || isLostCurrentMonth) {
              tmpDay = 1
              tmpYear = isLostPrevMonth ? year : yearForNextMonth
              tmpMonth = isLostPrevMonth ? month : nextMonth
            }

            arrayWeek.push({
              year: tmpYear,
              month: tmpMonth,
              day: tmpDay,
              disabled: false,
              muted: tmpYear !== year || tmpMonth !== month
            })
          }
          days.push(arrayWeek)
        }

        return days
      },
      getCssClassForDay (day) {
        return {
          'p-1 text-center': true,
          'text-muted': day.muted,
          'disabled': day.disabled
        }
      },
      prevMonth () {
        if (this.month === 0) {
          this.month = 11
          this.year -= 1
        } else {
          this.month -= 1
        }
      },
      nextMonth () {
        if (this.month === 11) {
          this.month = 0
          this.year += 1
        } else {
          this.month += 1
        }
      },
      setToday () {
        if (this.$parent.hasYear) {
          this.year = (new Date()).getFullYear()
        }
        if (this.$parent.hasMonth) {
          this.month = (new Date()).getMonth()
        }
        if (this.$parent.hasDay) {
          this.day = (new Date()).getDate()
        }

        this.$parent.checkDay(this.year, this.month, this.day)
      },
      isToday (year, month, day) {
        const todayYear = (new Date()).getFullYear()
        const todayMonth = (new Date()).getMonth()
        const todayDay = (new Date()).getDate()

        return year === todayYear && month === todayMonth && day === todayDay
      }
    },
    watch: {
      '$parent.start' (start) {
        this.year = start.year
        this.month = start.month
        this.day = start.day
      }
    },
    mounted () {
      this.$nextTick(() => {
        this.year = this.$parent.start.year
        this.month = this.$parent.start.month
        this.day = this.$parent.start.day
      })
    }
  }
</script>


<style scoped>
    .bg-hover-secondary:hover {
        background: #eee;
    }

    .cursor-hover-pointer:hover {
        cursor: pointer;
    }
</style>