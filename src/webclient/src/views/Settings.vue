<template>
    <div id="settings">
        <div class="text-center form">

            <h4>Präferenzen 🔗</h4>

            <table style="width: 100%">
                <tbody>
                <tr>
                    <td align="left">
                        <label for="grades">
                            🔔 Benachrichtigung für Noten
                        </label>
                    </td>
                    <td>
                        <switches id="grades" v-model="preferences.gradeNotifications" type-bold="true"
                                  theme="custom" color="green" @input="savePreferences" :emit-on-mount="false"></switches>
                    </td>
                </tr>
                <tr>
                    <td align="left">
                        <label for="absence">
                            🔔 Benachrichtigung für Absenzen
                        </label>
                    </td>
                    <td>
                        <switches id="absence" v-model="preferences.absenceNotifications" type-bold="true"
                                  theme="custom" color="green" @input="savePreferences" :emit-on-mount="false"></switches>
                    </td>
                </tr>
                <tr>
                    <td align="left">
                        <label for="absenceReminder">
                            ⏰ Erinnerung für Absenzen
                        </label>
                    </td>
                    <td>
                        <switches id="absenceReminder" v-model="preferences.absenceReminders" type-bold="true"
                                  theme="custom" color="green" @input="savePreferences" :emit-on-mount="false"></switches>
                    </td>
                </tr>
                <tr>
                    <td align="left">
                        <label for="summary">
                            📊 Monatliche Zusammenfassung
                        </label>
                    </td>
                    <td>
                        <switches id="summary" v-model="preferences.monthlySummary" type-bold="true" 
                                  theme="custom" color="green" @input="savePreferences" :emit-on-mount="false"></switches>
                    </td>
                </tr>
                <tr>
                    <td align="left" colspan="2">
                        <label for="iftttToken">
                            🔑 IFTTT Token
                        </label>
                        <input type="string" autocomplete="string" class="form-control" id="iftttToken" aria-describedby="iftttTokenHelp" placeholder="IFTTT Token eingeben" v-model="preferences.iftttWebhookKey" @input="savePreferences">
                        <small id="iftttTokenHelp" class="form-text text-muted">Dein IFTTT-Token findest du <a target="_blank" rel="noopener noreferrer" href="https://ifttt.com/maker_webhooks/settings">hier</a> (nur den Teil nach "https://maker.ifttt.com/use/")</small>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <button class="btn btn-lg btn-custom-red btn-block buttonGap" style="margin-top: 25px" role="button" @click="logout">Logout 🔚</button>
        <button type="button" class="btn btn-lg btn-block btn-custom-red" style="margin-top: 50px" @click="deleteAccount">Account löschen ❌</button>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import Switches from 'vue-switches';
import {LOGOUT, UPDATE_PREFERENCES, FETCH_PREFERENCES, DELETE_USER} from "../store/actions.type";
import {CLEAR} from "../store/mutations.type";
import {PATH_LOGIN} from "../common/config";

export default {
    name: "Settings",
    components: {
        Switches
    },
    methods: {
        savePreferences() {
            this.$store.dispatch(UPDATE_PREFERENCES, this.preferences).then((data) => {
                this.$snack.show('Konfiguration gespeichert.');
            }).catch((error) => {
                this.$snack.show('Error: Konfiguration konnte nicht gespeichert werden.');
            });
        },
        logout(){
            this.$store.dispatch(LOGOUT).then(() => {
                this.$store.commit(CLEAR, false);
                this.$router.push(PATH_LOGIN);
            });
        },
        deleteAccount() {
            if (!confirm("Willst du deinen Account wirklich löschen? Alle gespeicherten Daten gehen dabei verloren")) {
                return;
            }
            this.$store.dispatch(DELETE_USER)
                .then(() =>{
                    this.$router.push(PATH_LOGIN);
                })
                .catch(() =>{
                    this.$snack.show("Beim Löschen des Accounts ist ein Fehler aufgetreten.");
                });
        }
    },
    computed: {
        ...mapGetters(['preferences'])
    },
    mounted() {
        this.$store.dispatch(FETCH_PREFERENCES);
    },
}
</script>

<style lang="scss">
@import "bootstrap";

$red: #EF476F;

.btn-custom-red {
    @include button-variant($red, darken($red, 7.5%), darken($red, 10%), lighten($red,5%), lighten($red, 10%), darken($red,30%));
}
    
.btn-outline-custom-red {
    @include button-outline-variant($red, #222222, lighten($red,5%), $red);
}
</style>