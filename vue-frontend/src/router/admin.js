
const admin = [
    {
        path: "/admin",
        component: () => import("../layout/layoutAdmin.vue"),
        children: [
            {
                path: "users",
                name: "admin-user",
                component: () => import("../page/admin/adminUser/index.vue")
            },
            {
                path: "products",
                name: "admin-product",
                component: () => import("../page/admin/adminProduct/index.vue")
            },
        ]
    }
]

export default admin