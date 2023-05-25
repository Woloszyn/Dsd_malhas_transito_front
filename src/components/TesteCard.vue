<template>
  <v-card
    class="mx-auto"
    max-width="600"
  >
    <v-toolbar
      flat
      dense
    >
      <v-toolbar-title>
        <span class="text-subheading">{{title}}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-card-text>
      <v-row
        class="mb-4"
        justify="space-between"
      >
        <v-col class="text-left">
          <span
            class="text-h2 font-weight-light"
            v-text="internalQtd"
          ></span>
          <span class="subheading font-weight-light me-1">{{title}}</span>
          <v-fade-transition>
            <v-avatar
              v-if="isPlaying"
              :color="color"
              :style="{
                animationDuration: animationDuration
              }"
              class="mb-1 v-avatar--metronome"
              size="12"
            ></v-avatar>
          </v-fade-transition>
        </v-col>
        <v-col class="text-right">
          <v-btn
            :color="color"
            theme="dark"
            elevation="0"
            @click="toggle"
          >
            <span> {{isPlaying ? 'Stop' : 'Play'}} </span>
          </v-btn>
        </v-col>
      </v-row>

      <v-slider
        v-model="internalQtd"
        :color="color"
        track-color="grey"
        min="0"
        max="70"
        :step="1"
      >
        <template v-slot:prepend>
          <v-btn
            size="small"
            variant="text"
            :color="color"
            @click="decrement"
          >-</v-btn>
        </template>

        <template v-slot:append>
          <v-btn
            size="small"
            variant="text"
            :color="color"
            @click="increment"
          >+</v-btn>
        </template>
      </v-slider>
      <v-divider></v-divider>
      <slot></slot>
    </v-card-text>
  </v-card>
</template>
<script>
  export default {
    data: () => ({
      interval: null,
      isPlaying: false,
      internalQtd: 0,
    }),
    props: {
        qtd: Number,
        title: String,
    },
    computed: {
      color () {
        if (this.internalQtd < 20) return 'blue'
        if (this.internalQtd < 30) return 'green'
        if (this.internalQtd < 50) return '#ffff66'
        if (this.internalQtd < 70) return 'red'
        return 'red'
      },
      animationDuration () {
        return `${60 / this.internalQtd}s`
      },
    },

    methods: {
      decrement () {
        this.internalQtd--
      },
      increment () {
        this.internalQtd++
      },
      toggle () {
        this.isPlaying = !this.isPlaying
        if (this.isPlaying) {
            this.$emit("play", this.internalQtd);
        } else {
            this.$emit("stop");
        }
      },
      mounted() {
          this.internalQtd = this.qtd
      }
    },
  }
</script>