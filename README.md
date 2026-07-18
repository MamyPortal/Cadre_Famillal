# Cadre familial interactif - version 2

Ce projet transforme une tablette Android en page d'accueil familiale unique.

## Fonctionnement
- une seule page principale
- heure, date et météo
- message familial
- diaporama des photos
- bouton WhatsApp
- page d'administration pour préparer `config.json`

## Ce qu'il faut créer
1. un compte Google dédié à la tablette
2. un compte GitHub pour héberger les fichiers
3. un dossier `photos/` avec vos images ou des URLs directes dans `config.json`

## Mise en ligne simple
1. créer un dépôt GitHub vide
2. déposer tous les fichiers du projet
3. activer GitHub Pages
4. ouvrir l'URL sur la tablette

## Utilisation des proches
- modifier `config.json` dans GitHub
- ou ouvrir `admin.html`, générer un nouveau JSON, puis remplacer le fichier dans le dépôt

## Note importante sur WhatsApp
L'appel vidéo ne peut pas être accepté automatiquement sans intervention. Le bouton sert à lancer WhatsApp très vite et à rendre l'appel entrant visible.

## Astuces pour une tablette âgée
- garder la tablette branchée
- activer le mode plein écran
- bloquer les réglages Android par code
- laisser un seul écran visible

## Fichiers importants
- `index.html` : écran principal
- `admin.html` : préparation de la configuration
- `app.js` : logique d'affichage
- `admin.js` : génération du JSON
- `config.example.json` : exemple à copier en `config.json`
- `photos/` : images de démonstration
