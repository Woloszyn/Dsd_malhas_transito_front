<template>
  <v-app>
    <v-main>
      <!-- <RoadViewer/> -->
      <!-- <TesteCard/> -->
      <Chat/>
    </v-main>
  </v-app>
</template>

<script>
// import RoadViewer from './components/RoadViewer.vue';
// import TesteCard from './components/TesteCard.vue';
import Chat from './components/Chat.vue'

export default {
  name: 'App',

  components: {
    Chat
    // RoadViewer
    // TesteCard
  },

  data: () => ({
    //
  }),
};
</script>
