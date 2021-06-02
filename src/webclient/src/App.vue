<template>
    <div id="app" class="container" style="font-family: Inter, Helvetica, Arial, sans-serif">
        <div class="row">
            <div class="col-md-10 col-lg-8 col-xl-8 offset-md-1 offset-lg-2 offset-xl-2">
                <div class="jumbotron content" style="background-color:transparent !important;">
                    <h1 class="text-center spaced-header">📢</h1>
                    <h1 class="text-center spaced-header">KaschusoNotifications</h1>
                    <hr>
                    <router-view/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {CLEAR} from "./store/mutations.type";
import {FETCH_MANDATORLIST, LOGOUT} from "./store/actions.type";

export default {
    mounted(){
        this.$store.dispatch(FETCH_MANDATORLIST).catch(() => {
            this.$snack.show("Error: Schulen konnten nicht geladen werden.");
        });
    },
    beforeDestroy() {
        this.$store.commit(CLEAR, true);
        this.$store.dispatch(LOGOUT);
    }
}
</script>

<style lang="scss">
@import url('https://rsms.me/inter/inter.css');

$green: #06D6A0;
$grey: #f5f5f5;

.vue-switcher-theme--custom {
    &.vue-switcher-color--green {
        div {
            background-color: $green;

            &:after {
                background-color: darken($green, 10%);
            }
        }

        &.vue-switcher--unchecked {
            div {
                background-color: darken($grey, 5%);

                &:after {
                    background-color: $grey;
                }
            }
        }
    }
}

.spaced-header {
    margin-bottom: 25px
}

</style>
