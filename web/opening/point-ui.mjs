import {rules,attributes,allocation,skillBudget,sum,validateCharacter,validateAllocation} from './points.mjs';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function pointPanel(character,message='') {
  const result=allocation(character),total=sum(character.attr),errors=validateCharacter(character);
  const verification=validateAllocation(character,result.skills);
  const budgets=['academic','skills'].map(kind=>skillBudget(character,kind));
  return `<p class="attribute-total">能力值已分配／總額：<b>${total} / ${rules.attributeTotal}</b></p>
    <div class="pool-budgets">${budgets.map(b=>`<section class="card pool-budget" aria-label="${b.kind==='academic'?'Academic':'Other'} 點數預算" data-budget="${b.kind}"><h3>${b.kind==='academic'?'Academic Skills · 學科':'Other Skills · 其他技能'}</h3><dl>${[['base','Base · 基礎'],['bonus','Bonus · 加成'],['total','Total Available · 總可用'],['allocated','Allocated · 已投入'],['remaining','Remaining · 剩餘']].map(([key,label])=>`<div><dt>${label}</dt><dd data-budget-value="${key}">${b[key]}</dd></div>`).join('')}</dl><div class="allocation-proof" data-allocation-status="${verification.valid?'valid':'invalid'}"><p><b>${verification.valid?'來源驗證通過':'來源驗證失敗：總額相符不代表合法'}</b></p><p>Base 實際已用：${result.pools.find(p=>p.id===(b.kind==='academic'?'academic':'general')).used} / 200</p>${result.unfunded?'<p>存在未支付點數，請查看下方錯誤。</p>':''}</div><div class="bonus-sources">${b.sources.filter(p=>attributes.includes(p.id)).map(p=>`<p data-bonus-source="${p.id}"><b>${p.id} Bonus +${p.generated}</b> · 另一池使用 ${p.reserved} · 本池可用 <b>${p.amount}</b><br><strong>本區實際投入：${result.skills.filter(s=>s.kind===b.kind).reduce((n,s)=>n+s.attributeBonusContributions[p.id],0)} / ${p.amount}</strong><br><small>實際流向：${result.skills.filter(s=>s.kind===b.kind&&s.attributeBonusContributions[p.id]>0).map(s=>s.name+' '+s.attributeBonusContributions[p.id]).join('、')||'尚未投入'}</small><br><small>限：${p.eligibleSkills.join("、")}</small></p>`).join("")}</div></section>`).join('')}</div>
    <p class="hint">每池總可用＝基礎＋適用加成（已扣除另一池使用的共用加成）。未用的 INT 可供任一池使用，兩池上限不可直接相加；加成只能投入對應技能。</p>
    <p class="hint">一般創角：能力值單項上限 65，技能單項上限 75。能力值需分配完 250 點；技能點可保留。</p>
    ${character.dev?'<p class="point-warning">Developer Override 已啟用：可突破能力值總額與單項上限、技能單項上限；仍須由合法點數來源支付，不額外免費發點。</p>':''}
    <p class="point-error" role="status">${escape(message||errors.join(' '))}</p>
    <details id="point-sources" class="card" ${character.sourcesOpen?'open':''}><summary>Point Sources / Calculation · 點數來源／計算方式</summary>
      <p class="hint">系統依技能自動分配可用來源；修改配點時可能重新分配來源。同一份 Bonus 只有一個額度，不會按技能群重複發放。能力值 ≤ 50 不扣基礎點。</p>
      ${budgets.map(b=>`<section class="point-source"><h3>${b.kind==='academic'?'Academic':'Other'} 預算計算</h3><p>${b.base} Base + ${b.bonus} Bonus = ${b.total} Total；${b.total} − ${b.allocated} Allocated = ${b.remaining} Remaining</p>${b.sources.filter(p=>attributes.includes(p.id)).map(p=>`<p>${p.id}：產生 ${p.generated} − 另一池使用 ${p.reserved} = 本池可用 ${p.amount}</p>`).join('')}</section>`).join('')}
      ${result.pools.map(pool=>`<section class="point-source"><h3>${pool.label}：${pool.amount} 點</h3>
        ${attributes.includes(pool.id)?`<p><code>${pool.id} Bonus = max(0, ${character.attr[pool.id]} - ${rules.baseline}) = ${pool.amount}</code></p>`:'<p>所有角色固定獲得 200 點，不受能力值影響。</p>'}
        <p>已用 ${pool.used} ／剩餘 ${pool.remaining}</p><p class="hint">可投入：${pool.skills.join('、')}</p>
        ${pool.allocations.length?`<p class="hint">實際分配：${pool.allocations.map(a=>`${a.name} ${a.points}`).join('、')}</p>`:''}</section>`).join('')}
      <section class="point-source"><h3>Skill Allocation · 每項技能的點數來源</h3>${result.skills.filter(skill=>skill.allocated>0).map(skill=>`<p>${skill.name} ${skill.allocated} = ${skill.sources.map(source=>`${source.poolId} ${source.points}`).join(" + ")||"0"}${skill.unfunded?` + 未支付 ${skill.unfunded}`:""}<br><small>Base contribution：${skill.baseContribution}；Attribute Bonus contribution：${Object.entries(skill.attributeBonusContributions).filter(([,points])=>points>0).map(([id,points])=>id+" "+points).join("、")||"0"}</small></p>`).join("")||"<p>尚未分配技能點。</p>"}</section>
      ${result.unfunded?`<p class="point-error">尚有 ${result.unfunded} 點沒有可用來源${character.dev?'（開發者覆寫）':''}。</p>`:''}
    </details>`;
}
