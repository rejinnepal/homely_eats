
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/homely_eats/',
  locale: undefined,
  routes: [
  {
    "renderMode": 1,
    "route": "/homely_eats"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/login"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/signup"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/home"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/dinners"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/dinners/*"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/my-listings"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/about"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/edit-dinner/*"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/host"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/my-bookings"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/create-dinner"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/profile"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/booking-notifications"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/hosts/*"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/support/help-center"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/support/safety"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/support/contact"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/support/faq"
  },
  {
    "renderMode": 1,
    "redirectTo": "/homely_eats/legal/terms",
    "route": "/homely_eats/legal"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/legal/terms"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/legal/privacy"
  },
  {
    "renderMode": 1,
    "route": "/homely_eats/legal/cookies"
  },
  {
    "renderMode": 1,
    "redirectTo": "/homely_eats",
    "route": "/homely_eats/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 64786, hash: 'ea39e5ef40c1de622e83a6e6efe404db1e4e4dc01180ac38304dfc79cab35429', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17708, hash: 'c655615240194035509798d7f0150fd217a48173716611ef5dfc28e685933611', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-MBT4H3D3.css': {size: 89159, hash: '+pJJncmFlDw', text: () => import('./assets-chunks/styles-MBT4H3D3_css.mjs').then(m => m.default)}
  },
};
