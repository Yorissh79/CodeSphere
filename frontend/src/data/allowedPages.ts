export interface Page {
    title: string;
    description: string;
    route: string;
}

export const allowedPages: Page[] = [
    {title: "Home", description: "Main landing page", route: "/"},
    {title: "About", description: "About", route: "/about"},
    {title: "Search", description: "Search", route: "/search"},
    {title: "FAQ", description: "Frequently asked questions", route: "/faq"},
    {title: "Privacy policies", description: "Privacy polices", route: "/pp"},
    {title: "Contact Us", description: "Reach out for support", route: "/contact"},
    {title: "Login", description: "Sign in to your account", route: "/registration/login"},
    {title: "Signup", description: "Create a new account", route: "/registration/signup"},
    {title: "Signup Teacher", description: "Register as a teacher", route: "/registration/teacher/signup"},
];
