let keys;

if (process.env.NODE_ENV === 'production')  {
  keys = import('./prod');
} else {
  keys = import('./dev');
}

export default keys;