import './index.css';
import App from './App.svelte';

const app = new App({
  target: document.getElementById('app') as HTMLElement,
  props: {
    url: window.location.pathname
  }
});

export default app;