## 🍿 À propos du projet

**NextClap** est une application web conçue spécialement pour les passionnés de cinéma, pas seulement ceux qui aiment les films, mais ceux qui vibrent pour **l'expérience unique de la salle obscure**.

L'objectif de NextClap est de centraliser et de clarifier l'accès aux sorties cinématographiques, souvent éparpillées sur le web. L'application propose une interface épurée et intuitive divisée en trois piliers essentiels :
* 📅 **Les sorties de la semaine** : Pour planifier sa séance du jour.
* 🚀 **Les sorties à venir (dans le mois)** : Pour anticiper les futurs blockbusters ou films d'auteur.
* 🎬 **Toujours en salle** : Pour ne pas rater les films en fin d'affiche.

### 🔮 Feuille de route (Roadmap)
Le projet est actuellement dans sa première phase (regroupement clair et design fluide). Les prochaines étapes de développement incluent :
- [ ] Création de comptes utilisateurs (Authentification sécurisée).
- [ ] Gestion d'une "Watchlist" personnalisée pour ajouter ses films favoris.
- [ ] Système de rappels automatisés pour ne plus jamais louper un film avant sa sortie des salles.

## 🚀 Features

* 📱 **Approche Mobile-First & Responsive** : L'application a été entièrement pensée et optimisée d'abord pour les smartphones (pour être consultable facilement devant le cinéma ou dans les transports), tout en s'adaptant parfaitement aux tablettes et ordinateurs.
* 🎬 **Parcourir divers films** : Accès rapide aux sorties de la semaine, aux films actuellement à l'affiche et aux nouveautés à venir dans le mois.
* 🔍 **Rechercher des films** : Moteur de recherche par titre en temps réel.
* 🎭 **Filtrer par genre** : Navigation ciblée selon les goûts de l'utilisateur.
* 📊 **Trier les résultats** : Classement dynamique par dates de sortie ou par popularité.
* 🍿 **Informations détaillées** : Consultation du synopsis, du casting, du réalisateur et visionnage de la bande-annonce pour chaque film.
* 🛡️ **Navigation fluide** : Expérience utilisateur cohérente et sécurisée d'une page à l'autre grâce au routeur d'Angular.

## 🛠️ Stack Technique

### Actuelle (V1 - Client-only)
* **Frontend :** Angular 18+
* **Gestion des données :** Consommation directe de l'API externe **TMDB** (The Movie Database)
* **Design & Composants :** PrimeNG & PrimeIcons
* **Styling :** SCSS / SASS (préprocesseur CSS) 🎨
* **Build Tools & Environnement :** Angular CLI, TypeScript, RxJS

### 🔮 Évolution Future (V2 - Fullstack)
Pour intégrer le système de comptes utilisateurs et de listes personnalisées, l'architecture va évoluer vers :
* **Backend :** Java (Spring Boot)
* **Base de données :** PostgreSQL ou MySQL
* **Hybridation API :** Le backend servira de relais pour stocker les données utilisateurs tout en continuant de requêter l'API TMDB pour le catalogue de films.

### 📦 Dépendances Principales
```json
{
  "@angular/core": "^...",
  "primeng": "^...",
  "primeicons": "^...",
  "rxjs": "^..."
}
```

## 📦 Installation
Pour commencer à utiliser NextClap, suivez les étapes suivantes :
1. Clonez le dépôt à l'aide de la commande `git clone https://github.com/your-repo/nextclap.git`
2. Installez les dépendances à l'aide de la commande `npm install`
3. Configurez les variables d'environnement dans le fichier `environment.ts`
4. Compilez l'application à l'aide de la commande `ng build`
5. Lancez l'application à l'aide de la commande `ng serve`

## 📂 Project Structure
```markdown
nextclap/
├── public/
│   ├── fonts/
│   ├── icons/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── genre-selector/
│   │   │   ├── headline-movie-card/
│   │   │   ├── landing-page/
│   │   │   ├── movie-card/
│   │   │   ├── movie-details/
│   │   │   ├── movie-list/
│   │   │   ├── movie-releases/
│   │   │   ├── navbar/
│   │   │   ├── now-playing-movies/
│   │   │   ├── search-bar/
│   │   │   ├── sort-selector/
│   │   │   ├── upcoming-movie-releases/
│   │   ├── models/
│   │   │   ├── movie-details.ts
│   │   │   ├── movie-genre.ts
│   │   │   ├── movie.ts
│   │   ├── services/
│   │   │   ├── date-utils.service.ts
│   │   │   ├── genres.service.ts
│   │   │   ├── movies.service.ts
│   │   │   ├── navigation.service.ts
│   │   ├── app.config.ts
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   ├── app.scss
│   │   ├── app.ts
│   ├── environments/
│   ├── styles/
│   │   │   ├── abstracts/
│   │   │   │   ├── breakpoints.scss
│   │   │   │   ├── colors.scss
│   │   │   │   ├── fonts.scss
│   │   │   │   ├── radius.scss
│   │   │   │   ├── typography.scss
│   │   │   ├── base/
│   │   │   │   ├── global-typography.scss
│   │   │   │   ├── global.scss
│   │   │   │   ├── reset.scss
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss
├── .gitignore
├── .prettierrc
├── angular.json
├── package-lock.json
├── package.json
├── set-env.js
├── tsconfig.app.json
├── tsconfig.json
```
## 📸 Screenshots
<img width="1015" height="660" alt="Capture d’écran 2026-07-20 à 11 37 43" src="https://github.com/user-attachments/assets/118947a2-5c4b-4dab-803d-fef27f8e58b8" />

## 👩‍💻 Auteur

Développé avec passion (et beaucoup de pop-corn 🍿) par **[Lisa Bureau](https://github.com/Lisa-Bureau)**.

*N'hésitez pas à me faire vos retours ou à me contacter pour échanger sur le projet !*
