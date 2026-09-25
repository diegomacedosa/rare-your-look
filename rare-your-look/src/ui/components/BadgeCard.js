import { esc } from '../../utils/dom.js';
import { icon } from '../icons.js';
import { formatDate } from '../../utils/format.js';

/**
 * Card de distintivo com progresso (SPEC §4.2 — CENA 8 e CENA 10).
 * @param {object} badge resultado de RewardSystem.badgeProgress()
 */
export function BadgeCard(badge) {
  const percent = Math.round(badge.ratio * 100);
  return `
    <article class="badge-card" data-unlocked="${badge.unlocked}">
      <span class="badge-card__medal" aria-hidden="true">${icon(badge.unlocked ? 'medal' : 'lock', { className: 'badge-card__icon' })}</span>
      <div class="badge-card__body">
        <h3 class="badge-card__name">${esc(badge.name)}</h3>
        <p class="tiny">${esc(badge.description)}</p>
        ${badge.unlocked
          ? `<p class="tiny badge-card__date">Conquistado em ${formatDate(badge.unlockedAt)}</p>`
          : `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${badge.goal}"
                aria-valuenow="${badge.current}" aria-label="Progresso de ${esc(badge.name)}">
               <div class="progress__fill" style="width:${percent}%"></div>
             </div>
             <p class="tiny">${badge.current} de ${badge.goal}</p>`}
      </div>
    </article>`;
}

export default BadgeCard;
