<template>
    <div class="text-center">
        <img :src="pageNotFoundLogoSrc" class="img-fluid my-3" alt="404 - Not Found"/>
        <h1 class="my-5">
            Seite nicht gefunden.
        </h1>
        <p>
            Diese Seite wurde leider nicht gefunden.
            Hier kannst du dich <a class="link-primary" :href="PATH_LOGIN" @click="login">Anmelden</a>.
        </p>
    </div>
</template>

<script>
import pageNotFoundLogoSrc from "@/assets/undraw_page_not_found_su7k.svg";
import {PATH_LOGIN, PATH_SETTINGS} from "../common/config";

export default {
    name: "NotFound",
    data: () => ({
        pageNotFoundLogoSrc: pageNotFoundLogoSrc,
        PATH_LOGIN: PATH_LOGIN,
        PATH_SETTINGS: PATH_SETTINGS,
    }),
    methods: {
        login() {
            this.$router.push(this.PATH_LOGIN);
        },
        settings() {
            this.$router.push(this.PATH_SETTINGS);
        }
    }
};
</script>

<style lang="scss">
    a {
        color: #06D6A0;
    }
    a:hover {
        color: #07efb3;
    }
</style>