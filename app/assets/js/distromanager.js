const { DistributionAPI } = require('helios-core/common')
const fs = require('fs-extra')
const got = require('got')
const path = require('path')
const { LoggerUtil } = require('helios-core')

const ConfigManager = require('./configmanager')

const logger = LoggerUtil.getLogger('DistroManager')

// Adresse du fichier distribution.json (liste des serveurs, mods et fichiers à télécharger).
// Il est hébergé dans ton dépôt GitHub de fichiers (voir GUIDE.md, étape 3).
exports.REMOTE_DISTRO_URL = 'https://raw.githubusercontent.com/JuzoSama/LabyLBDP-Files/main/distribution.json'

// Liste des comptes staff et des mods qui leur sont réservés (générée par mettre-a-jour.bat).
const STAFF_URL = exports.REMOTE_DISTRO_URL.replace(/distribution\.json$/, 'staff.json')

const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
    null, // Injected forcefully by the preloader.
    null, // Injected forcefully by the preloader.
    exports.REMOTE_DISTRO_URL,
    false
)

/* ------------------------------------------------------------------
 * Mods réservés au staff
 *
 * La distribution complète est gardée dans distribution_complete.json.
 * distribution.json (lu par le téléchargeur) ne contient que les mods
 * auxquels le compte sélectionné a droit : un joueur normal ne
 * télécharge donc jamais les mods staff.
 * ------------------------------------------------------------------ */

const fichierComplet = path.join(ConfigManager.getLauncherDirectory(), 'distribution_complete.json')
const fichierStaff = path.join(ConfigManager.getLauncherDirectory(), 'staff.json')

async function chargerStaff() {
    try {
        const res = await got.get(STAFF_URL, { responseType: 'json', timeout: { request: 15000 } })
        await fs.writeJson(fichierStaff, res.body)
        return res.body
    } catch {
        // Hors ligne ou pas encore de liste : on garde la dernière connue.
        try {
            return await fs.readJson(fichierStaff)
        } catch {
            return { comptes: [], mods: [] }
        }
    }
}

function compteEstStaff(staff) {
    const compte = ConfigManager.getSelectedAccount()
    if(compte == null) {
        return false
    }
    const nom = (compte.displayName || '').toLowerCase()
    const uuid = (compte.uuid || '').replace(/-/g, '').toLowerCase()
    return (staff.comptes || []).some(c => {
        const v = String(c).trim().toLowerCase()
        return v === nom || v.replace(/-/g, '') === uuid
    })
}

function nomFichier(module) {
    const url = (module.artifact && module.artifact.url) || ''
    try {
        return decodeURIComponent(url.split('/').pop()).toLowerCase()
    } catch {
        return url.split('/').pop().toLowerCase()
    }
}

function filtrerPourLeCompte(distro, staff) {
    const modsStaff = new Set((staff.mods || []).map(m => String(m).toLowerCase()))
    if(modsStaff.size === 0) {
        return distro
    }
    const estStaff = compteEstStaff(staff)
    const copie = JSON.parse(JSON.stringify(distro))
    for(const serveur of copie.servers || []) {
        serveur.modules = (serveur.modules || []).filter(m => {
            if(!modsStaff.has(nomFichier(m))) {
                return true
            }
            if(!estStaff) {
                return false
            }
            m.required = { value: true } // Toujours actif pour le staff.
            return true
        })
    }
    logger.info(estStaff ? 'Compte staff : mods staff inclus.' : 'Compte joueur : mods staff retirés.')
    return copie
}

api._loadDistributionNullable = async function() {
    if(this.devMode) {
        return await this.pullLocal()
    }
    let complete = (await this.pullRemote()).data
    if(complete != null) {
        await fs.writeJson(fichierComplet, complete)
    } else {
        try {
            complete = await fs.readJson(fichierComplet)
        } catch {
            // Ancienne installation : seule la version filtrée existe.
            return await this.pullLocal()
        }
    }
    const filtree = filtrerPourLeCompte(complete, await chargerStaff())
    await this.writeDistributionToDisk(filtree)
    return filtree
}

exports.DistroAPI = api
