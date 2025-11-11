<script setup>
import { onMounted, onUnmounted } from 'vue';
import AdminHeader from '../components/admin/AdminHeader.vue';
import AdminFooter from '../components/admin/AdminFooter.vue';
import AdminSidebar from '../components/admin/AdminSidebar.vue'; 

onMounted(() => {
  document.body.classList.add('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
});

onUnmounted(() => {
  document.body.classList.remove('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
});
</script>

<template>
  <div class="app-wrapper">
    <AdminHeader />
    <AdminSidebar />

    <main class="app-main">
      <div class="app-content">
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </div>
    </main>

    <AdminFooter />
  </div>
</template>

<style scoped>
/* Có thể thêm style riêng cho layout nếu cần */
</style>