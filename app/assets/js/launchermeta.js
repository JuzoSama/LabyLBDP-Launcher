// Informations du launcher lues depuis package.json.
// Pour changer le dépôt GitHub ou le nom, modifie UNIQUEMENT package.json.
const pkg = require('../../../package.json')

exports.PRODUCT_NAME = pkg.productName
// ex : https://github.com/TON-PSEUDO-GITHUB/LabyLBDP-Launcher
exports.REPO_URL = pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '')
