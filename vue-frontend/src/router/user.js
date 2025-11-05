const users = [
    {
        path: "/",
        component: () => import("../layout/layoutUser.vue"),
        children: [
            {
                path: "",
                name: "home",
                component: () => import("../page/user/home.vue")
            },
            {
                path: "/about",
                name: "about",
                component: () => import("../page/user/about.vue")
            },
        ]
    }
]

export default users;