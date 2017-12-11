<template>
    <div>
        <div class="btn-group w-100">
            <div class="btn-group w-100 justify-content-center my-1" style="margin-left: 15%;">
                <button class="btn rounded px-1 py-0 mx-1"
                        @click="mode = 'hours'"
                        :class="{
                          'btn-primary': mode === 'hours',
                          'btn-link text-black': mode !== 'hours'
                        }"
                >
                    {{ convertToDoubleNumber(startHours) }}
                </button>
                <button class="btn btn-link p-0 m-0 text-black disabled" v-show="$parent.hasMinutes">:</button>
                <button v-show="$parent.hasMinutes"
                        class="btn rounded px-1 py-0 mx-1"
                        @click="mode = 'minutes'"
                        :class="{
                          'btn-primary': mode === 'minutes',
                          'btn-link text-black': mode !== 'minutes'
                        }">
                    {{ convertToDoubleNumber(startMinutes) }}
                </button>
                <button class="btn btn-link p-0 m-0 text-black disabled" v-show="$parent.hasSeconds">:</button>
                <button v-show="$parent.hasSeconds"
                        class="btn rounded px-1 py-0 mx-1"
                        @click="mode = 'seconds'"
                        :class="{
                          'btn-primary': mode === 'seconds',
                          'btn-link text-black': mode !== 'seconds'
                        }">
                    {{ convertToDoubleNumber(startSeconds) }}
                </button>
            </div>
            <button class="btn btn-link" @click="toNow">
                <i class="fa fa-dot-circle-o"></i>
            </button>
        </div>
        <hr class="my-1">
        <component is="medium-clock"
                   v-show="mode === 'hours'"
                   :show="mode === 'hours' && $parent.mode === $parent.MODE_TIME"
                   :rows="2"
                   :step="1"
                   :max="23"
                   :value="startHours"
                   @input="input('startHours', $event)"></component>
        <component is="medium-clock"
                   v-show="$parent.hasMinutes && mode === 'minutes'"
                   :show="$parent.hasMinutes && mode === 'minutes'"
                   :rows="1"
                   :step="5"
                   :max="59"
                   :value="startMinutes"
                   @input="input('startMinutes', $event)"></component>
        <component is="medium-clock"
                   v-show="$parent.hasSeconds && mode === 'seconds'"
                   :show="$parent.hasSeconds && mode === 'seconds'"
                   :rows="1"
                   :step="5"
                   :max="59"
                   :value="startSeconds"
                   @input="input('startSeconds', $event)"></component>
    </div>
</template>

<script>
  import MediumClock from './Time/MediumClock.vue'

  export default {
    components: {MediumClock},
    props: {
      startHours: {
        type: Number,
        validator: function (value) {
          return value >= 0 && value <= 23
        }
      },
      startMinutes: {
        type: Number,
        validator: function (value) {
          return value >= 0 && value <= 59
        }
      },
      startSeconds: {
        type: Number,
        validator: function (value) {
          return value >= 0 && value <= 59
        }
      },
      // show: {
      //   type: Boolean,
      //   required: true
      // }
    },
    data () {
      return {
        mode: 'hours'
      }
    },
    methods: {
      toNow () {
        if (this.$parent.hasHours) {
          this.$emit('startHours', (new Date()).getHours())
        }
        if (this.$parent.hasMinutes) {
          this.$emit('startMinutes', (new Date()).getMinutes())
        }
        if (this.$parent.hasSeconds) {
          this.$emit('startSeconds', (new Date()).getSeconds())
        }
      },
      convertToDoubleNumber (number) {
        if (number < 10) {
          return '0' + parseInt(number)
        }

        return number
      },
      input (name, value) {
        this.$emit(name, value)
        switch (name) {
          case 'startHours':
            this.mode = this.$parent.hasMinutes ? 'minutes' : (this.$parent.hasSeconds ? 'seconds' : this.mode)
            break
          case 'startMinutes':
            this.mode = this.$parent.hasSeconds ? 'seconds' : this.mode
            break
        }
      }
    }
  }
</script>

<style scoped>
    .text-black {
        color: #000;
    }

    button.disabled:hover {
        text-decoration: none;
    }
</style>