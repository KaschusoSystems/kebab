<template>
    <form>
        <h4 class="text-center">Dein gespeichertes Passwort funktioniert leider nicht mehr 😟</h4>        
        <div class="form-group">
            <label for="password">Passwort</label>
            <input type="password" autocomplete="password" class="form-control" id="password" aria-describedby="passwordHelp" placeholder="Passwort" v-model="password" v-on:keyup.enter="updatePassword">
            <small id="passwordHelp" class="form-text text-muted">Dein neues KASCHUSO-Passwort.</small>
        </div>
        <vue-loading v-if="isLoading" type="bars" color="#d9544e" :size="{ width: '50px', height: '50px' }"></vue-loading> 
        <button v-if="!isLoading" type="button" class="btn btn-lg btn-block btn-custom-green" @click="updatePassword">Passwort aktualisieren 💫</button>
        
        <button v-if="!isLoading" type="button" class="btn btn-lg btn-block btn-custom-red" style="margin-top: 50px" @click="deleteAccount">Account löschen ❌</button>
    </form>
</template>

<script>
import {UPDATE_PASSWORD} from "../store/actions.type";
import {PATH_LOGIN, PATH_SETTINGS} from "../common/config";
import { DELETE_USER } from '../store/actions.type';

export default {
    name: "Login",
    data: () => ({
        mandator: null,
        password: '',
        isLoading: false
    }),
    methods: {
        updatePassword() {
            if (!this.password) {
                return;
            }

            this.isLoading = true;
            this.$store.dispatch(UPDATE_PASSWORD, {
                password: this.password
            })
                .then((data) =>{
                    if (data.user.kaschusoAuthenticated) {
                        this.$snack.show("Passwort erfolgreich aktualisiert.");
                        this.$router.push(PATH_SETTINGS);
                    } else {
                        this.$snack.show("Das Passwort ist nicht gültig.");
                    }
                })
                .catch((error) =>{
                    if(error.status === 422){
                        this.$snack.show("Mit den eingegebenen Daten war das Login nicht erfolgreich.");
                    } else {
                        this.$snack.show("Error: Beim Login ist ein Fehler aufgetreten.");
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        deleteAccount() {
            if (!confirm("Willst du deinen Account wirklich löschen? Alle gespeicherten Daten gehen dabei verloren")) {
                return;
            }
            
            this.isLoading = true;
            this.$store.dispatch(DELETE_USER)
                .then(() =>{
                    this.$router.push(PATH_LOGIN);
                })
                .catch(() =>{
                    this.$snack.show("Beim Löschen des Accounts ist ein Fehler aufgetreten.");
                })
                .finally(() => {
                    this.isLoading = false;
                });
        }
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
$red: #EF476F;

.btn-custom-green {
    @include button-variant($green, darken($green, 7.5%), darken($green, 10%), lighten($green,5%), lighten($green, 10%), darken($green,30%));
}
    
.btn-outline-custom-green {
    @include button-outline-variant($green, #222222, lighten($green,5%), $green);
}

.btn-custom-red {
    @include button-variant($red, darken($red, 7.5%), darken($red, 10%), lighten($red,5%), lighten($red, 10%), darken($red,30%));
}
    
.btn-outline-custom-red {
    @include button-outline-variant($red, #222222, lighten($red,5%), $red);
}
</style>