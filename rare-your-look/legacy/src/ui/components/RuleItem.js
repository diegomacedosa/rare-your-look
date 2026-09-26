import { esc } from '../../utils/dom.js';
import { icon } from '../icons.js';
import { Swatch } from './ProductCard.js';
import { EXTRA_RULE_POINTS } from '../../systems/ScoringSystem.js';

/**
 * Item da lista de regras — usado na tela de regras, no HUD do estúdio
 * (com validação ao vivo) e no resultado.
 *
 * @param {{label:string, met:boolean, isMain?:boolean, isSurprise?:boolean, rule:object}} entry
 * @param {{ basePoints?:number, showPoints?:boolean, showState?:boolean }} options
 */
export function RuleItem(entry, { basePoints = 100, showPoints = true, showState = true } = {}) {
  const points = entry.isSurprise ? 75 : entry.isMain ? basePoints : EXTRA_RULE_POINTS;
  const kind = entry.isSurprise ? 'Surpresa' : entry.isMain ? 'Regra principal' : 'Regra extra';
  const swatch = entry.rule?.type === 'required_color' ? Swatch(entry.rule.value, 'Tom pedido no desafio') : '';

  return `
    <li class="rule-item${entry.isSurprise ? ' rule-item--surprise' : ''}"
        data-met="${showState ? Boolean(entry.met) : 'false'}" data-rule="${esc(entry.rule?.type ?? '')}">
      <span class="rule-item__mark" aria-hidden="true">${icon('check', { className: '' })}</span>
      <span>
        <span class="rule-item__text">${esc(entry.label)} ${swatch}</span>
        <span class="rule-item__meta">
          <span class="chip${entry.isSurprise ? ' chip--warning' : ''}">${kind}</span>
          ${showPoints ? `<span class="chip">+${points} pts</span>` : ''}
          ${showState && entry.met ? '<span class="chip chip--success">Cumprida</span>' : ''}
        </span>
      </span>
    </li>`;
}

export function RuleList(entries, options = {}) {
  return `<ul class="rule-list" role="list">${entries.map((entry) => RuleItem(entry, options)).join('')}</ul>`;
}

export default RuleItem;
