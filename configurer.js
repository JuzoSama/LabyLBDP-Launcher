// Remplace « TON-PSEUDO-GITHUB » par ton vrai pseudo GitHub dans tout le projet.
// Utilisation :  node configurer.js MonPseudo
const fs = require('fs')

const pseudo = process.argv[2]
if(!pseudo || !/^[A-Za-z0-9-]+$/.test(pseudo)){
    console.error('Utilisation : node configurer.js TonPseudoGitHub')
    process.exit(1)
}

const fichiers = [
    'package.json',
    'dev-app-update.yml',
    'app/assets/js/distromanager.js',
    'app/assets/lang/_custom.toml'
]

for(const f of fichiers){
    const avant = fs.readFileSync(f, 'utf-8')
    const apres = avant.replaceAll('TON-PSEUDO-GITHUB', pseudo)
    if(avant !== apres){
        fs.writeFileSync(f, apres)
        console.log('Mis à jour :', f)
    }
}
console.log(`Terminé. Dépôt du launcher : https://github.com/${pseudo}/LabyLBDP-Launcher`)
console.log(`Dépôt des fichiers  : https://github.com/${pseudo}/LabyLBDP-Files`)
