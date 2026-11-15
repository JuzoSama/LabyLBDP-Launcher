const { DistributionAPI } = require('helios-core/common')

const ConfigManager = require('./configmanager')

// Adresse du fichier distribution.json (liste des serveurs, mods et fichiers à télécharger).
// Il est hébergé dans ton dépôt GitHub de fichiers (voir GUIDE.md, étape 3).
exports.REMOTE_DISTRO_URL = 'https://raw.githubusercontent.com/JuzoSama/LabyLBDP-Files/main/distribution.json'

const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
    null, // Injected forcefully by the preloader.
    null, // Injected forcefully by the preloader.
    exports.REMOTE_DISTRO_URL,
    false
)

exports.DistroAPI = api