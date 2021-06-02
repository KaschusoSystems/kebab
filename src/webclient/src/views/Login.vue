<template>
    <form>
        <h4 class="text-center">Hey 👋</h4>
        <div class="form-group">
            <label for="mandator">Schule</label>
            <select class="form-control" id="mandator" aria-describedby="mandatorHelp" placeholder="Schule auswählen" v-model="mandator">
                <option v-for="mandatorItem in mandatorList" v-bind:key="mandatorItem.name" :value="mandatorItem.name">{{ mandatorItem.description }}</option>
             </select>
            <small id="mandatorHelp" class="form-text text-muted">Deine Schule.</small>
        </div>
        <div class="form-group">
            <label for="username">Benutzername</label>
            <input type="username" autocomplete="username" class="form-control" id="username" aria-describedby="usernameHelp" placeholder="Benutzername eingeben" v-model="credentials.username" v-on:keyup.enter="checkFields">
            <small id="usernameHelp" class="form-text text-muted">Dein KASCHUSO-Benutzername.</small>
        </div>
        <div class="form-group">
            <label for="password">Passwort</label>
            <input type="password" autocomplete="password" class="form-control" id="password" aria-describedby="passwordHelp" placeholder="Passwort" v-model="credentials.password" v-on:keyup.enter="checkFields">
            <small id="passwordHelp" class="form-text text-muted">Dein KASCHUSO-Passwort.</small>
        </div>
        <vue-loading v-if="isLoading" type="bars" color="#d9544e" :size="{ width: '50px', height: '50px' }"></vue-loading>    
        <button v-if="!isLoading" type="button" class="btn btn-lg btn-block btn-custom-green" @click="checkFields">Login</button>
    </form>
</template>

<script>
import {LOGIN} from "../store/actions.type";
import {SET_PREFERENCES} from "../store/mutations.type";
import {PATH_AUTH, PATH_SETTINGS} from "../common/config";

export default {
    name: "Login",
    data: () => ({
        mandator: null,
        credentials: {
            username: '',
            password: ''
        },
        isLoading: false
    }),
    mounted() {
        this.mandator = localStorage.getItem('mandator');
    },
    methods: {
        checkFields() {
            if (this.credentials.username && this.credentials.password) {
                this.isLoading = true;
                this.$store.dispatch(LOGIN, {
                    mandator: this.mandator,
                    username: this.credentials.username,
                    password: this.credentials.password
                }).then((data) => {
                    this.$store.commit(SET_PREFERENCES, {
                        gradeNotifications: data.user.user.gradeNotifications,
                        absenceNotifications: data.user.user.absenceNotifications,
                        absenceReminders: data.user.user.absenceReminders,
                        monthlySummary: data.user.user.monthlySummary
                    });
                    if (!data.user.user.kaschusoAuthenticated) {
                        this.$router.push(PATH_AUTH);
                    } else {
                        this.$router.push(PATH_SETTINGS);
                    }
                }).catch((error) =>{
                    if(error.status === 422){
                        this.$snack.show("Mit den eingegebenen Daten war das Login nicht erfolgreich.");
                    } else {
                        this.$snack.show("Error: Beim Login ist ein Fehler aufgetreten.");
                    }
                }).finally(() => {
                    this.isLoading = false;
                });
                localStorage.setItem('mandator', this.mandator);
            } else {
                this.$snack.show("Füllen Sie bitte alle Felder aus.");
            }
        },
    },
    computed: {
        mandatorList(){
            return this.$store.getters.mandatorList;
        },
    },
}
</script>

<style lang="scss">
@import "bootstrap";

$green: #06D6A0;

.btn-custom-green {
    @include button-variant($green, darken($green, 7.5%), darken($green, 10%), lighten($green,5%), lighten($green, 10%), darken($green,30%));
}
    
.btn-outline-custom-green {
    @include button-outline-variant($green, #222222, lighten($green,5%), $green);
}
</style>