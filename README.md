
# CDS Flashcard-Base

## Description du projet

CDS Flashcard-Base est une application web moderne pour créer, gérer et étudier des flashcards interactives. L'application permet aux utilisateurs de créer des decks de flashcards organisés par thèmes, avec support multimédia (images, audio).

## Fonctionnalités principales

- **Création de flashcards** : Créez des flashcards avec texte, images et audio
- **Organisation par thèmes** : Organisez vos flashcards en thèmes au sein d'un deck
- **Partage de decks** : Partagez vos decks avec d'autres utilisateurs
- **Import/Export** : Sauvegardez et restaurez vos données
- **Interface responsive** : Optimisée pour tous les appareils
- **Base de données SQLite** : Stockage local sécurisé

## Technologies utilisées

- **Frontend** : React, TypeScript, Vite
- **Interface** : Tailwind CSS, shadcn/ui
- **Base de données** : SQLite (via sql.js)
- **Routing** : React Router
- **Icônes** : Lucide React

## Installation et démarrage

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. Clonez le repository :
```bash
git clone <URL_DU_REPOSITORY>
cd cds-flashcard-base
```

2. Installez les dépendances :
```bash
npm install
```

3. Démarrez le serveur de développement :
```bash
npm run dev
```

4. Ouvrez votre navigateur et accédez à `http://localhost:5173`

## Scripts disponibles

- `npm run dev` : Démarre le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run preview` : Prévisualise la version de production
- `npm run lint` : Vérifie le code avec ESLint

## Structure du projet

```
src/
├── components/         # Composants réutilisables
├── pages/             # Pages de l'application
├── lib/               # Utilitaires et services
├── hooks/             # Hooks React personnalisés
├── styles/            # Fichiers de styles
└── services/          # Services externes
```

## Fonctionnalités avancées

### Système de sessions

L'application utilise un système de clés de session pour permettre aux utilisateurs de sauvegarder leurs données sans nécessiter de compte. Chaque utilisateur peut :

- Générer une clé de session unique
- Exporter ses données pour sauvegarde
- Importer des données depuis une sauvegarde
- Partager des decks via des codes d'export

### Base de données SQLite

Toutes les données sont stockées localement dans une base SQLite qui gère :

- Informations des utilisateurs
- Decks de flashcards
- Thèmes et organisation
- Fichiers média (images, audio)
- Statistiques d'apprentissage

### Import/Export de decks

Les utilisateurs peuvent :

- Exporter un deck individuel au format SQLite compressé
- Importer des decks partagés par d'autres utilisateurs
- Préserver toutes les données (cartes, thèmes, médias)

## Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajout d'une nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository GitHub.

## Roadmap

- [ ] Mode hors ligne complet
- [ ] Synchronisation entre appareils
- [ ] Statistiques d'apprentissage avancées
- [ ] Support de nouvelles langues
- [ ] Application mobile native

---

Créé avec passion en 2025 pour faciliter l'apprentissage par flashcards.
