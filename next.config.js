/** @type {import('next').NextConfig} */
const isGhPages = process.env.GH_PAGES === 'true';
// TODO: replace with your repository name if deploying to GitHub Pages Project Pages
const repoName = process.env.GH_REPO || 'nutrition-calculator';

module.exports = {
  output: 'export',
  trailingSlash: true,
  assetPrefix: isGhPages ? `/${repoName}/` : '',
  basePath: isGhPages ? `/${repoName}` : '',
};


