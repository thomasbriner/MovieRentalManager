import sveltePreprocess from 'svelte-preprocess';

export default {
  preprocess: sveltePreprocess({
    typescript: true,
    scss: true,
    postcss: true
  })
};