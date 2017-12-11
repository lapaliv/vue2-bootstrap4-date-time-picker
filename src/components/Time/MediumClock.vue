<template>
    <div class="bg-light rounded-circle clock" v-show="show">
        <div class="clock-tick rounded px-1 bg-hover-secondary cursor-hover-pointer"
             @click="input(tick.value)"
             v-for="tick in ticks"
             :class="{'bg-warning': parseInt(tick.value) === value }"
             :style="{top: tick.top, left: tick.left}">
            {{ tick.value }}
        </div>
    </div>
</template>

<script>
  export default {
    props: {
      step: {
        type: Number,
        required: true,
        validator: function (value) {
          return value >= 1 && value <= 5
        }
      },
      rows: {
        type: Number,
        required: true,
        validator: function (value) {
          return [1, 2].indexOf(value) !== -1
        }
      },
      max: {
        type: Number,
        required: true,
        validator: function (value) {
          return [59, 23].indexOf(value) !== -1
        }
      },
      value: {
        type: Number,
        required: true,
        validator: function (value) {
          return value >= 0
        }
      },
      show: {
        type: Boolean,
        required: true
      }
    },
    computed: {
      ticks () {
        if (!this.show) return []

        let result = []
        const degree = 360 / ((this.max + 1) / this.rows)

        let padding = 20
        for (let number = 0; number <= this.max; number += this.step) {
          if (number > 0 && number % Math.floor((this.max + 1) / this.rows) === 0) {
            padding += 30
          }

          let degreeForNumber = Math.PI * number * degree / 180
          let top = (this.y + (this.radius - padding) * Math.sin(degreeForNumber - Math.PI / 2))
          let left = (this.x + (this.radius - padding) * Math.cos(degreeForNumber - Math.PI / 2))

          result.push({
            value: (number < 10 ? '0' : '') + parseInt(number),
            top: top + 'px',
            left: left + 'px'
          })
        }

        return result
      },
      tickWidth () {
        return 28
      },
      tickHeight () {
        return 24
      },
      x () {
        return this.$el ? this.$el.offsetLeft + (this.$el.offsetWidth / 2) - (this.tickWidth / 2) : 0
      },
      y () {
        return this.$el ? this.$el.offsetTop + (this.$el.offsetHeight / 2) - (this.tickHeight / 2) : 0
      },
      radius () {
        return this.$el ? this.$el.offsetWidth / 2 : 0
      }
    },
    methods: {
      // loadConstantsForTicks () {
      //   const tickWidth = 28
      //   const tickHeight = 24
      //
      //   this.x = this.$el.offsetLeft + (this.$el.offsetWidth / 2) - (tickWidth / 2)
      //   this.y = this.$el.offsetTop + (this.$el.offsetHeight / 2) - (tickHeight / 2)
      //   this.radius = this.$el.offsetWidth / 2
      // },
      input (value) {
        this.$emit('input', parseInt(value))
      }
    }
  }
</script>

<style scoped>
    .bg-hover-secondary:hover {
        background: #ccc;
        border-radius: 0.25rem;
    }

    .cursor-hover-pointer:hover {
        cursor: pointer;
    }

    .clock {
        width: 240px;
        max-width: 240px;
        height: 240px;
        max-height: 240px;
    }

    .clock-tick {
        position: absolute;
        padding-top: 2px;
        padding-bottom: 2px;
    }
</style>