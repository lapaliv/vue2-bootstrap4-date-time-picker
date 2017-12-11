export default {
  props: {
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
  computed: {
    hasHours () {
      return this.hasParamsInFormat(['a', 'A', 'g', 'G', 'h', 'H'])
    },
    hasMinutes () {
      return this.hasParamsInFormat(['i'])
    },
    hasSeconds () {
      return this.hasParamsInFormat(['s'])
    },
    hasTime () {
      return this.hasHours || this.hasMinutes || this.hasSeconds
    },
    hasYear () {
      return this.hasParamsInFormat(['Y', 'y', 'L'])
    },
    hasMonth () {
      return this.hasParamsInFormat(['F', 'm', 'M', 'n'])
    },
    hasDay () {
      return this.hasParamsInFormat(['d', 'D', 'j', 'l', 'N', 'w', 'z'])
    },
    hasCalendar () {
      return this.hasYear || this.hasMonth || this.hasDay
    },
    supportFormatParams () {
      return ['d', 'D', 'j', 'l', 'N', 'w', 'z', 'W', 'F', 'm', 'M', 'n', 'L', 'Y', 'y', 'a', 'g', 'G', 'h', 'H', 'i', 's']
    }
  },
  methods: {
    /**
     * Возвращает все параметры для формата
     * @param year
     * @param month
     * @param day
     * @param hours
     * @param minutes
     * @param seconds
     * @return {{d: *, D: string, j: number, l: string, N: number, w: number, z: number, W: number, F, m: *, M, n: number, L: number, Y: number, y: *, a: string, g: number, G: number, h: *, H: *, i: *, s: *}}
     */
    getAllParamsForFormat (year, month, day, hours, minutes, seconds) {
      const isLeapYear = new Date(year, month, 29).getMonth() === 1
      const dayOfWeek = new Date(year, month, day).getDay()

      // День в году
      let countDayInYear = 0
      countDayInYear += day

      // Недель в году
      let countWeeksInYear = 0
      let allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

      let result = {
        // День
        d: this.convertToDoubleNumber(day),
        D: this.lang.shortMonday, // День недели (сокращенно)
        j: parseInt(day),
        l: this.lang.monday, // День недели (полностью)
        N: dayOfWeek === 0 ? 7 : dayOfWeek, // Порядковый номер дня недели (1 - пн, 7 - ВС)
        w: dayOfWeek, // Порядковый номер дня недели (0 - ВС, 6 - СБ)
        z: countDayInYear - 1, // Порядковый номер дня в году (начиная с 0),
        // Неделя
        W: countWeeksInYear, // Порядковый номер недели года в соответствии со стандартом ISO-8601; недели начинаются с понедельника
        // Месяц
        F: this.lang[allMonths[month].toLowerCase()], // Полное наименование месяца, например January или March
        m: this.convertToDoubleNumber(month + 1),
        M: this.lang['short' + allMonths[month]], // Сокращенное наименование месяца, 3 символа
        n: parseInt(month + 1),
        // t: parseInt(new Date().getDaysForMonth(year, month)),
        // Год
        L: isLeapYear ? 1 : 0,
        Y: parseInt(year),
        y: this.convertToDoubleNumber(year % 100),
        // Время
        a: (hours > 12 ? 'pm' : (hours === 12 && minutes > 0 ? 'pm' : (hours === 12 && minutes > 0 && seconds > 0 ? 'pm' : 'am'))),
        g: (parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours)),
        G: parseInt(hours),
        h: this.convertToDoubleNumber(hours > 12 ? hours - 12 : hours),
        H: this.convertToDoubleNumber(hours),
        i: this.convertToDoubleNumber(minutes),
        s: this.convertToDoubleNumber(seconds)
      }

      result.c = `${result.Y}-${result.m}-${result.d}T${result.H}:${result.i}:${result.s}+00:00`
      result.A = result.a.toUpperCase()

      return result
    },

    /**
     * Возвращает формат вывода
     * @return {props.printFormat|{type, default}}
     */
    getPrintFormat () {
      return this.printFormat || this.format
    },

    /**
     * Возвращает результирующий формат
     * @return {props.resultFormat|{type, default}}
     */
    getResultFormat () {
      return this.resultFormat || this.format
    },

    /**
     * Проверяет наличие символов в формате
     * @param {Array} params
     * @return {boolean}
     */
    hasParamsInFormat (params) {
      for (let char of params) {
        if (this.getPrintFormat().indexOf(char) !== -1) {
          return true
        }
      }

      return false
    },

    /**
     * Парсит строку из указанного формата
     * @param str
     * @param format
     * @return {}
     */
    parseFromFormat (str, format) {
      let formatClass = new Format(this.lang)
      let result = {}

      for (let param of format.split('')) {
        if (this.supportFormatParams.indexOf(param) === -1) {
          str = str.slice(1)
          continue
        }

        if (typeof formatClass['from' + param] === 'function') {
          let value = formatClass['from' + param](str)
          if (value === null) {
            console.log('fail', param, value)
            return null
          } else {
            str = value.str
            result = Object.assign({}, result, value)
          }
        }
      }

      return str === '' ? result : null
    }
  }
}

class Format {
  constructor (lang) {
    this.lang = lang
  }

  static parse (format, value) {

  }

  fromY (value) {
    return value.slice(0, 4) > 0 ? {
      year: parseInt(value.slice(0, 4)),
      str: value.slice(4)
    } : null
  }

  fromy (value) {
    return value.slice(0, 2) > 0 ? {
      year: parseInt(value.slice(0, 2)),
      str: value.slice(0, 2)
    } : null
  }

  fromd (value) {
    for (let index = 1; index <= 31; index++) {
      let day = (index < 10 ? '0' : '') + index
      if (value.indexOf(day) === 0) {
        return {
          day: index,
          str: value.replace(day, '')
        }
      }
    }

    return null
  }

  fromj (value) {
    for (let index = 1; index <= 31; index++) {
      if (value.indexOf(index) === 0) {
        return {
          day: index,
          str: value.replace(index, '')
        }
      }
    }

    return null
  }

  fromF (value) {
    let months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    for (let index in months) {
      if (value.indexOf(this.lang[months[index]]) === 0) {
        return {
          month: index,
          str: value.replace(this.lang[months[index]], '')
        }
      }
    }

    return null
  }

  fromm (value) {
    for (let index = 1; index <= 12; index++) {
      let month = (index < 10 ? '0' : '') + index
      if (value.indexOf(month) === 0) {
        return {
          month: index - 1,
          str: value.replace(month, '')
        }
      }
    }

    return null
  }

  fromM (value) {
    let months = ['shortJanuary', 'shortFebruary', 'shortMarch', 'shortApril', 'shortMay', 'shortJune', 'shortJuly', 'shortAugust', 'shortSeptember', 'shortOctober', 'shortNovember', 'shortDecember']
    for (let index in months) {
      if (value.indexOf(this.lang[months[index]]) === 0) {
        return {
          month: parseInt(index),
          str: value.replace(this.lang[months[index]], '')
        }
      }
    }

    return null
  }

  fromn (value) {
    for (let index = 1; index <= 12; index++) {
      if (value.indexOf(index) === 0) {
        return {
          month: index - 1,
          str: value.replace(index, '')
        }
      }
    }

    return null
  }

  fromG (value) {
    for (let index = 0; index <= 23; index++) {
      if (value.indexOf(index) === 0) {
        return {
          hours: index,
          str: value.replace(index, '')
        }
      }
    }

    return null
  }

  fromH (value) {
    for (let index = 0; index <= 23; index++) {
      let hours = (index < 10 ? '0' : '') + index
      if (value.indexOf(hours) === 0) {
        return {
          hours: index,
          str: value.replace(hours, '')
        }
      }
    }

    return null
  }

  fromi (value) {
    for (let index = 0; index <= 59; index++) {
      let minutes = (index < 10 ? '0' : '') + index
      if (value.indexOf(minutes) === 0) {
        return {
          minutes: index,
          str: value.replace(minutes, '')
        }
      }
    }

    return null
  }

  froms (value) {
    for (let index = 0; index <= 59; index++) {
      let seconds = (index < 10 ? '0' : '') + index
      if (value.indexOf(seconds) === 0) {
        return {
          seconds: index,
          str: value.replace(seconds, '')
        }
      }
    }

    return null
  }
}
