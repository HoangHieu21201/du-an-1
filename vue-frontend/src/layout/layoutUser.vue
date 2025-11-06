<script setup>
import userHeader from '../components/user/userHeader.vue';
import userFooter from '../components/user/userFooter.vue';
</script>

<template>
    <userHeader />
    <router-view></router-view>
    <userFooter />
</template>

<style scoped>

</style>