# EcoBlissBath
Eco Bliss Bath est une start-up de 20 personnes, spécialisée dans la vente de produits de beauté écoresponsables dont le produit principal est un savon solide.
La strat-up met en avant une large gamme de savons solides avec des fonctionnalités telles que :
- Une interface intuitive pour les utilisateurs.
- Une gestion des stocks dynamique.
- Une intégration d'API pour gérer les commandes des utilisateurs.

## Installation
### Prérequis
Pour le lancement du projet vous aurez besoin de :
- Node.js,
- npm ou yarn,
- Docker,
- Un navigateur moderne,
- Cypress.

### Étapes
#### 1. Téléchargez ou clonez le dépôt depuis :
https://github.com/OpenClassrooms-Student-Center/TesteurLogiciel_Automatisez_des_tests_pour_une_boutique_en_ligne

#### 2. Déploiement :
Ouvrez un terminal dans le dossier du projet, puis exécutez la commande :<br>
**docker-compose up --build**

#### 3. Installez les dépendances :
**npm install<br>**
ou<br>
**yarn install**

#### 4. Lancez l'application :
**npm start<br>**
ou<br>
**yarn start**

#### 5. Accédez à l'application :
Depuis le navigateur en saisissant l'URL :<br>
**http://localhost:8080/**

#### 6. Accédez à la documentation de l'API :
Depuis le navigateur en saisissant l'URL :<br>
**http://localhost:8081/api/doc/**

#### 7. Login :
**identifiant**: test2@test.fr<br>
**mot de passe**: testtest

## Procédure pour lancer les tests automatiques :
### Installation de Cypress :<br>
1. Le projet doit contenir un fichier package.json. Si ce n’est pas encore fait, initialisez-le avec : **npm init -y<br>**
2. Installez Cypress en tant que dépendance de développement avec : **npm install cypress --save-dev<br>**
### Lancement de Cypress :<br>
1. Ouvrez l'interface graphique de Cypress avec : **npx cypress open<br>**
2. Pour exécuter Cypress en mode headless (sans interface graphique) : **npx cypress run<br>**
### Génération des rapports de tests :
En utilisant la commande **npx cypress run<br>**

## Auteur :
Ines KAMMOUN KTARI<br>
ineskammoun24@hotmail.fr

## Historique des versions :
- **v1.0.0** : Tests manuels.<br>
- **v2.0.0** : Tests automatisés avec Cypress.
