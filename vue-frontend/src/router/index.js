import { createRouter, createWebHistory } from "vue-router";

// layout (Header, Footer Admin or User)
import layoutAdmin from "../layout/layoutAdmin.vue";
import layoutUser from "../layout/layoutUser.vue";

// Admin
import productManager from "../admin/productManager.vue";
import userManager from "../admin/userManager.vue";

// User
import home from "../page/home.vue";
import about from "../page/about.vue";

const routes = [
  {
    path: "/admin",
    component: layoutAdmin,
    children: [
      { path: "productManager", component: productManager },
      { path: "userManager", component: userManager },
    ],
  },
  {
    path: "/",
    component: layoutUser,
    children: [
      { path: "", component: home },
      { path: "/about", component: about },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
