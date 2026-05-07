import { useState, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════
// ITEMS — todos los módulos OPCRIT+
// ══════════════════════════════════════════════════════════

const ITEMS = [
  // ── DEMOGRÁFICOS ────────────────────────────────────────
  { id:"sex",         sec:"dem", label:"Sexo",                  type:"sel", opts:["Masculino","Femenino","Otro/No especificado"] },
  { id:"age",         sec:"dem", label:"Edad (años)",           type:"num", min:0, max:120 },
  { id:"education",   sec:"dem", label:"Años de educación",     type:"num", min:0, max:30 },
  { id:"marital",     sec:"dem", label:"Estado civil",          type:"sel", opts:["Soltero/a","Casado/a o conviviente","Separado/a o divorciado/a","Viudo/a"] },
  { id:"employment",  sec:"dem", label:"Situación laboral",     type:"sel", opts:["Empleado/a","Desempleado/a","Estudiante","Jubilado/a","Incapacidad laboral","Otro"] },

  // ── HISTORIA CLÍNICA ────────────────────────────────────
  { id:"age_onset",   sec:"hx",  label:"Edad de inicio de síntomas (años)",          type:"num", min:0, max:120 },
  { id:"dur_illness", sec:"hx",  label:"Duración total de la enfermedad (meses)",    type:"num", min:0 },
  { id:"course",      sec:"hx",  label:"Curso de la enfermedad",                     type:"sel", opts:["Episódico con recuperación completa","Episódico con déficit residual","Continuo/crónico","Episodio único","Desconocido"] },
  { id:"fam_psy",     sec:"hx",  label:"Antecedentes familiares de psicosis",        type:"sel", opts:["Ninguno","Familiar 1er grado","Familiar 2do grado","Desconocido"] },
  { id:"fam_aff",     sec:"hx",  label:"Antecedentes familiares de t. afectivo",     type:"sel", opts:["Ninguno","Familiar 1er grado","Familiar 2do grado","Desconocido"] },
  { id:"premorbid",   sec:"hx",  label:"Funcionamiento premórbido",                  type:"sel", opts:["Bueno","Regular","Pobre","Desconocido"] },

  // ── CRIBADO (siempre visible) ───────────────────────────
  { id:"scr_psy",     sec:"scr", label:"¿Síntomas psicóticos presentes (alucinaciones, delirios, desorganización, catatonía)?",                                        type:"bool" },
  { id:"scr_man",     sec:"scr", label:"¿Episodios de ánimo elevado, eufórico o irritable de forma anormal (posible manía/hipomanía)?",                                type:"bool" },
  { id:"scr_dep",     sec:"scr", label:"¿Episodios depresivos mayores (≥2 semanas con ánimo deprimido o anhedonia)?",                                                  type:"bool" },
  { id:"scr_anx",     sec:"scr", label:"¿Síntomas de ansiedad clínicamente significativos?",                                                                           type:"bool" },
  { id:"scr_sub",     sec:"scr", label:"¿Uso problemático de alcohol u otras sustancias?",                                                                             type:"bool" },
  { id:"scr_per",     sec:"scr", label:"¿Patrón persistente y disfuncional de personalidad (desde adultez temprana)?",                                                 type:"bool" },
  { id:"scr_cog",     sec:"scr", label:"¿Deterioro cognitivo o demencia?",                                                                                             type:"bool" },

  // ── MÓDULO PSICOSIS ────────────────────────────────────
  // Alucinaciones
  { id:"h_aud3",      sec:"psy", label:"Alucinaciones auditivas en 3ª persona (voces discuten o comentan sobre el paciente)",   type:"bool", show:r=>r.scr_psy===true, tip:"Criterio 1er rango Schneider" },
  { id:"h_audrun",    sec:"psy", label:"Voces que comentan en tiempo real las acciones del paciente (running commentary)",       type:"bool", show:r=>r.scr_psy===true, tip:"Criterio 1er rango Schneider" },
  { id:"h_aud2",      sec:"psy", label:"Alucinaciones auditivas en 2ª persona (voces se dirigen al paciente)",                  type:"bool", show:r=>r.scr_psy===true },
  { id:"h_vis",       sec:"psy", label:"Alucinaciones visuales",                                                                type:"bool", show:r=>r.scr_psy===true },
  { id:"h_other",     sec:"psy", label:"Alucinaciones táctiles, olfativas o gustativas",                                        type:"bool", show:r=>r.scr_psy===true },
  // Delirios
  { id:"d_control",   sec:"psy", label:"Delirios de control / fenómenos de pasividad (fuerzas externas controlan mente/cuerpo)", type:"bool", show:r=>r.scr_psy===true, tip:"Criterio 1er rango Schneider" },
  { id:"d_insert",    sec:"psy", label:"Inserción del pensamiento",                                                             type:"bool", show:r=>r.scr_psy===true, tip:"Criterio 1er rango Schneider" },
  { id:"d_withd",     sec:"psy", label:"Robo del pensamiento",                                                                  type:"bool", show:r=>r.scr_psy===true, tip:"Criterio 1er rango Schneider" },
  { id:"d_broad",     sec:"psy", label:"Difusión del pensamiento",                                                              type:"bool", show:r=>r.scr_psy===true, tip:"Criterio 1er rango Schneider" },
  { id:"d_persec",    sec:"psy", label:"Delirios persecutorios",                                                                type:"bool", show:r=>r.scr_psy===true },
  { id:"d_ref",       sec:"psy", label:"Delirios de referencia",                                                                type:"bool", show:r=>r.scr_psy===true },
  { id:"d_grand",     sec:"psy", label:"Delirios de grandiosidad",                                                              type:"bool", show:r=>r.scr_psy===true },
  { id:"d_nihil",     sec:"psy", label:"Delirios nihilistas / de ruina / de culpa",                                             type:"bool", show:r=>r.scr_psy===true },
  { id:"d_soma",      sec:"psy", label:"Delirios somáticos / hipocondríacos",                                                   type:"bool", show:r=>r.scr_psy===true },
  { id:"d_biz",       sec:"psy", label:"Delirios bizarros (imposibles físicamente)",                                            type:"bool", show:r=>r.scr_psy===true },
  // Pensamiento
  { id:"td_incoh",    sec:"psy", label:"Incoherencia / descarrilamiento grave del pensamiento",                                 type:"bool", show:r=>r.scr_psy===true },
  { id:"td_loose",    sec:"psy", label:"Laxitud de asociaciones / tangencialidad",                                              type:"bool", show:r=>r.scr_psy===true },
  // Negativos
  { id:"neg_flat",    sec:"psy", label:"Aplanamiento / embotamiento afectivo",                                                  type:"bool", show:r=>r.scr_psy===true },
  { id:"neg_avol",    sec:"psy", label:"Abulia / apatía",                                                                       type:"bool", show:r=>r.scr_psy===true },
  { id:"neg_anhed",   sec:"psy", label:"Anhedonia",                                                                             type:"bool", show:r=>r.scr_psy===true },
  { id:"neg_alog",    sec:"psy", label:"Alogia / pobreza del habla",                                                            type:"bool", show:r=>r.scr_psy===true },
  { id:"neg_soc",     sec:"psy", label:"Retraimiento social",                                                                   type:"bool", show:r=>r.scr_psy===true },
  // Conducta
  { id:"catatonia",   sec:"psy", label:"Síntomas catatónicos (estupor, catalepsia, mutismo, ecopraxia)",                       type:"bool", show:r=>r.scr_psy===true },
  { id:"disorg",      sec:"psy", label:"Comportamiento gravemente desorganizado o bizarro",                                     type:"bool", show:r=>r.scr_psy===true },
  // Curso
  { id:"p_dur_wk",    sec:"psy", label:"Duración de síntomas psicóticos activos (semanas)",                                    type:"num",  min:0, show:r=>r.scr_psy===true },
  { id:"p_dysf",      sec:"psy", label:"Disfunción social/laboral/autocuidado significativa",                                   type:"bool", show:r=>r.scr_psy===true },
  { id:"p_subst",     sec:"psy", label:"¿Los síntomas psicóticos son atribuibles a sustancias o causa médica?",                type:"bool", show:r=>r.scr_psy===true },

  // ── MÓDULO MANÍA ───────────────────────────────────────
  { id:"m_elev",      sec:"man", label:"Ánimo anormalmente elevado, eufórico o expansivo",                                     type:"bool", show:r=>r.scr_man===true },
  { id:"m_irr",       sec:"man", label:"Ánimo anormalmente irritable (si no hay euforia clara)",                               type:"bool", show:r=>r.scr_man===true },
  { id:"m_grand",     sec:"man", label:"Grandiosidad o autoestima inflada",                                                     type:"bool", show:r=>r.scr_man===true },
  { id:"m_sleep",     sec:"man", label:"Disminución de la necesidad de dormir (descansado con menos horas)",                   type:"bool", show:r=>r.scr_man===true },
  { id:"m_speech",    sec:"man", label:"Habla acelerada / presionada",                                                          type:"bool", show:r=>r.scr_man===true },
  { id:"m_racing",    sec:"man", label:"Pensamiento acelerado / fuga de ideas",                                                 type:"bool", show:r=>r.scr_man===true },
  { id:"m_distr",     sec:"man", label:"Distractibilidad aumentada",                                                            type:"bool", show:r=>r.scr_man===true },
  { id:"m_activ",     sec:"man", label:"Aumento de actividad orientada a metas o agitación psicomotriz",                       type:"bool", show:r=>r.scr_man===true },
  { id:"m_risk",      sec:"man", label:"Conductas de riesgo (gasto excesivo, hipersexualidad, inversiones imprudentes)",       type:"bool", show:r=>r.scr_man===true },
  { id:"m_dur",       sec:"man", label:"Duración del episodio más grave (días)",                                                type:"num",  min:0, show:r=>r.scr_man===true },
  { id:"m_hosp",      sec:"man", label:"¿Requirió hospitalización psiquiátrica por el episodio?",                              type:"bool", show:r=>r.scr_man===true },
  { id:"m_psych",     sec:"man", label:"¿Hubo características psicóticas durante el episodio maníaco?",                       type:"bool", show:r=>r.scr_man===true },
  { id:"m_dysf",      sec:"man", label:"Deterioro funcional grave durante el episodio",                                         type:"bool", show:r=>r.scr_man===true },

  // ── MÓDULO DEPRESIÓN ──────────────────────────────────
  { id:"dep_mood",    sec:"dep", label:"Ánimo deprimido la mayor parte del tiempo (≥2 semanas)",                               type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_anhed",   sec:"dep", label:"Pérdida marcada de interés o placer (anhedonia)",                                      type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_wt",      sec:"dep", label:"Cambio significativo de peso/apetito (>5% en un mes)",                                 type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_sleep",   sec:"dep", label:"Insomnio o hipersomnia",                                                               type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_pm",      sec:"dep", label:"Agitación o enlentecimiento psicomotriz observable",                                   type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_fat",     sec:"dep", label:"Fatiga o pérdida de energía",                                                          type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_worth",   sec:"dep", label:"Sentimientos de inutilidad o culpa excesiva",                                          type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_conc",    sec:"dep", label:"Dificultad para concentrarse o tomar decisiones",                                      type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_si",      sec:"dep", label:"Pensamientos recurrentes de muerte o ideación suicida",                                type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_dur",     sec:"dep", label:"Duración del episodio más grave (semanas)",                                            type:"num",  min:0, show:r=>r.scr_dep===true },
  { id:"dep_psych",   sec:"dep", label:"Características psicóticas durante el episodio depresivo",                             type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_dysf",    sec:"dep", label:"Deterioro funcional grave durante el episodio",                                        type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_mel",     sec:"dep", label:"Características melancólicas (peor de mañana, despertar precoz, anhedonia pervasiva)", type:"bool", show:r=>r.scr_dep===true },
  { id:"dep_recur",   sec:"dep", label:"¿Ha habido más de un episodio depresivo?",                                             type:"bool", show:r=>r.scr_dep===true },

  // ── MÓDULO ANSIEDAD ────────────────────────────────────
  { id:"anx_panic",   sec:"anx", label:"Ataques de pánico recurrentes e inesperados",                                          type:"bool", show:r=>r.scr_anx===true },
  { id:"anx_antcp",   sec:"anx", label:"Ansiedad anticipatoria o cambios conductuales por miedo a nuevos ataques",             type:"bool", show:r=>r.anx_panic===true },
  { id:"anx_agora",   sec:"anx", label:"Agorafobia (miedo a situaciones donde escapar podría ser difícil)",                   type:"bool", show:r=>r.scr_anx===true },
  { id:"anx_social",  sec:"anx", label:"Fobia social / t. de ansiedad social",                                                 type:"bool", show:r=>r.scr_anx===true },
  { id:"anx_specif",  sec:"anx", label:"Fobia específica (objeto o situación concreta)",                                       type:"bool", show:r=>r.scr_anx===true },
  { id:"anx_gad",     sec:"anx", label:"Preocupación excesiva e incontrolable sobre múltiples temas (≥6 meses)",               type:"bool", show:r=>r.scr_anx===true },
  { id:"anx_gad_n",   sec:"anx", label:"Nº síntomas TAG (fatiga, tensión, irritabilidad, insomnio, concentración, inquietud)", type:"sel",  opts:["0","1","2","3","4","5","6"], show:r=>r.anx_gad===true },
  { id:"anx_ocd_o",   sec:"anx", label:"Obsesiones (pensamientos/imágenes/impulsos intrusivos reconocidos como propios)",      type:"bool", show:r=>r.scr_anx===true },
  { id:"anx_ocd_c",   sec:"anx", label:"Compulsiones (rituales para neutralizar ansiedad)",                                    type:"bool", show:r=>r.scr_anx===true },
  { id:"anx_trauma",  sec:"anx", label:"Exposición a evento traumático (muerte/amenaza/lesión/violencia sexual)",              type:"bool", show:r=>r.scr_anx===true },
  { id:"ptsd_reexp",  sec:"anx", label:"Re-experimentación del trauma (flashbacks, pesadillas, angustia ante recordatorios)",  type:"bool", show:r=>r.anx_trauma===true },
  { id:"ptsd_avd",    sec:"anx", label:"Evitación persistente de estímulos relacionados con el trauma",                        type:"bool", show:r=>r.anx_trauma===true },
  { id:"ptsd_cog",    sec:"anx", label:"Alteraciones cognitivo-afectivas negativas persistentes relacionadas al trauma",       type:"bool", show:r=>r.anx_trauma===true },
  { id:"ptsd_arous",  sec:"anx", label:"Hiperactivación: hipervigilancia, respuesta de sobresalto exagerada",                  type:"bool", show:r=>r.anx_trauma===true },
  { id:"ptsd_dur",    sec:"anx", label:"Duración de síntomas TEPT (meses)",                                                    type:"num",  min:0, show:r=>r.anx_trauma===true && r.ptsd_reexp===true },

  // ── MÓDULO SUSTANCIAS ──────────────────────────────────
  { id:"sub_alc",     sec:"sub", label:"Alcohol: uso problemático",                                                            type:"bool", show:r=>r.scr_sub===true },
  { id:"sub_can",     sec:"sub", label:"Cannabis: uso problemático",                                                           type:"bool", show:r=>r.scr_sub===true },
  { id:"sub_stim",    sec:"sub", label:"Estimulantes (cocaína, anfetaminas...): uso problemático",                            type:"bool", show:r=>r.scr_sub===true },
  { id:"sub_opio",    sec:"sub", label:"Opioides: uso problemático",                                                           type:"bool", show:r=>r.scr_sub===true },
  { id:"sub_sed",     sec:"sub", label:"Sedantes / hipnóticos / ansiolíticos: uso problemático",                              type:"bool", show:r=>r.scr_sub===true },
  { id:"sub_other",   sec:"sub", label:"Otras sustancias: uso problemático",                                                   type:"bool", show:r=>r.scr_sub===true },
  { id:"sub_tol",     sec:"sub", label:"Tolerancia (necesita más cantidad para mismo efecto)",                                 type:"bool", show:r=>r.scr_sub===true },
  { id:"sub_with",    sec:"sub", label:"Síndrome de abstinencia al cesar o reducir",                                           type:"bool", show:r=>r.scr_sub===true },
  { id:"sub_ctrl",    sec:"sub", label:"Pérdida de control sobre el consumo",                                                  type:"bool", show:r=>r.scr_sub===true },
  { id:"sub_socd",    sec:"sub", label:"Deterioro social/laboral por el consumo",                                              type:"bool", show:r=>r.scr_sub===true },
  { id:"sub_psy",     sec:"sub", label:"Psicosis inducida por sustancias (síntomas psicóticos directamente por intox./abstinencia)", type:"bool", show:r=>r.scr_sub===true && r.scr_psy===true },

  // ── MÓDULO PERSONALIDAD ────────────────────────────────
  { id:"per_early",   sec:"per", label:"Patrón presente desde adultez temprana o adolescencia",                                type:"bool", show:r=>r.scr_per===true },
  { id:"per_perv",    sec:"per", label:"Patrón inflexible y generalizado (afecta múltiples contextos)",                        type:"bool", show:r=>r.scr_per===true },
  { id:"per_A_par",   sec:"per", label:"Cluster A — Paranoide: desconfianza y suspicacia pervasivas",                          type:"bool", show:r=>r.scr_per===true },
  { id:"per_A_szd",   sec:"per", label:"Cluster A — Esquizoide: desapego social, rango afectivo restringido",                  type:"bool", show:r=>r.scr_per===true },
  { id:"per_A_szt",   sec:"per", label:"Cluster A — Esquizotípico: distorsiones cognitivo-perceptuales, excentricidad",        type:"bool", show:r=>r.scr_per===true },
  { id:"per_B_ast",   sec:"per", label:"Cluster B — Antisocial: violación de derechos ajenos (c/historial disocial previo)",   type:"bool", show:r=>r.scr_per===true },
  { id:"per_B_bpd",   sec:"per", label:"Cluster B — Límite (BPD): inestabilidad relacional/afectiva, impulsividad, miedo al abandono", type:"bool", show:r=>r.scr_per===true },
  { id:"per_B_his",   sec:"per", label:"Cluster B — Histriónico: emotividad excesiva, búsqueda de atención",                  type:"bool", show:r=>r.scr_per===true },
  { id:"per_B_nar",   sec:"per", label:"Cluster B — Narcisista: grandiosidad, necesidad de admiración, falta de empatía",      type:"bool", show:r=>r.scr_per===true },
  { id:"per_C_avd",   sec:"per", label:"Cluster C — Evitativo: inhibición social, sentimientos de inadecuación",              type:"bool", show:r=>r.scr_per===true },
  { id:"per_C_dep",   sec:"per", label:"Cluster C — Dependiente: necesidad excesiva de cuidado, comportamiento sumiso",        type:"bool", show:r=>r.scr_per===true },
  { id:"per_C_ocp",   sec:"per", label:"Cluster C — TOCP: preocupación por orden, perfeccionismo, control interpersonal",      type:"bool", show:r=>r.scr_per===true },

  // ── MÓDULO COGNITIVO ──────────────────────────────────
  { id:"cog_mem",     sec:"cog", label:"Deterioro de la memoria (especialmente para información nueva)",                       type:"bool", show:r=>r.scr_cog===true },
  { id:"cog_ori",     sec:"cog", label:"Desorientación (tiempo, lugar o persona)",                                             type:"bool", show:r=>r.scr_cog===true },
  { id:"cog_lang",    sec:"cog", label:"Dificultades del lenguaje (anomia, afasia, parafasias)",                               type:"bool", show:r=>r.scr_cog===true },
  { id:"cog_exec",    sec:"cog", label:"Disfunción ejecutiva (planificación, juicio, abstracción)",                            type:"bool", show:r=>r.scr_cog===true },
  { id:"cog_onset",   sec:"cog", label:"Inicio del deterioro",                                                                 type:"sel",  opts:["Agudo (horas-días)","Subagudo (semanas)","Insidioso (meses-años)","Desconocido"], show:r=>r.scr_cog===true },
  { id:"cog_fluct",   sec:"cog", label:"Curso fluctuante (mejor en algunos momentos, peor en otros)",                         type:"bool", show:r=>r.scr_cog===true },
  { id:"cog_prog",    sec:"cog", label:"Curso progresivo (empeora con el tiempo)",                                             type:"bool", show:r=>r.scr_cog===true },
  { id:"cog_cons",    sec:"cog", label:"Alteración del nivel / contenido de conciencia",                                       type:"bool", show:r=>r.scr_cog===true },
];

// ══════════════════════════════════════════════════════════
// ALGORITMOS DIAGNÓSTICOS
// ══════════════════════════════════════════════════════════

function bool(v){ return v === true; }
function count(...vals){ return vals.filter(bool).length; }

function runAlgorithms(r){
  const frs = count(r.h_aud3, r.h_audrun, r.d_control, r.d_insert, r.d_withd, r.d_broad);
  const psySx = count(r.h_aud3||r.h_audrun||r.h_aud2||r.h_vis||r.h_other,
    r.d_control||r.d_insert||r.d_withd||r.d_broad||r.d_persec||r.d_ref||r.d_grand||r.d_nihil||r.d_soma||r.d_biz,
    r.td_incoh||r.td_loose, r.disorg||r.catatonia,
    r.neg_flat||r.neg_avol||r.neg_alog);
  const mustHave = bool(r.h_aud3)||bool(r.h_audrun)||bool(r.h_aud2)||bool(r.h_vis)||
    bool(r.d_control)||bool(r.d_insert)||bool(r.d_withd)||bool(r.d_broad)||
    bool(r.d_persec)||bool(r.d_ref)||bool(r.d_grand)||bool(r.d_biz)||bool(r.td_incoh);
  const negN = count(r.neg_flat, r.neg_avol, r.neg_anhed, r.neg_alog, r.neg_soc);
  const durWk = Number(r.p_dur_wk)||0;

  const depN = count(r.dep_mood, r.dep_anhed, r.dep_wt, r.dep_sleep, r.dep_pm, r.dep_fat, r.dep_worth, r.dep_conc, r.dep_si);
  const manN = count(r.m_grand, r.m_sleep, r.m_speech, r.m_racing, r.m_distr, r.m_activ, r.m_risk);
  const mDur = Number(r.m_dur)||0;
  const moodOk = bool(r.m_elev)||bool(r.m_irr);

  const maniaEp = moodOk && ((bool(r.m_elev)&&manN>=3)||(bool(r.m_irr)&&manN>=4)) &&
    (mDur>=7||bool(r.m_hosp));
  const hypoEp  = moodOk && ((bool(r.m_elev)&&manN>=3)||(bool(r.m_irr)&&manN>=4)) &&
    mDur>=4 && !bool(r.m_hosp) && !bool(r.m_dysf);
  const mddEp   = (bool(r.dep_mood)||bool(r.dep_anhed)) && depN>=5 && bool(r.dep_dysf);

  // ICD-10 + DSM-5 combined
  const icd=[], dsm=[];

  // Schizophrenia spectrum
  const schizoBase = (frs>=1||(psySx>=2&&mustHave)) && !bool(r.p_subst);
  const schizoDSM  = psySx>=2 && mustHave && bool(r.p_dysf) && !bool(r.p_subst);

  if(schizoBase && (maniaEp||mddEp)){
    icd.push({code:"F25.0", name:"Trastorno esquizoafectivo, tipo maníaco",  conf:"probable"});
    icd.push({code:"F25.1", name:"Trastorno esquizoafectivo, tipo depresivo", conf:"posible"});
    dsm.push({code:"295.70", name:"Trastorno esquizoafectivo",                conf:"probable"});
  } else if(schizoBase && durWk>=4){
    if(durWk>=26){
      const subtype = negN>=3 ? "F20.5 (Esquizofrenia residual/síntomas negativos predominantes)" : "F20.0 (Esquizofrenia paranoide)";
      icd.push({code:subtype.split(" ")[0], name:subtype.slice(7), conf:"probable"});
    } else if(durWk>=4){
      icd.push({code:"F23", name:"Trastorno psicótico agudo y transitorio",  conf:"probable"});
    }
    if(schizoDSM && durWk>=26){
      dsm.push({code:"295.90", name:"Esquizofrenia",             conf:"probable"});
    } else if(schizoDSM && durWk>=4){
      dsm.push({code:"295.40", name:"Trastorno esquizofreniforme", conf:"probable"});
    } else if(durWk>=1&&durWk<4){
      dsm.push({code:"298.8",  name:"Trastorno psicótico breve",  conf:"probable"});
    }
  } else if(bool(r.scr_psy)&&durWk>=4&&!bool(r.p_subst)){
    icd.push({code:"F22", name:"Trastorno delirante persistente", conf:"posible"});
    dsm.push({code:"297.1", name:"Trastorno delirante",           conf:"posible"});
  }

  // Bipolar / Affective
  if(maniaEp && !schizoBase){
    if(mddEp){
      icd.push({code:"F31", name:"Trastorno bipolar, episodio actual maníaco",                       conf:"probable"});
      dsm.push({code:"296.4x", name:"Trastorno bipolar tipo I",                                      conf:"probable"});
    } else {
      icd.push({code:"F30", name:"Episodio maníaco",                                                 conf:"probable"});
      dsm.push({code:"296.41", name:"Trastorno bipolar tipo I (episodio maníaco)",                   conf:"probable"});
    }
  } else if(hypoEp && mddEp && !schizoBase){
    icd.push({code:"F31.8", name:"Trastorno bipolar tipo II (hipomanía + depresión)",                 conf:"probable"});
    dsm.push({code:"296.89", name:"Trastorno bipolar tipo II",                                        conf:"probable"});
  } else if(mddEp && !maniaEp && !hypoEp && !schizoBase){
    const sev = depN>=8?"grave":depN>=6?"moderado":"leve";
    if(bool(r.dep_recur)){
      icd.push({code:`F33.${depN>=8?2:depN>=6?1:0}`, name:`Trastorno depresivo recurrente, episodio actual ${sev}`, conf:"probable"});
      dsm.push({code:"296.3x", name:`Trastorno de depresión mayor recurrente (${sev})`,               conf:"probable"});
    } else {
      icd.push({code:`F32.${depN>=8?2:depN>=6?1:0}`, name:`Episodio depresivo ${sev}`,               conf:"probable"});
      dsm.push({code:"296.2x", name:`Trastorno de depresión mayor, episodio único (${sev})`,          conf:"probable"});
    }
  }

  // TOC / TEPT / Pánico / TAG / Fobias
  if(bool(r.anx_ocd_o)&&bool(r.anx_ocd_c)){
    icd.push({code:"F42", name:"Trastorno obsesivo-compulsivo", conf:"probable"});
    dsm.push({code:"300.3", name:"Trastorno obsesivo-compulsivo", conf:"probable"});
  }
  if(bool(r.anx_trauma)&&bool(r.ptsd_reexp)&&bool(r.ptsd_avd)&&bool(r.ptsd_arous)&&(Number(r.ptsd_dur)||0)>=1){
    icd.push({code:"F43.1", name:"Trastorno de estrés postraumático", conf:"probable"});
    dsm.push({code:"309.81", name:"Trastorno de estrés postraumático", conf:"probable"});
  }
  if(bool(r.anx_panic)&&bool(r.anx_antcp)){
    const tag = bool(r.anx_agora)?"F40.01 (con agorafobia)":"F41.0";
    icd.push({code:tag, name:"Trastorno de pánico", conf:"probable"});
    dsm.push({code:"300.01", name:"Trastorno de pánico", conf:"probable"});
  }
  if(bool(r.anx_social)){
    icd.push({code:"F40.1", name:"Fobia social / T. de ansiedad social", conf:"probable"});
    dsm.push({code:"300.23", name:"Trastorno de ansiedad social", conf:"probable"});
  }
  if(bool(r.anx_specif)){
    icd.push({code:"F40.2", name:"Fobia específica", conf:"probable"});
    dsm.push({code:"300.29", name:"Fobia específica", conf:"probable"});
  }
  if(bool(r.anx_gad)&&parseInt(r.anx_gad_n||"0")>=3){
    icd.push({code:"F41.1", name:"Trastorno de ansiedad generalizada", conf:"probable"});
    dsm.push({code:"300.02", name:"Trastorno de ansiedad generalizada", conf:"probable"});
  }

  // Sustancias
  const anySub = count(r.sub_alc,r.sub_can,r.sub_stim,r.sub_opio,r.sub_sed,r.sub_other)>0;
  if(anySub){
    if(bool(r.sub_tol)||bool(r.sub_with)||(bool(r.sub_ctrl)&&bool(r.sub_socd))){
      icd.push({code:"F1x.2", name:"Síndrome de dependencia a sustancias", conf:"probable"});
      dsm.push({code:"F1x.20", name:"Trastorno por uso de sustancias (moderado-grave)", conf:"probable"});
    } else if(bool(r.sub_socd)){
      icd.push({code:"F1x.1", name:"Uso nocivo de sustancias", conf:"posible"});
      dsm.push({code:"F1x.10", name:"Trastorno por uso de sustancias (leve)", conf:"posible"});
    }
  }
  if(bool(r.sub_psy)){
    icd.push({code:"F1x.5", name:"T. psicótico inducido por sustancias", conf:"probable"});
    dsm.push({code:"F1x.x59", name:"T. psicótico inducido por sustancias", conf:"probable"});
  }

  // Personalidad
  const pBase = bool(r.per_early)&&bool(r.per_perv);
  if(pBase||bool(r.scr_per)){
    if(bool(r.per_A_par)){icd.push({code:"F60.0",name:"T. paranoide de personalidad",conf:"probable"});dsm.push({code:"301.0",name:"T. de personalidad paranoide",conf:"probable"});}
    if(bool(r.per_A_szd)){icd.push({code:"F60.1",name:"T. esquizoide de personalidad",conf:"probable"});dsm.push({code:"301.20",name:"T. de personalidad esquizoide",conf:"probable"});}
    if(bool(r.per_A_szt)){icd.push({code:"F21",  name:"T. esquizotípico",conf:"probable"});dsm.push({code:"301.22",name:"T. de personalidad esquizotípico",conf:"probable"});}
    if(bool(r.per_B_ast)){icd.push({code:"F60.2",name:"T. disocial de personalidad",conf:"probable"});dsm.push({code:"301.7",name:"T. de personalidad antisocial",conf:"probable"});}
    if(bool(r.per_B_bpd)){icd.push({code:"F60.31",name:"T. límite de personalidad (BPD)",conf:"probable"});dsm.push({code:"301.83",name:"T. de personalidad límite",conf:"probable"});}
    if(bool(r.per_B_his)){icd.push({code:"F60.4",name:"T. histriónico de personalidad",conf:"probable"});dsm.push({code:"301.50",name:"T. de personalidad histriónico",conf:"probable"});}
    if(bool(r.per_B_nar)){icd.push({code:"F60.8",name:"T. narcisista de personalidad",conf:"posible"});dsm.push({code:"301.81",name:"T. de personalidad narcisista",conf:"probable"});}
    if(bool(r.per_C_avd)){icd.push({code:"F60.6",name:"T. ansioso-evitativo de personalidad",conf:"probable"});dsm.push({code:"301.82",name:"T. de personalidad evitativa",conf:"probable"});}
    if(bool(r.per_C_dep)){icd.push({code:"F60.7",name:"T. dependiente de personalidad",conf:"probable"});dsm.push({code:"301.6",name:"T. de personalidad dependiente",conf:"probable"});}
    if(bool(r.per_C_ocp)){icd.push({code:"F60.5",name:"T. anancástico (TOCP) de personalidad",conf:"probable"});dsm.push({code:"301.4",name:"T. de personalidad obsesivo-compulsivo",conf:"probable"});}
  }

  // Cognitivo
  if(bool(r.scr_cog)&&bool(r.cog_mem)){
    if(bool(r.cog_cons)&&bool(r.cog_fluct)&&r.cog_onset==="Agudo (horas-días)"){
      icd.push({code:"F05", name:"Delirium",conf:"probable"});
      dsm.push({code:"293.0", name:"Delirium",conf:"probable"});
    } else if(bool(r.cog_prog)){
      icd.push({code:"F00-F03", name:"Demencia (subtipo según etiología)",conf:"probable"});
      dsm.push({code:"294.xx", name:"Trastorno neurocognitivo mayor (demencia)",conf:"probable"});
    } else {
      icd.push({code:"F06", name:"T. cognitivo de etiología orgánica",conf:"posible"});
      dsm.push({code:"331.83", name:"T. neurocognitivo leve",conf:"posible"});
    }
  }

  return { icd, dsm };
}

// ══════════════════════════════════════════════════════════
// METADATA DE SECCIONES
// ══════════════════════════════════════════════════════════

const SECTIONS = [
  { id:"dem", label:"Datos Demográficos",      short:"Demográficos",    color:"#1e3a5f" },
  { id:"hx",  label:"Historia Clínica",         short:"Historia",        color:"#374151" },
  { id:"scr", label:"Cribado de Módulos",       short:"Cribado",         color:"#7c3aed" },
  { id:"psy", label:"Módulo Psicosis",          short:"Psicosis",        color:"#b91c1c" },
  { id:"man", label:"Módulo Manía / Hipomanía", short:"Manía",           color:"#d97706" },
  { id:"dep", label:"Módulo Depresión",         short:"Depresión",       color:"#2563eb" },
  { id:"anx", label:"Módulo Ansiedad",          short:"Ansiedad",        color:"#059669" },
  { id:"sub", label:"Módulo Sustancias",        short:"Sustancias",      color:"#9333ea" },
  { id:"per", label:"Módulo Personalidad",      short:"Personalidad",    color:"#db2777" },
  { id:"cog", label:"Módulo Cognitivo",         short:"Cognitivo",       color:"#475569" },
];

// ══════════════════════════════════════════════════════════
// COMPONENTES HELPER
// ══════════════════════════════════════════════════════════

function Field({ item, value, onChange }) {
  const base = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";
  if (item.type === "bool") {
    return (
      <div className="flex gap-4 flex-wrap">
        {[["Sí", true], ["No", false], ["Desconocido", "unk"]].map(([lbl, val]) => (
          <label key={lbl} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-all ${
            value === val ? "border-indigo-500 bg-indigo-50 text-indigo-800 font-medium" : "border-gray-200 hover:border-gray-300"
          }`}>
            <input type="radio" name={item.id} className="sr-only"
              checked={value === val} onChange={() => onChange(val)} />
            {lbl}
          </label>
        ))}
      </div>
    );
  }
  if (item.type === "sel") {
    return (
      <select value={value || ""} onChange={e => onChange(e.target.value)}
        className={base + " max-w-sm w-full"}>
        <option value="">— Seleccionar —</option>
        {item.opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <input type="number" value={value ?? ""} min={item.min ?? 0} max={item.max}
      onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))}
      className={base + " w-28"} />
  );
}

function Badge({ text, variant = "blue" }) {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-emerald-100 text-emerald-800",
    yellow: "bg-amber-100 text-amber-800",
    gray: "bg-gray-100 text-gray-500",
    red: "bg-red-100 text-red-700",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>{text}</span>;
}

// ══════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════

export default function OPCRITApp() {
  const [view, setView] = useState("cases");
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState({});
  const [secIdx, setSecIdx] = useState(0);
  const [editId, setEditId] = useState(null);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("opcrit_v2_cases");
        if (res) setCases(JSON.parse(res.value));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (newCases) => {
    setCases(newCases);
    await window.storage.set("opcrit_v2_cases", JSON.stringify(newCases));
  }, []);

  // Visible sections given current form answers
  const visSecs = SECTIONS.filter(s =>
    ITEMS.some(i => i.sec === s.id && (!i.show || i.show(form)))
  );

  const secItems = (secId) =>
    ITEMS.filter(i => i.sec === secId && (!i.show || i.show(form)));

  const answeredInSec = (secId) => {
    const its = secItems(secId);
    return its.filter(i => form[i.id] !== undefined && form[i.id] !== null && form[i.id] !== "").length;
  };

  const totalAnswered = ITEMS.filter(i => (!i.show || i.show(form)) && form[i.id] !== undefined && form[i.id] !== null && form[i.id] !== "").length;
  const totalVisible  = ITEMS.filter(i => (!i.show || i.show(form))).length;

  function startNew() {
    setForm({}); setSecIdx(0); setEditId(null); setView("form");
  }
  function startEdit(c) {
    setForm({ ...c.responses }); setSecIdx(0); setEditId(c.id); setView("form");
  }
  async function handleSave() {
    const id = editId || Date.now().toString();
    const { icd, dsm } = runAlgorithms(form);
    const c = {
      id,
      createdAt: editId ? (cases.find(x => x.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: form,
      icd, dsm,
    };
    const updated = editId ? cases.map(x => x.id === editId ? c : x) : [...cases, c];
    await persist(updated);
    setCurrent(c);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setView("results");
  }
  async function handleDelete(id) {
    await persist(cases.filter(c => c.id !== id));
    setDeleteConfirm(null);
  }

  function exportCSV() {
    const ids = ITEMS.map(i => i.id);
    const header = ["caso_id","fecha","sexo","edad",...ids,"dx_icd10","dx_dsm5"];
    const rows = cases.map(c => [
      c.id.slice(-8),
      new Date(c.createdAt).toLocaleDateString("es-PE"),
      c.responses.sex||"",
      c.responses.age||"",
      ...ids.map(id => {
        const v = c.responses[id];
        if (v === true) return "1";
        if (v === false) return "0";
        if (v === "unk") return "9";
        return v ?? "";
      }),
      c.icd.map(d => `${d.code}: ${d.name} [${d.conf}]`).join(" | "),
      c.dsm.map(d => `${d.code}: ${d.name} [${d.conf}]`).join(" | "),
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `OPCRIT_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-slate-400 text-sm">Cargando base de datos...</div>
    </div>
  );

  // ── VISTA: LISTA DE CASOS ──────────────────────────────
  if (view === "cases") return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <h1 className="text-xl font-bold text-slate-800">OPCRIT+ Web</h1>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">ICD-10 · DSM-5</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 ml-8">Herramienta de diagnóstico psiquiátrico operacional · {ITEMS.length} ítems · {SECTIONS.length} módulos</p>
          </div>
          <div className="flex gap-2">
            {cases.length > 0 && (
              <button onClick={exportCSV}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-1.5">
                ⬇ Exportar CSV ({cases.length})
              </button>
            )}
            <button onClick={startNew}
              className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              + Nueva evaluación
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {cases.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-20 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-slate-500 mb-6">No hay evaluaciones guardadas.</p>
            <button onClick={startNew}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 text-sm">
              Comenzar primera evaluación
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Caso</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Paciente</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Diagnósticos ICD-10</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Módulos activos</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map(c => {
                  const mods = [
                    c.responses.scr_psy===true&&"Psicosis",
                    c.responses.scr_man===true&&"Manía",
                    c.responses.scr_dep===true&&"Dep.",
                    c.responses.scr_anx===true&&"Ansiedad",
                    c.responses.scr_sub===true&&"Sust.",
                    c.responses.scr_per===true&&"Pers.",
                    c.responses.scr_cog===true&&"Cog.",
                  ].filter(Boolean);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{c.id.slice(-6)}</td>
                      <td className="px-4 py-3.5 text-slate-600">{new Date(c.createdAt).toLocaleDateString("es-PE")}</td>
                      <td className="px-4 py-3.5 text-slate-700">{c.responses.sex||"—"} · {c.responses.age?c.responses.age+" a.":"—"}</td>
                      <td className="px-4 py-3.5 max-w-xs">
                        {c.icd.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {c.icd.slice(0,3).map((d,i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-mono">{d.code.split(" ")[0]}</span>
                            ))}
                            {c.icd.length > 3 && <span className="text-slate-400 text-xs">+{c.icd.length-3}</span>}
                          </div>
                        ) : <span className="text-slate-300 text-xs">Sin criterios</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {mods.map(m => <span key={m} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{m}</span>)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-3 justify-end">
                          <button onClick={() => { setCurrent(c); setView("results"); }}
                            className="text-indigo-600 hover:underline text-xs font-medium">Ver</button>
                          <button onClick={() => startEdit(c)}
                            className="text-slate-500 hover:underline text-xs">Editar</button>
                          <button onClick={() => setDeleteConfirm(c.id)}
                            className="text-red-400 hover:underline text-xs">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
              <h3 className="font-semibold text-slate-800 mb-2">¿Eliminar evaluación?</h3>
              <p className="text-sm text-slate-500 mb-5">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-5 leading-relaxed">
          ⚠ Herramienta de apoyo a investigación. Los algoritmos diagnósticos son aproximaciones basadas en criterios operacionales publicados en ICD-10/DSM-5, no equivalentes a los algoritmos propietarios del OPCRIT+ original. Validar antes de uso en investigación formal. Datos almacenados localmente en el navegador.
        </p>
      </div>
    </div>
  );

  // ── VISTA: FORMULARIO ──────────────────────────────────
  if (view === "form") {
    const sec = visSecs[secIdx] || visSecs[0];
    const its = secItems(sec?.id || "dem");
    const secMeta = SECTIONS.find(s => s.id === sec?.id);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("cases")} className="text-slate-400 hover:text-slate-600 text-xl leading-none">←</button>
            <div>
              <span className="text-sm font-semibold text-slate-700">{editId ? "Editar evaluación" : "Nueva evaluación OPCRIT+"}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{width:`${totalVisible>0?Math.round(totalAnswered/totalVisible*100):0}%`}} />
                </div>
                <span className="text-xs text-slate-400">{totalAnswered}/{totalVisible} ítems</span>
              </div>
            </div>
          </div>
          <button onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-1.5">
            {saved ? "✓ Guardado" : "Guardar y diagnosticar"}
          </button>
        </div>

        <div className="flex flex-1 max-w-6xl mx-auto w-full">
          {/* Sidebar */}
          <aside className="w-52 shrink-0 p-4 sticky top-14 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            {visSecs.map((s, i) => {
              const meta = SECTIONS.find(x => x.id === s.id);
              const ans = answeredInSec(s.id);
              const tot = secItems(s.id).length;
              const isActive = i === secIdx;
              return (
                <button key={s.id} onClick={() => setSecIdx(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 text-xs transition-all flex items-center justify-between gap-2 ${
                    isActive ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-600 hover:bg-slate-100"
                  }`}>
                  <span>{meta?.short || s.label}</span>
                  {ans > 0 && (
                    <span className={`text-xs font-mono shrink-0 ${isActive ? "text-indigo-200" : "text-slate-400"}`}>
                      {ans}/{tot}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Form panel */}
          <main className="flex-1 p-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-7 max-w-2xl">
              <div className="mb-7">
                <h2 className="text-lg font-bold" style={{ color: secMeta?.color || "#1e3a5f" }}>
                  {secMeta?.label || sec?.label}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{its.length} ítems en esta sección</p>
              </div>

              <div className="space-y-7">
                {its.map(item => (
                  <div key={item.id}>
                    <div className="flex items-start gap-1.5 mb-2.5">
                      <label className="text-sm text-slate-700 leading-snug">{item.label}</label>
                      {item.tip && (
                        <span className="text-blue-400 text-xs cursor-help shrink-0 mt-0.5" title={item.tip}>①</span>
                      )}
                    </div>
                    <Field item={item} value={form[item.id]} onChange={v => setForm(p => ({ ...p, [item.id]: v }))} />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-10 pt-5 border-t border-slate-100">
                {secIdx > 0 ? (
                  <button onClick={() => setSecIdx(secIdx - 1)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 text-slate-600">
                    ← {SECTIONS.find(x => x.id === visSecs[secIdx-1]?.id)?.short}
                  </button>
                ) : <div />}
                {secIdx < visSecs.length - 1 ? (
                  <button onClick={() => setSecIdx(secIdx + 1)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    {SECTIONS.find(x => x.id === visSecs[secIdx+1]?.id)?.short} →
                  </button>
                ) : (
                  <button onClick={handleSave}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                    ✓ Guardar y ver diagnóstico
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── VISTA: RESULTADOS ──────────────────────────────────
  if (view === "results" && current) {
    const r = current.responses;
    const modules = [
      { key:"scr_psy", label:"Psicosis",    color:"#b91c1c" },
      { key:"scr_man", label:"Manía",       color:"#d97706" },
      { key:"scr_dep", label:"Depresión",   color:"#2563eb" },
      { key:"scr_anx", label:"Ansiedad",    color:"#059669" },
      { key:"scr_sub", label:"Sustancias",  color:"#9333ea" },
      { key:"scr_per", label:"Personalidad",color:"#db2777" },
      { key:"scr_cog", label:"Cognitivo",   color:"#475569" },
    ];

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setView("cases")} className="text-slate-400 hover:text-slate-600 text-xl">←</button>
              <div>
                <h2 className="font-bold text-slate-800">Resultados diagnósticos</h2>
                <p className="text-xs text-slate-400">#{current.id.slice(-6)} · {new Date(current.createdAt).toLocaleDateString("es-PE")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(current)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">Editar evaluación</button>
              <button onClick={exportCSV} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">⬇ CSV</button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
          {/* Resumen demográfico */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                ["Sexo", r.sex||"—"],
                ["Edad", r.age?r.age+" años":"—"],
                ["Inicio", r.age_onset?r.age_onset+" años":"—"],
                ["Curso", r.course||"—"],
                ["Funcionamiento premórbido", r.premorbid||"—"],
              ].map(([k,v]) => (
                <div key={k}>
                  <p className="text-xs text-slate-400 mb-0.5">{k}</p>
                  <p className="text-sm font-medium text-slate-700 truncate">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Módulos activados */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Módulos activados en cribado</p>
            <div className="flex flex-wrap gap-2">
              {modules.map(m => {
                const on = r[m.key] === true;
                return (
                  <span key={m.key} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${on ? "text-white border-transparent" : "text-slate-300 border-slate-200 bg-slate-50"}`}
                    style={on ? { backgroundColor: m.color } : {}}>
                    {on ? "✓ " : "○ "}{m.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Diagnósticos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[["ICD-10", current.icd], ["DSM-5", current.dsm]].map(([sys, dxList]) => (
              <div key={sys} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700">{sys}</h3>
                  {dxList.length > 0 && <Badge text={`${dxList.length} diagnóstico${dxList.length>1?"s":""}`} variant="blue" />}
                </div>
                {dxList.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No se cumplen criterios con los datos ingresados.</p>
                ) : (
                  <div className="space-y-2.5">
                    {dxList.map((d, i) => (
                      <div key={i} className={`p-3 rounded-lg border-l-4 ${d.conf==="probable" ? "border-indigo-400 bg-indigo-50" : "border-amber-400 bg-amber-50"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-slate-600">{d.code}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${d.conf==="probable" ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>
                            {d.conf}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1 leading-snug">{d.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            ⚠ Los diagnósticos son generados automáticamente por algoritmos aproximados basados en criterios publicados en ICD-10/DSM-5. No son equivalentes a los algoritmos propietarios de OPCRIT+. Los valores de confianza ("probable" / "posible") reflejan el cumplimiento de criterios operacionales, no el juicio clínico del evaluador. Validar antes de uso en investigación formal.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
