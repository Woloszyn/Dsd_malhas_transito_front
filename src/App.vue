<template>
  <v-app>
    <v-main>
      <RoadViewer/>
      <!-- <TesteCard/> -->
    </v-main>
  </v-app>
</template>

<script>
import RoadViewer from './components/RoadViewer.vue';
// import TesteCard from './components/TesteCard.vue';

export default {
  name: 'App',

  components: {
    RoadViewer
    // TesteCard
  },

  data: () => ({
    //
  }),
};
</script>
