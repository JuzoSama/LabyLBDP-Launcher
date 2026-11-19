# Guide — mettre en ligne ton launcher Projet P.A.R.A.D.O.X.

Ce qui est déjà fait dans ce dossier : le nom, le logo, les fonds, les couleurs,
la traduction française, la configuration des mises à jour automatiques.

Ce qu'il te reste à faire (une seule fois) : les 6 étapes ci-dessous.

---

## 1. Installer les outils

- [Node.js 22](https://nodejs.org/) (version LTS 22.x)
- [Git](https://git-scm.com/)
- Java 17 ([Adoptium](https://adoptium.net/)) — sert à l'étape 3
- Un compte [GitHub](https://github.com/)

## 2. Mettre ton pseudo GitHub dans le projet

Dans le dossier du launcher, ouvre un terminal :

```
npm install
node configurer.js JuzoSama
```

Cela remplace `TON-PSEUDO-GITHUB` partout. Le projet suppose deux dépôts **publics** :

| Dépôt | Contenu |
|---|---|
| `LabyLBDP-Launcher` | le code de ce dossier + les installateurs (Releases) |
| `LabyLBDP-Files` | `distribution.json`, Forge, tes mods et tes configs |

Crée ces deux dépôts vides sur GitHub (bouton **New repository**, « Public »).
Si tu veux d'autres noms, modifie `package.json`, `dev-app-update.yml`,
`app/assets/js/distromanager.js` et `app/assets/lang/_custom.toml`.

## 3. Créer la distribution (Forge 1.20.1 + tes mods)

Le launcher lit un fichier `distribution.json` qui liste tout ce que les joueurs
doivent télécharger. Ce fichier ne s'écrit pas à la main : on le génère avec
**Nebula**, l'outil officiel de Helios.

```
git clone https://github.com/dscalzi/Nebula.git
cd Nebula
npm install
```

Crée un fichier `.env` dans le dossier `Nebula` (adapte les chemins) :

```
JAVA_EXECUTABLE=C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot\bin\java.exe
ROOT=C:\LabyLBDP-Files
BASE_URL=https://raw.githubusercontent.com/JuzoSama/LabyLBDP-Files/main/
HELIOS_DATA_FOLDER=C:\Users\TonNom\AppData\Roaming\Laby LBDP
```

Puis :

```
npm run start -- init root
npm run start -- generate server LabyLBDP 1.20.1 --forge 47.4.0
```

(`47.4.0` est un exemple : mets la version de Forge 1.20.1 de ton serveur.)

Dans `C:\LabyLBDP-Files\servers\LabyLBDP-1.20.1\` :

- `forgemods\required\` → les mods obligatoires (`.jar`)
- `forgemods\optionalon\` → mods optionnels activés par défaut
- `forgemods\optionaloff\` → mods optionnels désactivés par défaut
- `files\` → configs, resource packs… (même arborescence que `.minecraft`)
- `servermeta.json` → nom, description et **adresse IP** du serveur

Génère ensuite le fichier :

```
npm run start -- generate distro
```

Enfin, envoie tout le dossier `C:\LabyLBDP-Files` dans ton dépôt `LabyLBDP-Files` :

```
cd C:\LabyLBDP-Files
git init -b main
git add .
git commit -m "Distribution initiale"
git remote add origin https://github.com/JuzoSama/LabyLBDP-Files.git
git push -u origin main
```

**À chaque changement de mods** : remplace les `.jar`, relance `generate distro`,
puis `git add . && git commit -m "Mise à jour des mods" && git push`.
Les joueurs reçoivent les nouveaux mods au prochain clic sur JOUER.

> GitHub refuse les fichiers de plus de 100 Mo. Si un de tes mods dépasse cette
> taille, il faudra l'héberger ailleurs (par exemple ton hébergement web Minestrator).

## 4. Connexion Microsoft (obligatoire)

Le launcher contient encore l'identifiant Microsoft du Helios d'origine. Il te faut le tien :

1. Suis `docs/MicrosoftAuth.md` (en anglais) pour créer une application sur
   portal.azure.com et copier son **Application (client) ID**.
2. Colle-le dans `app/assets/js/ipcconstants.js` (`AZURE_CLIENT_ID`).
3. Lance le launcher et essaie de te connecter une fois (ça échoue, c'est normal),
   puis fais la demande d'autorisation à Microsoft décrite à la fin du même document.
   Cette validation peut prendre plusieurs jours.

## 5. Tester sur ton PC

```
npm start
```

Tant que `distribution.json` n'est pas en ligne (étape 3), le launcher affiche
« Erreur fatale : impossible de charger l'index de distribution ». C'est normal.

## 6. Publier le launcher et activer les mises à jour automatiques

Première mise en ligne du code :

```
git init -b main
git add .
git commit -m "Laby LBDP Launcher 1.0.0"
git remote add origin https://github.com/JuzoSama/LabyLBDP-Launcher.git
git push -u origin main
```

Pour sortir une version (la première comme les suivantes) :

1. Change `"version"` dans `package.json` (ex. `1.0.1`).
2. `git commit -am "Version 1.0.1"` puis `git tag v1.0.1` puis `git push --follow-tags`
   (ou `git push && git push --tags`).
3. GitHub compile tout seul les installateurs Windows, macOS et Linux
   (onglet **Actions**, environ 10 minutes).
4. Onglet **Releases** : une version « Draft » est apparue. Ouvre-la et clique sur
   **Publish release**.

Les joueurs téléchargent `Laby-LBDP-setup-x.y.z.exe` depuis la page Releases.
Ensuite, à chaque nouvelle release publiée, leur launcher la détecte et se met à jour.

À savoir :

- Windows et Linux : mise à jour entièrement automatique.
- macOS : sans certificat Apple payant, le launcher propose seulement de
  télécharger le nouveau `.dmg`.
- Windows affichera « éditeur inconnu » à l'installation tant que l'installateur
  n'est pas signé avec un certificat (payant, facultatif).

---

## Personnaliser

| Quoi | Où |
|---|---|
| Couleur principale | `app/assets/css/theme.css` → `--accent` |
| Fonds d'écran | `app/assets/images/backgrounds/` (`0.jpg`, `1.jpg`, … numérotés sans trou ; mets-y tes captures d'écran) |
| Logo | `app/assets/images/SealCircle.png` + `.ico`, `build/icon.png` + `.ico` + `.icns` |
| Animation de chargement | `LoadingSeal.png` (centre fixe) et `LoadingText.png` (anneau qui tourne) |
| Texte de bienvenue, liens Discord / YouTube… | `app/assets/lang/_custom.toml` |
| Tous les autres textes | `app/assets/lang/fr_FR.toml` |
| Nom du launcher | `package.json` (`productName`), `electron-builder.yml`, `_custom.toml` |
| Statut Discord des joueurs | `meta/distrometa.json` et `servermeta.json` dans Nebula (il faut créer une application sur le portail développeur Discord) |
| Actualités (bouton ACTUS) | champ `rss` de `meta/distrometa.json` dans Nebula (adresse d'un flux RSS) |

Les données des joueurs sont stockées dans le dossier `.labylbdp`
(`%APPDATA%\.labylbdp` sous Windows).
