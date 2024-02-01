/** @type {import('next').NextConfig} */
const nextConfig = {};

const withPWA = require('next-pwa')({
  dest: 'public'
})

export default withPWA({nextConfig});
