import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateUtilsService {

  /**
   * Calcule la date du mercredi de la semaine en cours (jour officiel des sorties cinéma en France).
   * @returns {Date} Objet Date correspondant au mercredi de la semaine actuelle.
   */
  getCurrentWednesday(): Date {
      const today = new Date();
      const day = today.getDay();

      const diff = day >= 3 ? day -3 : day + 4;

      const wednesday = new Date(today);
      wednesday.setDate(today.getDate() - diff);

      return wednesday;
  }

  /**
   * Calcule le mercredi de la semaine prochaine.
   */
  getNextWednesday(): Date {
      const currentWednesday = this.getCurrentWednesday();
      const nextWednesday = new Date(currentWednesday);
      nextWednesday.setDate(currentWednesday.getDate() + 7);
      
      return nextWednesday;
  }

  /**
   * Calcule la date de fin de la fourchette de recherche (Mercredi prochain + 1 mois).
   */
  getNextMonth(): Date {
      const endPeriod = new Date(this.getNextWednesday());
      endPeriod.setDate(endPeriod.getDate() + 28);

      return endPeriod;
  }

  /**
   * Convertit un objet Date au format standard attendu par TMDB (YYYY-MM-DD).
   */
  formatDate(date: Date): string {
      return date.toISOString().split('T')[0];
  }

  /**
   * Génère un tableau de dates (au format string YYYY-MM-DD) espacées de 7 jours 
   * entre une date de départ et une date de fin.
   * @param {Date} startDate - La date pivot de départ (ex: ce mercredi)
   * @param {Date} endDate - La date limite (ex: dans 30 jours)
   * @returns {string[]} Tableau contenant les dates formatées (ex: ['2026-07-01', '2026-07-08', ...])
   */
  getWednesdaysUpcomingList(startDate: Date, endDate: Date): string[] {
      const datesArray: string[] = [];
      
      // 1. On crée une copie pour ne pas modifier la date d'origine par erreur
      let currentCursor = new Date(startDate);

      // Valeur en millisecondes d'une semaine (7 jours * 24h * 60m * 60s * 1000ms)
      const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

      // 2. Tant que notre curseur n'a pas dépassé la date de fin
      while (currentCursor.getTime() <= endDate.getTime()) {
          
          // On formate la date du curseur actuel et on l'ajoute au tableau
          const formattedDate = this.formatDate(currentCursor);
          datesArray.push(formattedDate);

          // 3. LA MAGIE : On fait avancer le curseur de 7 jours en passant par les millisecondes
          const nextWeekTime = currentCursor.getTime() + ONE_WEEK_IN_MS;
          currentCursor = new Date(nextWeekTime);
      }

      return datesArray;
  }
}
