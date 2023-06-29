<template>
    <div id="app">
        <v-app>
            <v-container
            class="fill-height pa-0 "
            >
            <input type="text" v-model="serverUrl">
            <v-btn @click="connectToServer()">Connect</v-btn>
            <v-row class="no-gutters elevation-4">
                <v-col
                cols="12" sm="3"
                class="flex-grow-1 flex-shrink-0"
                style="border-right: 1px solid #0000001f;"
                >
                <v-responsive
                    class="overflow-y-auto fill-height"
                    height="500"
                >
                    <v-list subheader>
                    <v-list-item-group v-model="activeChat">
                        <template v-for="(item, index) in parents">
                        <v-list-item
                            v-if="item.id != 1"
                            :key="`parent${index}`"
                            :value="item.id"
                            @click="chooseChatWith(item)"
                        >
                            <v-list-item-avatar color="grey lighten-1 white--text">
                            <v-icon>
                                👤
                            </v-icon>
                            </v-list-item-avatar>
                            <v-list-item-content>
                            <v-list-item-title v-text="item.title" />
                            <v-list-item-subtitle v-text="item.active ?'Online' :'Offline'" />
                            </v-list-item-content>
                            <v-list-item-icon>
                                <v-text>{{item.unread}}</v-text>
                                <v-icon :color="item.active ? 'green accent-4' : 'grey'">
                                    ●
                                </v-icon>
                            </v-list-item-icon>
                        </v-list-item>
                        <v-divider
                            :key="`chatDivider${index}`"
                            class="my-0"
                        />
                        </template>
                    </v-list-item-group>
                    </v-list>
                </v-responsive>
                </v-col>
                <v-col
                cols="auto"
                class="flex-grow-1 flex-shrink-0"
                >
                <v-responsive
                    v-if="activeChat"
                    class="overflow-y-hidden fill-height"
                    height="500"
                >
                    <v-card
                    flat
                    class="d-flex flex-column fill-height"
                    >
                    <v-card-title>
                        {{ parents.find(usr => usr.id == activeChat).title}}
                    </v-card-title>
                    <v-card-text class="flex-grow-1 overflow-y-auto">
                        <div v-for="(msg, i) in messages" :key="i">
                            <div
                                v-show="activeChat.id != 1"
                                :class="{ 'd-flex flex-row-reverse': msg.me }"
                            >
                                <v-menu offset-y>
                                <template v-slot:activator="{ on }">
                                    <v-hover
                                    v-slot:default="{ hover }"
                                    >
                                    <v-chip
                                        :color="msg.me ? 'primary' : ''"
                                        dark
                                        style="height:auto;white-space: normal;"
                                        class="pa-4 mb-2"
                                        v-on="on"
                                    >
                                        {{ msg.content }}
                                        <sub
                                        class="ml-2"
                                        style="font-size: 0.5rem;"
                                        >{{ msg.created_at }}</sub>
                                        <v-icon
                                        v-if="hover"
                                        small
                                        >
                                        ➕
                                        </v-icon>
                                    </v-chip>
                                    </v-hover>
                                </template>
                                <v-list>
                                    <v-list-item>
                                    <v-list-item-title>delete</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                                </v-menu>
                            </div>
                        </div>
                    </v-card-text>
                    <v-card-text class="flex-shrink-1">
                        <v-text-field
                        v-model="messageForm.content"
                        label="type_a_message"
                        type="text"
                        no-details
                        outlined
                        append-outer-icon="⏎"
                        @keyup.enter="sendChat"
                        @click:append-outer="sendChat"
                        hide-details
                        />
                    </v-card-text>
                    </v-card>
                </v-responsive>
                </v-col>
            </v-row>
            </v-container>
        </v-app>
    </div>
</template>

<script>
export default {
    data: () => ({
        socket: null,
        myId: 0,
        message: "",
        messagesReceived: [],
        textReceived: "",
        "serverUrl" : "ws://192.168.3.5:8076",
        activeChat: 1,
        parents: [
            {
                id: 1,
                title: "john doe",
                active: true,
                unread: 0
            }
        ],
        messages: [
            {
                content: "lorem ipsum",
                me: true,
                created_at: "11:11am"
            },
            {
                content: "dolor",
                me: false,
                created_at: "11:11am"
            },
        ],
        messageForm: {
            content: "",
            me: true,
            created_at: "11:11am"
        }
    }),
    methods: {
        connectToServer() {
            this.socket = new WebSocket(this.serverUrl);

            this.socket.onopen = () => {
                console.log('Connected to server');
            };

            this.socket.onmessage = (event) => {
                console.log('Received message from server:', event.data);
                this.messagesReceived = [];
                this.messagesReceived.push(event.data);
                this.processMessages();
            };
            this.socket.onclose = () => {
                console.log('Disconnected from server');
            };
        },
        sendMessage(message) {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(message);
                console.log('Sent message to server:' + message);
            }
        },
        sendChat() {
            this.sendMessage(JSON.stringify({
                'action': 'SEND_MESSAGE',
                'from': this.myId,
                'to': this.activeChat,
                'message': this.messageForm.content
            }))
            this.messageForm.content = '';
        },
        processMessages() {
            this.messagesReceived.forEach(msg => {
                var messageFromJson = JSON.parse(msg);
                var action = messageFromJson.messageAction;
                switch(action) {
                    case "USERS_LIST": 
                        this.users_list(messageFromJson.body);
                        break;
                    case "NEW_MESSAGE_RECEIVED": 
                        this.new_message_received(messageFromJson.body);
                        break;
                    case "NEW_USER_CONNECTED": 
                        this.new_user_connected(messageFromJson.body);
                        break;
                    case "NEW_USER_DISCONNECTED":
                        this.users_list(messageFromJson.body);
                        break;
                    case "GET_MY_ID":
                        this.myId = messageFromJson.userId;
                        break;
                    case "CHAT_WITH_USER":
                        this.chat_with_user(messageFromJson.body);
                        break;
                }
            });
        },
        users_list(body, usr_id) {
            body.forEach((user) => {
                if(usr_id != user.id) {
                    this.parents.push({
                        "id" : user.id,
                        "title" : user.username,
                        "active" : true,
                        "unread": 0
                    })
                }
            })
        },
        new_message_received(body) {
            if (body.userIdToReceive == this.activeChat || body.userId == this.activeChat) {
                this.messages.push({
                    content: body.message,
                    me: body.userId == this.myId,
                    created_at: body.createdAt
                })
            } else {
                var userFind = this.parents.find(usr => usr.id == body.userId)
                if (userFind) {
                    userFind.unread++
                }
            }
        },
        new_user_connected(body) {
            this.parents.push({
                    "id" : body.user.id,
                    "title" : body.user.username,
                    "active" : true,
                    "unread": 0
                })
        },
        chat_with_user(body) {
            this.messages = [];
            body.forEach((message) => {
                this.messages.push({
                    content: message.message,
                    me: false,
                    created_at: message.createdAt
                })
            })
        },
        chooseChatWith(user) {
            user.unread = 0;
            this.messages = [];
            this.get_messages_from_user(user.id)
        },
        new_user_disconnected(body) {
            this.parents.find((usr) => usr.id == body.id).active = false;
        },
        get_messages_from_user(userId) {
            this.sendMessage(JSON.stringify(
                    {
                        action: "CHAT_WITH_USER",
                        to: userId,
                        from: this.myId
                    }
                ));
        }
    },
}
</script>

<style>

</style>