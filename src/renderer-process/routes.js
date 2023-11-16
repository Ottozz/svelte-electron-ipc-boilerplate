import Home from './pages/Home.svelte';
import NotFound from './pages/NotFound.svelte';

export default {
    '/': Home,

    // The catch-all route must always be last
    '*': NotFound
};