const STORAGE_KEY = 'greengrade_cases_indonesia_v3';
let casesData = [], selectedCaseId = 'benowo', modalMode = 'add', draftCase = null, currentScenario = 'current';

const dimensions = [
  { id: 'circularity', name: 'Circularity & Feedstock Integrity', weight: 0.20, metrics: [
    ['sorting', 'Waste sorting rate at source', [['100', '≥60%'], ['70', '40-60%'], ['40', '20-40%'], ['10', '<20% or unknown']]],
    ['nonRecyclable', 'Non-recyclable waste allocated to WtE', [['100', '≥70%'], ['70', '50-70%'], ['40', '30-50%'], ['10', '<30% or unknown']]],
    ['feedstockConsistency', 'Monthly feedstock consistency', [['100', '<5% variance'], ['70', '5-15% variance'], ['40', '15-30% variance'], ['10', '>30% variance or unknown']]],
    ['loopClosure', 'Circular loop closure', [['100', 'ash and residue reused'], ['70', 'partial reuse'], ['40', 'minimal reuse'], ['10', 'none or unknown']]]
  ]},
  { id: 'multiProduct', name: 'Multi-Product Value Creation', weight: 0.20, metrics: [
    ['outputs', 'Marketable WtE outputs', [['100', '≥4 outputs'], ['70', '3 outputs'], ['40', '2 outputs'], ['10', 'electricity only or unknown']]],
    ['nonElectricRevenue', 'Non-electricity revenue share', [['100', '≥30%'], ['70', '20-30%'], ['40', '10-20%'], ['10', '<10% or unknown']]],
    ['bioMethanol', 'Bio-methanol capacity', [['100', '>10,000 t/year'], ['70', '1,000-10,000 t/year'], ['40', '100-1,000 t/year'], ['10', '<100 t/year, none, or unknown']]],
    ['faba', 'FABA utilization rate', [['100', '≥60%'], ['70', '40-60%'], ['40', '20-40%'], ['10', '<20% or unknown']]]
  ]},
  { id: 'standardization', name: 'Product Standardization', weight: 0.20, metrics: [
    ['certification', 'Product certifications obtained', [['100', 'SNI + international certification'], ['70', 'SNI only'], ['40', 'in process'], ['10', 'none or unknown']]],
    ['testing', 'Quality testing frequency', [['100', 'continuous or automated'], ['70', 'monthly'], ['40', 'quarterly'], ['10', 'ad hoc, none, or unknown']]],
    ['traceability', 'Feedstock traceability system', [['100', 'digital and MRV-linked'], ['70', 'manual records'], ['40', 'partial records'], ['10', 'none or unknown']]],
    ['compliance', 'Regulatory compliance rate', [['100', '≥90%'], ['70', '75-90%'], ['40', '60-75%'], ['10', '<60% or unknown']]]
  ]},
  { id: 'offtake', name: 'Offtake & Market Readiness', weight: 0.15, metrics: [
    ['securedOutput', 'Output secured by MoU or contract', [['100', '≥70%'], ['70', '50-70%'], ['40', '30-50%'], ['10', '<30% or unknown']]],
    ['offtakerType', 'Primary offtaker type', [['100', 'SOE / PNRE / state-backed offtaker'], ['70', 'industrial buyer with long-term contract'], ['40', 'spot market'], ['10', 'no offtaker or unknown']]],
    ['demandGrowth', 'Market demand growth', [['100', 'strong demand, >10% CAGR'], ['70', 'moderate demand, 5-10% CAGR'], ['40', 'weak demand, 0-5% CAGR'], ['10', 'declining or unknown']]]
  ]},
  { id: 'carbonMRV', name: 'Carbon Reduction & MRV', weight: 0.15, metrics: [
    ['ghgReduction', 'GHG reduction vs landfill baseline', [['100', '≥0.8 tCO2e/t MSW'], ['70', '0.5-0.8'], ['40', '0.3-0.5'], ['10', '<0.3 or unknown']]],
    ['mrvStatusScore', 'MRV system status', [['100', 'active and third-party verified'], ['70', 'active but self-reported'], ['40', 'in development'], ['10', 'none or unknown']]],
    ['carbonCredit', 'Carbon credit pathway', [['100', 'registered'], ['70', 'in preparation'], ['40', 'exploring'], ['10', 'not planned or unknown']]],
    ['emissionReporting', 'Emission reporting frequency', [['100', 'quarterly or more'], ['70', 'annual'], ['40', 'ad hoc'], ['10', 'none or unknown']]]
  ]},
  { id: 'financial', name: 'Financial Bankability', weight: 0.10, metrics: [
    ['irrScore', 'Projected IRR', [['100', '≥15%'], ['70', '12-15%'], ['40', '8-12%'], ['10', '<8% or unknown']]],
    ['tippingFeeScore', 'Tipping fee', [['100', '>Rp150,000/ton'], ['70', 'Rp80,000-150,000/ton'], ['40', 'Rp40,000-80,000/ton'], ['10', '<Rp40,000/ton or unknown']]],
    ['dscrScore', 'DSCR', [['100', '>1.5x'], ['70', '1.2-1.5x'], ['40', '1.0-1.2x'], ['10', '<1.0x or unknown']]],
    ['paybackScore', 'Payback period', [['100', '<8 years'], ['70', '8-12 years'], ['40', '12-18 years'], ['10', '>18 years or unknown']]]
  ]}
];

const defaultCases = [
  { id: 'benowo', name: 'PLTSa Benowo', country: 'Indonesia', location: 'Surabaya, East Java', operator: 'PT Sumber Organik', projectType: 'Operational PSEL / municipal waste-to-electricity reference', wasteCapacity: '1,600 tons/day', mainOutput: 'Electricity', byProducts: 'FABA potential', offtakeStatus: 'Electricity offtake visible; by-product offtake unclear', sourceNote: 'Indonesia reference simulation based on publicly available PLTSa Benowo information; not an official rating.', dataConfidence: 'medium', scores: { sorting: 40, nonRecyclable: 70, feedstockConsistency: 70, loopClosure: 40, outputs: 40, nonElectricRevenue: 10, bioMethanol: 10, faba: 10, certification: 10, testing: 40, traceability: 40, compliance: 70, securedOutput: 70, offtakerType: 100, demandGrowth: 70, ghgReduction: 40, mrvStatusScore: 40, carbonCredit: 10, emissionReporting: 40, irrScore: 40, tippingFeeScore: 70, dscrScore: 40, paybackScore: 40 }, financial: { IRR: '9-11%', payback: '8-12 years', DSCR: '1.0-1.2x', tippingFee: 'Rp80k-150k/ton' }, carbon: { ghgReduction: '180K tCO2e/yr', mrvStatus: 'In development', carbonCreditStatus: 'Exploring' }, notes: 'Best used as operational Indonesian reference. Green Grade can highlight gaps in FABA certification, circular offtake, MRV, and investor disclosure.' },
  { id: 'cilacap_rdf', name: 'RDF Cilacap', country: 'Indonesia', location: 'Cilacap, Central Java', operator: 'Cilacap Regency / RDF ecosystem with cement offtake reference', projectType: 'Operational RDF facility / waste-to-industrial fuel reference', wasteCapacity: '150-160 tons/day', mainOutput: 'RDF for cement industry', byProducts: 'RDF fuel; residual sorting outputs', offtakeStatus: 'Industrial offtake reference through cement sector', sourceNote: 'Indonesia reference simulation based on public RDF Cilacap information; not an official rating.', dataConfidence: 'medium', scores: { sorting: 70, nonRecyclable: 70, feedstockConsistency: 70, loopClosure: 40, outputs: 70, nonElectricRevenue: 70, bioMethanol: 10, faba: 10, certification: 40, testing: 70, traceability: 40, compliance: 70, securedOutput: 70, offtakerType: 70, demandGrowth: 70, ghgReduction: 40, mrvStatusScore: 40, carbonCredit: 10, emissionReporting: 40, irrScore: 40, tippingFeeScore: 70, dscrScore: 40, paybackScore: 40 }, financial: { IRR: '8-12%', payback: '10-14 years', DSCR: '1.0-1.2x', tippingFee: 'Municipal + industrial fuel value' }, carbon: { ghgReduction: 'Indicative', mrvStatus: 'Partial / in development', carbonCreditStatus: 'Not yet clear' }, notes: 'Useful for Pertamina collaboration because it shows how waste-derived output can enter an industrial offtake pathway, even if it is RDF rather than electricity.' },
  { id: 'legok_nangka', name: 'PSEL Legok Nangka', country: 'Indonesia', location: 'Bandung Regency, West Java', operator: 'West Java PPP / Jabar Environmental Solutions reference', projectType: 'PPP WtE development / regional waste-to-electricity candidate', wasteCapacity: '≈2,000 tons/day planned', mainOutput: 'Electricity', byProducts: 'FABA and circular output potential', offtakeStatus: 'PPP / regional government-backed development', sourceNote: 'Indonesia reference simulation based on public Legok Nangka PPP information; not an official rating.', dataConfidence: 'medium', scores: { sorting: 40, nonRecyclable: 70, feedstockConsistency: 70, loopClosure: 40, outputs: 40, nonElectricRevenue: 10, bioMethanol: 10, faba: 40, certification: 40, testing: 40, traceability: 40, compliance: 70, securedOutput: 40, offtakerType: 100, demandGrowth: 70, ghgReduction: 40, mrvStatusScore: 40, carbonCredit: 40, emissionReporting: 40, irrScore: 40, tippingFeeScore: 70, dscrScore: 40, paybackScore: 40 }, financial: { IRR: '8-12%', payback: '12-16 years', DSCR: '1.0-1.2x', tippingFee: 'PPP-dependent' }, carbon: { ghgReduction: 'Project-stage estimate', mrvStatus: 'To be developed', carbonCreditStatus: 'Exploring' }, notes: 'Useful as a future Pertamina/PNRE partnership candidate because it has regional scale, PPP structure, and potential for stronger investor disclosure.' },
  { id: 'rorotan_rdf', name: 'RDF Rorotan / Jakarta', country: 'Indonesia', location: 'Rorotan, North Jakarta', operator: 'DKI Jakarta waste management reference', projectType: 'RDF facility / landfill pressure reduction candidate', wasteCapacity: '300-1,000 tons/day staged operation', mainOutput: 'RDF / alternative fuel', byProducts: 'RDF fuel and sorted residual streams', offtakeStatus: 'Industrial fuel offtake potential; strategic Jakarta waste reduction case', sourceNote: 'Indonesia reference simulation based on public RDF Rorotan information; not an official rating.', dataConfidence: 'medium', scores: { sorting: 40, nonRecyclable: 70, feedstockConsistency: 40, loopClosure: 40, outputs: 70, nonElectricRevenue: 40, bioMethanol: 10, faba: 10, certification: 40, testing: 40, traceability: 40, compliance: 70, securedOutput: 40, offtakerType: 70, demandGrowth: 70, ghgReduction: 40, mrvStatusScore: 40, carbonCredit: 10, emissionReporting: 40, irrScore: 40, tippingFeeScore: 70, dscrScore: 40, paybackScore: 40 }, financial: { IRR: '8-12%', payback: '10-15 years', DSCR: '1.0-1.2x', tippingFee: 'Municipal-dependent' }, carbon: { ghgReduction: 'Indicative', mrvStatus: 'In development', carbonCreditStatus: 'Not yet clear' }, notes: 'Useful for Pertamina collaboration because it links major urban waste pressure with fuel-substitution and industrial offtake potential.' }
];

function clone(o) { return JSON.parse(JSON.stringify(o)) }

function init() {
  try { casesData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(defaultCases) } catch (e) { casesData = clone(defaultCases) }
  if (!casesData.find(c => c.id === selectedCaseId)) selectedCaseId = casesData[0].id;
  renderAll();
}

function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(casesData)) }

function getCase() { return casesData.find(c => c.id === selectedCaseId) || casesData[0] }

function scrollToId(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

function dimScore(c, d) { let v = d.metrics.map(m => Number(c.scores?.[m[0]] ?? 10)); return v.reduce((a, b) => a + b, 0) / v.length }

function total(c) { return dimensions.reduce((s, d) => s + dimScore(c, d) * d.weight, 0) }

function grade(s) {
  if (s >= 80) return { g: 'A', t: 'Investment & partnership ready', c: 'var(--soft)' };
  if (s >= 60) return { g: 'B', t: 'Transition ready', c: 'var(--orange)' };
  if (s >= 40) return { g: 'C', t: 'Conditional, needs improvement', c: 'var(--yellow)' };
  return { g: 'D', t: 'High risk / not eligible', c: 'var(--red)' };
}

function renderAll() {
  renderTabs(); renderHero(); renderBars(); renderRadar(); renderInsights(); renderCompare(); renderForm(); renderLibrary();
}

function renderTabs() {
  document.getElementById('caseTabs').innerHTML = casesData.map(c => `<button class="tab ${c.id === selectedCaseId ? 'active' : ''}" onclick="selectCase('${c.id}')"><b>${esc(c.name)} — ${esc(c.country)}</b><span>${esc(c.projectType || 'WtE reference case')}</span></button>`).join('');
}

function selectCase(id) { selectedCaseId = id; currentScenario = 'current'; renderAll(); }

function renderHero() {
  let c = getCase(), s = Math.round(total(c)), g = grade(s);
  document.getElementById('gradeLetter').textContent = g.g;
  document.getElementById('totalScore').textContent = s;
  document.getElementById('gradeName').textContent = g.t;
  document.getElementById('needle').style.left = Math.max(0, Math.min(100, s)) + '%';

  let card = document.querySelector('.grade-card');
  card.className = `grade-card bg-grade-${g.g}`;
  let b = Number(c.baselineScore || s), diff = s - b;
  document.getElementById('deltaScore').textContent = currentScenario === 'upgrade' ? `${diff >= 0 ? '+' : ''}${diff} pts vs baseline` : `Data confidence: ${c.dataConfidence || 'medium'}`;
  let k = [['Waste capacity', c.wasteCapacity, c.location], ['Main output', c.mainOutput, c.projectType], ['By-products', c.byProducts, 'Circular value stream'], ['Offtake status', c.offtakeStatus, 'Market readiness'], ['Carbon / MRV', c.carbon?.mrvStatus, c.carbon?.carbonCreditStatus], ['Financial readiness', c.financial?.IRR, `${c.financial?.payback || ''} · ${c.financial?.DSCR || ''}`]];
  document.getElementById('kpiGrid').innerHTML = k.map(([a, b, d], i) => `<div class="card kpi"><small>${esc(a)}</small><b>${esc(b || 'Unknown')}</b><span>${esc(d || '-')}</span>${i === 0 ? `<em class="confidence">${esc(c.dataConfidence || 'medium')} confidence</em>` : ''}</div>`).join('');
}

function renderBars() {
  let c = getCase();
  document.getElementById('dimensionBars').innerHTML = dimensions.map((d) => {
    let s = Math.round(dimScore(c, d));
    return `<div class="bar"><label>${esc(d.name)}</label><div class="track"><div class="fill" style="width:${s}%;"></div></div><b>${s}/100</b></div>`;
  }).join('');
}

function renderRadar() {
  let c = getCase(), cx = 170, cy = 138, R = 92, n = dimensions.length, sc = dimensions.map(d => dimScore(c, d)), bm = [90, 88, 88, 90, 86, 88], pt = (i, r) => { let a = -Math.PI / 2 + 2 * Math.PI * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] }, out = '';
  [.25, .5, .75, 1].forEach(l => out += `<polygon points="${dimensions.map((_, i) => pt(i, R * l).join(',')).join(' ')}" fill="none" stroke="#E2E8F0"/>`);
  dimensions.forEach((d, i) => { let p = pt(i, R), q = pt(i, R + 28); out += `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="#E2E8F0"/><text x="${q[0]}" y="${q[1]}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#64748B" font-weight="700">${i + 1}</text>` });
  out += `<polygon points="${sc.map((s, i) => pt(i, R * s / 100).join(',')).join(' ')}" fill="rgba(13,64,129,0.15)" stroke="#0d4081" stroke-width="2.5"/><polygon points="${bm.map((s, i) => pt(i, R * s / 100).join(',')).join(' ')}" fill="none" stroke="#66975e" stroke-width="2" stroke-dasharray="6 5"/><text x="170" y="286" text-anchor="middle" font-size="11" fill="#64748B" font-weight="600">1 Circularity · 2 Product · 3 Standard · 4 Market · 5 Carbon · 6 Finance</text>`;
  document.getElementById('radar').innerHTML = out;
}

function renderInsights() {
  let c = getCase(), ds = dimensions.map(d => ({ id: d.id, name: d.name, score: Math.round(dimScore(c, d)) })), hi = [...ds].sort((a, b) => b.score - a.score).slice(0, 3).map(x => `${x.name}: ${x.score}/100`), lo = [...ds].sort((a, b) => a.score - b.score).filter(x => x.score < 70).slice(0, 3).map(x => `${x.name}: ${x.score}/100`), act = recs(c).slice(0, 3);
  document.getElementById('insights').innerHTML = [['Strengths', hi, 'S', 'var(--soft)'], ['Key Gaps', lo.length ? lo : ['No major gaps above threshold'], 'G', 'var(--orange)'], ['Recommended Actions', act, 'A', 'var(--blue)']].map(([t, items, ic, col]) => `<div class="insight"><div class="ii" style="background:${col}">${ic}</div><div><h3>${t}</h3><ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>`).join('');
}

function renderCompare() {
  let c = getCase(), s = Math.round(total(c)), b = Number(c.baselineScore || Math.max(40, s - 12)), up = Math.max(s, b + 12), items = [['Total Score', b, up, 'points'], ['CO2 reduction estimate', c.carbon?.ghgReduction || '180K', '310K', 'tCO2e/yr'], ['Project IRR', c.financial?.IRR || '8-10%', '12-15%', 'illustrative'], ['Payback period', c.financial?.payback || '12-16 years', '8-11 years', 'illustrative'], ['DSCR', c.financial?.DSCR || '1.0-1.2x', '1.25-1.5x', 'illustrative'], ['Offtake secured', c.offtakeStatus || 'Unclear', 'Certified offtake registry', 'illustrative']];
  document.getElementById('compareGrid').innerHTML = items.map(([n, base, upgrade, u]) => `<div class="comp"><small>${esc(n)}</small><b>${esc(upgrade)}</b><span>Baseline: ${esc(base)}</span><span>${esc(u)}</span></div>`).join('');
}

function renderForm() {
  let c = getCase();
  document.getElementById('scoringForm').innerHTML = dimensions.map(d => `<div class="dim"><div class="dimhead"><b>${esc(d.name)}</b><span>${Math.round(d.weight * 100)}%</span></div>${d.metrics.map(m => metricSelect(m, c.scores?.[m[0]] ?? 10, `changeMetric('${m[0]}',this.value)`)).join('')}</div>`).join('');
}

function metricSelect(m, val, onchange) {
  return `<div class="metric"><label>${esc(m[1])}</label><select onchange="${onchange}">${m[2].map(([s, l]) => `<option value="${s}" ${Number(val) === Number(s) ? 'selected' : ''}>${s} pts — ${esc(l)}</option>`).join('')}</select><div class="cap">Unknown or unverifiable data should be scored conservatively.</div></div>`;
}

function changeMetric(id, v) {
  let c = getCase();
  c.scores[id] = Number(v);
  saveLocal();
  currentScenario = 'current';
  renderAll();
}

function renderLibrary() {
  document.getElementById('caseLibrary').innerHTML = casesData.map(c => {
    let s = Math.round(total(c)), g = grade(s);
    return `<button class="case ${c.id === selectedCaseId ? 'active' : ''}" onclick="selectCase('${c.id}')"><div class="miniGrade" style="background:${g.c}">${g.g}</div><b>${esc(c.name)}</b><span>${esc(c.country)} · ${s}/100</span><span>${esc(c.dataConfidence || 'medium')} confidence</span></button>`;
  }).join('');
}

function recs(c) {
  let r = [], get = id => Math.round(dimScore(c, dimensions.find(d => d.id === id)));
  if (get('circularity') < 60) r.push('Improve source sorting, feedstock consistency, and residual waste allocation.');
  if (get('multiProduct') < 60) r.push('Develop FABA utilization, syngas offtake, or bio-methanol pathway.');
  if (get('standardization') < 60) r.push('Prioritize certification, lab testing, SNI/international standards, and traceability.');
  if (get('offtake') < 60) r.push('Secure PNRE or industrial offtake MoU to reduce market risk.');
  if (get('carbonMRV') < 60) r.push('Implement third-party MRV and carbon reporting before making carbon claims.');
  if (get('financial') < 60) r.push('Use revenue stacking, tipping fee optimization, and investor disclosure to improve bankability.');
  if (!r.length) r.push('Maintain annual re-rating and prepare Green Grade A disclosure package.');
  return r;
}

function setScenario(m) {
  currentScenario = m;
  renderAll();
}

function simulateUpgrade() {
  let c = getCase(), u = clone(c);
  u.id = `${c.id}_upgrade_${Date.now()}`;
  u.name = `${c.name} — Green Grade Upgrade`;
  u.baselineScore = Math.round(total(c));
  Object.keys(u.scores).forEach(k => {
    let v = Number(u.scores[k]);
    if (v < 40) u.scores[k] = 40;
    if (['certification', 'testing', 'traceability', 'securedOutput', 'mrvStatusScore', 'emissionReporting', 'irrScore', 'dscrScore', 'paybackScore', 'faba', 'nonElectricRevenue'].includes(k) && u.scores[k] < 70) u.scores[k] = 70;
  });
  u.offtakeStatus = 'Improved: certified offtake pathway';
  u.financial = { IRR: '12-15%', payback: '8-11 years', DSCR: '1.25-1.5x', tippingFee: u.financial?.tippingFee || 'Optimized' };
  u.carbon = { ghgReduction: '310K tCO2e/yr', mrvStatus: 'Third-party MRV in progress', carbonCreditStatus: 'In preparation' };
  u.notes = 'Simulated upgrade improving weak dimensions through certification, offtake, MRV, and financial disclosure.';
  casesData.push(u);
  selectedCaseId = u.id;
  currentScenario = 'upgrade';
  saveLocal();
  renderAll();
}

function openCaseModal(mode) {
  modalMode = mode;
  draftCase = mode === 'edit' ? clone(getCase()) : blankCase();
  document.getElementById('caseModalTitle').textContent = mode === 'edit' ? 'Edit Case' : 'Add Case';
  renderModal();
  document.getElementById('caseModal').style.display = 'grid';
}

function blankCase() {
  let scores = {};
  dimensions.flatMap(d => d.metrics).forEach(m => scores[m[0]] = 40);
  return { id: `case_${Date.now()}`, name: 'New WtE Case', country: '', location: '', operator: '', projectType: 'Circular WtE project', wasteCapacity: '', mainOutput: '', byProducts: '', offtakeStatus: '', sourceNote: 'User-input case. Requires verification.', dataConfidence: 'low', scores, financial: { IRR: '', payback: '', DSCR: '', tippingFee: '' }, carbon: { ghgReduction: '', mrvStatus: '', carbonCreditStatus: '' }, notes: '' };
}

function renderModal() {
  let c = draftCase;
  caseFields.innerHTML = `
    <div class="field"><label>Case name</label><input value="${esc(c.name || '')}" onchange="setDraft('name',this.value)"></div>
    <div class="field"><label>Country</label><input value="${esc(c.country || '')}" onchange="setDraft('country',this.value)"></div>
    <div class="field"><label>Location</label><input value="${esc(c.location || '')}" onchange="setDraft('location',this.value)"></div>
    <div class="field"><label>Operator</label><input value="${esc(c.operator || '')}" onchange="setDraft('operator',this.value)"></div>
    <div class="field"><label>Project type</label><input value="${esc(c.projectType || '')}" onchange="setDraft('projectType',this.value)"></div>
    <div class="field"><label>Waste capacity</label><input value="${esc(c.wasteCapacity || '')}" onchange="setDraft('wasteCapacity',this.value)"></div>
    <div class="field" style="grid-column: span 2;"><label>Notes</label><textarea onchange="setDraft('notes',this.value)">${esc(c.notes || '')}</textarea></div>
  `;
  
  modalScoring.innerHTML = dimensions.map(d => `
    <div class="dim">
      <div class="dimhead"><b>${esc(d.name)}</b></div>
      ${d.metrics.map(m => metricSelect(m, c.scores?.[m[0]] ?? 10, `setDraftScore('${m[0]}',this.value)`)).join('')}
    </div>
  `).join('');
}

function setDraft(p, v) { setPath(draftCase, p, v) }

function setDraftScore(id, v) { draftCase.scores[id] = Number(v) }

function saveCaseFromModal() {
  if (!draftCase.name.trim()) { alert('Please input a case name.'); return }
  if (modalMode === 'edit') {
    let i = casesData.findIndex(c => c.id === draftCase.id);
    if (i >= 0) casesData[i] = draftCase;
  } else {
    draftCase.id = uniqueId(slug(draftCase.name));
    casesData.push(draftCase);
  }
  selectedCaseId = draftCase.id;
  saveLocal();
  closeModals();
  renderAll();
}

function openImportModal() {
  document.getElementById('jsonInput').value = '';
  document.getElementById('importModal').style.display = 'grid';
}

function importJSON() {
  try {
    let raw = document.getElementById('jsonInput').value.trim(), p = JSON.parse(raw), arr = Array.isArray(p) ? p : [p];
    arr.forEach(o => {
      let n = normalize(o), i = casesData.findIndex(c => c.id === n.id);
      if (i >= 0) casesData[i] = n; else casesData.push(n);
    });
    selectedCaseId = arr[0]?.id || casesData[0].id;
    saveLocal();
    closeModals();
    renderAll();
  } catch (e) { alert('Invalid JSON. Please check the format.') }
}

function normalize(o) {
  let c = blankCase();
  Object.assign(c, o);
  c.id = c.id || uniqueId(slug(c.name || 'case'));
  c.scores = { ...c.scores, ...(o.scores || {}) };
  c.financial = { ...c.financial, ...(o.financial || {}) };
  c.carbon = { ...c.carbon, ...(o.carbon || {}) };
  return c;
}

function exportJSON() {
  let blob = new Blob([JSON.stringify(casesData, null, 2)], { type: 'application/json' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'greengrade_cases.json';
  a.click();
  URL.revokeObjectURL(url);
}

function closeModals() {
  document.getElementById('caseModal').style.display = 'none';
  document.getElementById('importModal').style.display = 'none';
}
function getPath(o, p) { return p.split('.').reduce((x, k) => x?.[k], o) }

function setPath(o, p, v) {
  let a = p.split('.'), x = o;
  for (let i = 0; i < a.length - 1; i++) {
    if (!x[a[i]]) x[a[i]] = {};
    x = x[a[i]];
  }
  x[a.at(-1)] = v;
}

function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'case' }

function uniqueId(b) {
  let id = b, i = 1;
  while (casesData.some(c => c.id === id)) id = `${b}_${i++}`;
  return id;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

function deleteCurrentCase() {
  if (casesData.length <= 1) {
    alert('Tidak bisa dihapus. Minimal harus tersisa 1 case di aplikasi!');
    return;
  }
  if (confirm('Yakin ingin menghapus case ini?')) {
    casesData = casesData.filter(c => c.id !== selectedCaseId);
    selectedCaseId = casesData[0].id;
    saveLocal();
    renderAll();
  }
}

window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals() });
document.addEventListener('DOMContentLoaded', init);