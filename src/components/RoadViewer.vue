<template>
  <div class="main_road_viewer">
    <TesteCard :qtd="slider_quantity" title="Carros" @stop="stop" @play="play">
      <v-list density="compact">
        <v-list-item active-color="primary">
          <v-text-field
            label="Server"
            v-model="serverUrl"
            hide-details="auto"
          ></v-text-field>
          <v-btn :disabled="socket_connected" class="already_conn" @click="connectToServer">
            Connect
          </v-btn>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-radio-group
        v-model="typeMutuousPause"
        column
        :disabled="socket_connected"
      >
        <v-radio
          label="Monitor"
          value="MONITOR"
        ></v-radio>
        <v-radio
          label="Semaforo"
          value="SEMAPHORE"
        ></v-radio>
      </v-radio-group>
      <v-divider></v-divider>
      <v-radio-group
        v-model="metodo_encerramento"
        column
        :disabled="socket_connected"
      >
        <v-radio
          label="Encerar tudo"
          value="END_EVERYTHING"
        ></v-radio>
        <v-radio
          label="Esperar processos acabarem sozinhos"
          value="WAIT_UNITL_ENDS_BY_HIMSELF"
        ></v-radio>
      </v-radio-group>
    </TesteCard>
    <v-snackbar :timeout="10000"
      v-model="snackbar"
      color="blue"
    >
      {{ snackbarText }}

      <template v-slot:actions>
        <v-btn
          color="red"
          variant="snackbarText"
          @click="snackbar = false"
        >
        </v-btn>
      </template>
    </v-snackbar>
    <br>
    <div class="div-table">
      <v-table v-show="segments.length > 0" name="tabela" >
        <tbody>
          <tr v-for="(segment, indexRow) in segments" :key="indexRow">
            <td v-for="(value, indexColumn) in segment" :key="indexColumn" style="padding:10px" :class="getClassBasedOnValue(value, indexRow, indexColumn)">
              <div :title="getTitle(value, indexRow, indexColumn)" @click="change_selected_item(value, indexRow, indexColumn)">
                {{mapValue(value, indexRow, indexColumn)}}
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <div class="position_footer">
        <v-chip-group>
          <v-chip>Carros: {{carlist.length}}</v-chip>

          <v-chip>Linhas: {{rows}}</v-chip>

          <v-chip>Colunas: {{columns}}</v-chip>
        </v-chip-group>
    </div>
  </div>
</template>
<style>
  .simple.no-color{
    background-color: white;
  }
  .div-table{
    margin-left: 25%;
  }
  .direita {
    background-color: rgb(94, 94, 240);
  }
  .car.direita {
    background-image: url("../assets/car-icon-right.png") !important;
    background-size:contain !important;
  }
  .cruzamento{
    background-color: rgb(150, 144, 144);
  }
  .esquerda{
    background-color: rgb(60, 156, 60);
  }
  .car.esquerda {
    background-image: url("../assets/car-icon-left.png") !important;
    background-size: contain !important;
  }
  .baixo{
    background-color: rgb(179, 127, 135);
  }
  .car.baixo {
    background-image: url("../assets/car-icon-down.png") !important;
    background-size:contain !important;
  }
  .cima{ 
    background-color: rgb(42, 144, 148);
  }
  .car.cima{
    background-image: url("../assets/car-icon-up.png") !important;
    background-size:contain !important;
  }

  .position_footer {
    position: fixed;
    left: 80%;
    bottom: 0;
  }
  .selected_car {
    border: 2.5px solid red !important;
  }

  .main_road_viewer {
    width: 100%;
  }

  .not_conn {
    background-color: rgb(172, 170, 170) !important;
  }
  .already_conn {
    background-color: rgb(97, 201, 97) !important;
  }
</style>
<script>
import TesteCard from './TesteCard.vue';

export default {

  components: {
    TesteCard
  },
  data() {
    return {
      socket: null,
      serverUrl: 'ws://localhost:8075', // Replace with your server's URL
      message: '',
      segments:[],
      socket_connected: false,
      rows:0,
      columns:0,
      typeMutuousPause: "SEMAPHORE",
      slider_quantity:0,
      metodo_encerramento:"END_EVERYTHING",
      carlist:[],
      snackbar: false,
      selectedCar: {},
      snackbarText: "",
      response: {},
    };
  },
  mounted() {
    // this.connectToServer();
  },
  methods: {
    connectToServer() {
      this.socket = new WebSocket(this.serverUrl);

      this.socket.onopen = () => {
        console.log('Connected to server');
      };

      this.socket.onmessage = (event) => {
        console.log('Received message from server:', event.data);
        this.response = JSON.parse(event.data);
        this.carlist = this.response.carList;
        this.segments = this.response.roadMap.segments;
        this.rows = this.response.roadMap.rows;
        this.columns = this.response.roadMap.columns;
      };

      this.socket.onclose = () => {
        console.log('Disconnected from server');
      };
      this.socket_connected = true;
    },
    stop() {
        this.sendMessage("STOP");
    },
    play(value) {
        this.slider_quantity = value;
        this.sendMessage("PLAY");
    },
    sendMessage(action) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.message = JSON.stringify({
          maxCars: this.slider_quantity,
          action: action,
          typeMutuousPause: this.typeMutuousPause,
          methodFinish: this.metodo_encerramento,
        })
        this.socket.send(this.message);
        console.log('Sent message to server:', this.message);
      }
    },
    mapValue(value, indexRow, indexColumn) {
      if(this.haveCar(indexRow, indexColumn)){
        return "‎ ";
      }
      switch(value) {
        case 0:
          return "‎ ";
        case 1:
          return "↑";
        case 2:
          return "→";
        case 3:
          return "↓";
        case 4:
          return "←";
        default:
          return "‎ ";
      }
    },
    getTitle(value, indexRow, indexColumn) {
      if(this.haveCar(indexRow, indexColumn)) {
        let car = this.carlist.find((car) => car.row == indexRow && car.column == indexColumn);
        return JSON.stringify(car);
      } else {
        switch(value) {
        case 0:
          return "espaço em branco";
        case 1:
          return " cima";
        case 2:
          return " direita";
        case 3:
          return " baixo";
        case 4:
          return " esquerda";
        default:
          return " cruzamento";
      }
      }
    },
    getClassBasedOnValue(value, indexRow, indexColumn) {
      var returnClass = "";
      if(this.haveCar(indexRow, indexColumn)){
        returnClass += " car";
      }
      if (this.selectedCar != null) {
        if(this.selectedCar.column == indexColumn && this.selectedCar.row == indexRow) {
          returnClass += " selected_car";
        }
      }
      switch(value) {
        case 0:
          returnClass += " simple no-color";
          break;
        case 1:
          returnClass += " cima";
          break;
        case 2:
          returnClass += " direita";
          break;
        case 3:
          returnClass += " baixo";
          break;
        case 4:
          returnClass += " esquerda";
          break;
        default:
          returnClass += " cruzamento";
          break;
      }
      return returnClass;
    },
    haveCar(indexRow, indexColumn) {
      return this.carlist.find((car) => car.row == indexRow && car.column == indexColumn);
    },
    change_selected_item(value, indexRow, indexColumn) {
      this.snackbar = true;
      this.selectedCar = this.carlist.find((car) => car.row == indexRow && car.column == indexColumn);
      this.snackbarText = this.getTitle(value, indexRow, indexColumn);
    }
  },
  watch:{
      carlist: function (val) {
          console.log(val);
          this.selectedCar = this.carlist.find((car) => car.idCar == this.selectedCar.idCar);
          this.snackbarText = JSON.stringify(this.selectedCar);
      }
  },
};
</script>