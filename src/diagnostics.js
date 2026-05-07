function yes(value) {
  return value === true;
}

function n(...ids) {
  return ids.filter(Boolean).length;
}

function valueNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function makeDx({ code, name, system = "OPCRIT+ Table 2", confidence = "probable", matchedCriteria = [], missingCriteria = [] }) {
  return { code, name, system, confidence, matchedCriteria, missingCriteria };
}

function addDx(list, dx) {
  if (!list.some(item => item.code === dx.code && item.name === dx.name)) {
    list.push(dx);
  }
}

function dependenceCriteria(r, prefix) {
  const ids = [
    `${prefix}_dep_craving`,
    `${prefix}_dep_control`,
    `${prefix}_dep_withdrawal`,
    `${prefix}_dep_tolerance`,
    `${prefix}_dep_salience`,
    `${prefix}_dep_harm`
  ];
  return ids.filter(id => yes(r[id]));
}

function substanceDiagnostics(r, prefix, label, codePrefix) {
  const diagnoses = [];
  const dependence = dependenceCriteria(r, prefix);
  const harmful = yes(r[`${prefix}_harmful_use`]) || yes(r[`${prefix}_related_psychopathology`]);

  if (dependence.length >= 3) {
    diagnoses.push(makeDx({
      code: `${codePrefix}.2`,
      name: `${label}: sindrome de dependencia`,
      confidence: "probable",
      matchedCriteria: dependence.map(id => id.replace(`${prefix}_dep_`, "dependencia: ")),
      missingCriteria: []
    }));
  } else if (harmful) {
    diagnoses.push(makeDx({
      code: `${codePrefix}.1`,
      name: `${label}: uso danino`,
      confidence: "probable",
      matchedCriteria: [
        yes(r[`${prefix}_harmful_use`]) ? "uso danino registrado" : null,
        yes(r[`${prefix}_related_psychopathology`]) ? "relacionado con psicopatologia" : null
      ].filter(Boolean),
      missingCriteria: dependence.length ? [] : ["menos de 3 criterios de dependencia"]
    }));
  }

  return diagnoses;
}

export function runDiagnostics(r) {
  const diagnoses = [];

  const psychoticCore = n(
    yes(r.delusions_present),
    yes(r.abnormal_perceptions_present),
    yes(r.third_person_auditory_hallucinations),
    yes(r.running_commentary_voices),
    yes(r.non_affective_hallucination_any_modality),
    yes(r.positive_formal_thought_disorder),
    yes(r.speech_incoherent),
    yes(r.bizarre_behaviour),
    yes(r.passivity_phenomena_present),
    yes(r.thought_insertion),
    yes(r.thought_withdrawal),
    yes(r.thought_broadcast)
  );
  const hasPsychosis = psychoticCore >= 1 || yes(r.complaint_f2x_psychotic);
  const psychosisDuration = valueNumber(r.duration_illness_weeks);
  const currentEpisodeWeeks = valueNumber(r.current_episode_duration_weeks);
  const psychoticMoodRelation = r.psychotic_affective_relationship;

  const depressiveSymptoms = n(
    yes(r.dysphoria),
    yes(r.loss_of_pleasure),
    yes(r.loss_of_energy),
    yes(r.excessive_self_reproach),
    yes(r.suicidal_ideation),
    yes(r.poor_concentration),
    yes(r.initial_insomnia) || yes(r.middle_insomnia) || yes(r.early_morning_waking) || yes(r.excessive_sleep),
    yes(r.poor_appetite) || yes(r.weight_loss) || yes(r.increased_appetite) || yes(r.weight_gain)
  );
  const depressiveCore = yes(r.dysphoria) || yes(r.loss_of_pleasure);
  const depressiveEpisode = depressiveCore && depressiveSymptoms >= 3;
  const somaticDepression = n(
    yes(r.loss_of_pleasure),
    yes(r.diurnal_variation_worse_morning),
    yes(r.early_morning_waking),
    yes(r.loss_of_energy),
    yes(r.weight_loss),
    yes(r.poor_appetite)
  ) >= 3;

  if (depressiveEpisode) {
    const matched = [`${depressiveSymptoms} sintomas depresivos`, depressiveCore ? "sintoma nuclear depresivo presente" : null].filter(Boolean);
    if (depressiveSymptoms >= 7) {
      addDx(diagnoses, makeDx({
        code: hasPsychosis ? "F32.3/F33.3" : "F32.2/F33.2",
        name: hasPsychosis ? "Trastorno depresivo severo con sintomas psicoticos" : "Trastorno depresivo severo",
        matchedCriteria: matched,
        missingCriteria: hasPsychosis ? [] : ["sin sintomas psicoticos suficientes para especificador psicotico"]
      }));
    } else if (depressiveSymptoms >= 5) {
      addDx(diagnoses, makeDx({
        code: somaticDepression ? "F32.11/F33.11" : "F32.1/F33.1",
        name: somaticDepression ? "Trastorno depresivo moderado con sindrome somatico" : "Trastorno depresivo moderado",
        matchedCriteria: somaticDepression ? [...matched, "sindrome somatico probable"] : matched,
        missingCriteria: somaticDepression ? [] : ["sindrome somatico no suficientemente documentado"]
      }));
    } else {
      addDx(diagnoses, makeDx({
        code: "F32.0/F33.0",
        name: "Trastorno depresivo leve",
        matchedCriteria: matched,
        missingCriteria: ["menos de 5 sintomas para depresion moderada"]
      }));
    }
  }

  const manicSymptoms = n(
    yes(r.elevated_mood),
    yes(r.irritable_mood),
    yes(r.increased_self_esteem),
    yes(r.increased_sociability),
    yes(r.reduced_need_sleep),
    yes(r.pressured_speech),
    yes(r.thoughts_racing),
    yes(r.reckless_activity),
    yes(r.excessive_activity),
    yes(r.distractibility_behaviour),
    yes(r.altered_libido)
  );
  const manicMood = yes(r.elevated_mood) || yes(r.irritable_mood);
  const manicSyndrome = manicMood && manicSymptoms >= 4;
  const manicImpairment = yes(r.impairment_during_disorder) || yes(r.reckless_activity) || yes(r.risk_harm_self) || yes(r.risk_harm_others);

  if (manicSyndrome) {
    if (manicImpairment) {
      addDx(diagnoses, makeDx({
        code: hasPsychosis ? "F30.2" : "F30.1",
        name: hasPsychosis ? "Mania con psicosis" : "Mania",
        matchedCriteria: [`${manicSymptoms} sintomas maniformes`, "deterioro/riesgo compatible con mania"],
        missingCriteria: hasPsychosis ? [] : ["sin psicosis suficiente para mania con psicosis"]
      }));
    } else {
      addDx(diagnoses, makeDx({
        code: "F30.0",
        name: "Hipomania",
        confidence: "posible",
        matchedCriteria: [`${manicSymptoms} sintomas maniformes`, "sin deterioro grave documentado"],
        missingCriteria: ["falta documentar deterioro grave/hospitalizacion para mania"]
      }));
    }
  }

  if (manicSyndrome && manicImpairment) {
    addDx(diagnoses, makeDx({
      code: "F31.1/F31.2",
      name: "Trastorno bipolar I",
      matchedCriteria: ["sindrome maniaco"],
      missingCriteria: []
    }));
  } else if (manicSyndrome && depressiveEpisode) {
    addDx(diagnoses, makeDx({
      code: "F31.8",
      name: "Trastorno bipolar II",
      confidence: "posible",
      matchedCriteria: ["sindrome hipomaniaco probable", "episodio depresivo probable"],
      missingCriteria: ["reglas aproximadas: confirmar historia longitudinal"]
    }));
  }

  if (hasPsychosis) {
    const psychoticMatched = [`${psychoticCore} dominios psicoticos`, psychosisDuration ? `${psychosisDuration} semanas de duracion` : null].filter(Boolean);
    if (psychoticCore >= 2 && psychosisDuration >= 26 && yes(r.impairment_during_disorder)) {
      addDx(diagnoses, makeDx({
        code: "F20",
        name: "Esquizofrenia",
        matchedCriteria: psychoticMatched,
        missingCriteria: []
      }));
    } else if (psychoticCore >= 2 && psychosisDuration >= 1 && psychosisDuration < 26) {
      addDx(diagnoses, makeDx({
        code: "F20.8/F23",
        name: "Trastorno esquizofreniforme",
        confidence: "posible",
        matchedCriteria: psychoticMatched,
        missingCriteria: ["duracion menor a 26 semanas para esquizofrenia"]
      }));
    }

    const schizoaffectiveEligible =
      psychoticMoodRelation === "Psicoticos fuera de sintomas afectivos" ||
      psychoticMoodRelation === "Psicoticos y afectivos concurrentes";

    if (schizoaffectiveEligible && (depressiveEpisode || manicSyndrome)) {
      const type = manicSyndrome && depressiveEpisode ? "bipolar" : manicSyndrome ? "maniaco" : "depresivo";
      addDx(diagnoses, makeDx({
        code: type === "maniaco" ? "F25.0" : type === "depresivo" ? "F25.1" : "F25.2",
        name: `Trastorno esquizoafectivo, tipo ${type}`,
        confidence: psychoticMoodRelation === "Psicoticos fuera de sintomas afectivos" ? "probable" : "posible",
        matchedCriteria: ["sintomas psicoticos", "sindrome afectivo concurrente"],
        missingCriteria: psychoticMoodRelation === "Psicoticos fuera de sintomas afectivos" ? [] : ["confirmar psicosis fuera de episodios afectivos"]
      }));
    }

    const hasSpecificPsychoticDx = diagnoses.some(dx =>
      dx.code === "F20" ||
      dx.code === "F20.8/F23" ||
      dx.code.startsWith("F25") ||
      /^(F30\.2|F32\.3|F33\.3)/.test(dx.code)
    );

    if (yes(r.delusions_present) && psychoticCore <= 3 && !hasSpecificPsychoticDx) {
      addDx(diagnoses, makeDx({
        code: "F22",
        name: "Trastorno delirante",
        confidence: "posible",
        matchedCriteria: ["delirios presentes"],
        missingCriteria: ["descartar esquizofrenia, afectivo y sustancias"]
      }));
    } else if (!hasSpecificPsychoticDx) {
      addDx(diagnoses, makeDx({
        code: "F28/F29",
        name: "Otro trastorno psicotico no organico",
        confidence: "posible",
        matchedCriteria: ["sintomas psicoticos presentes"],
        missingCriteria: ["criterios insuficientes para categoria psicotica especifica"]
      }));
    }
  }

  if (yes(r.phobic_marked_fear_avoidance)) {
    const agora = yes(r.phobic_crowds) || yes(r.phobic_public_places) || yes(r.phobic_travelling_alone) || yes(r.phobic_travelling_away_home);
    if (agora) {
      addDx(diagnoses, makeDx({
        code: yes(r.panic_recurrent_abrupt_severe) ? "F40.01" : "F40.00",
        name: yes(r.panic_recurrent_abrupt_severe) ? "Agorafobia con trastorno de panico" : "Agorafobia sin trastorno de panico",
        matchedCriteria: ["miedo/evitacion situacional", "situaciones agorafobicas"],
        missingCriteria: yes(r.panic_recurrent_abrupt_severe) ? [] : ["sin ataques de panico documentados"]
      }));
    }
    if (yes(r.phobic_focus_attention_social) || yes(r.phobic_public_symptoms)) {
      addDx(diagnoses, makeDx({
        code: "F40.1",
        name: "Fobia social",
        matchedCriteria: ["miedo social o sintomas en publico"],
        missingCriteria: []
      }));
    }
  }

  const panicCriteria = n(yes(r.panic_recurrent_abrupt_severe), yes(r.panic_not_restricted), yes(r.panic_unpredictable), yes(r.panic_peak_minutes), yes(r.panic_autonomic_or_other));
  if (panicCriteria >= 4) {
    addDx(diagnoses, makeDx({
      code: "F41.0",
      name: "Trastorno de panico",
      matchedCriteria: [`${panicCriteria}/5 criterios de panico`],
      missingCriteria: panicCriteria < 5 ? ["algun criterio de panico no documentado"] : []
    }));
  }

  const gadCriteria = n(yes(r.gad_free_floating_worry), yes(r.gad_restlessness), yes(r.gad_easily_fatigued), yes(r.gad_poor_concentration_blank), yes(r.gad_irritability), yes(r.gad_muscle_tension), yes(r.gad_sleep_disturbance));
  if (yes(r.gad_free_floating_worry) && gadCriteria >= 4) {
    addDx(diagnoses, makeDx({
      code: "F41.1",
      name: "Trastorno de ansiedad generalizada",
      matchedCriteria: [`${gadCriteria} criterios de preocupacion/ansiedad`],
      missingCriteria: []
    }));
  }

  const ocdCriteria = n(yes(r.ocd_obsessions_compulsions), yes(r.ocd_repetitive_unpleasant), yes(r.ocd_resisted_unsuccessfully), yes(r.ocd_own_mind), yes(r.ocd_excessive_unreasonable));
  if (ocdCriteria >= 4) {
    addDx(diagnoses, makeDx({
      code: "F42",
      name: "Trastorno obsesivo-compulsivo",
      matchedCriteria: [`${ocdCriteria}/5 criterios obsesivo-compulsivos`],
      missingCriteria: ocdCriteria < 5 ? ["criterio obsesivo-compulsivo no documentado"] : []
    }));
  }

  if (yes(r.trauma_catastrophic_within_6m) && yes(r.trauma_reexperiencing) && yes(r.trauma_avoidance_numbing) && yes(r.trauma_hyperarousal)) {
    addDx(diagnoses, makeDx({
      code: "F43.1",
      name: "Trastorno de estres postraumatico",
      matchedCriteria: ["trauma", "reexperimentacion", "evitacion/embotamiento", "hiperactivacion"],
      missingCriteria: []
    }));
  }

  const personalityCoreDomains = n(
    yes(r.personality_cognition),
    yes(r.personality_affectivity),
    yes(r.personality_interpersonal),
    yes(r.personality_impulse_control)
  );
  if (
    yes(r.personality_enduring_pattern) &&
    personalityCoreDomains >= 2 &&
    yes(r.personality_inflexible_pervasive) &&
    yes(r.personality_onset_child_adol)
  ) {
    addDx(diagnoses, makeDx({
      code: "F60/F61",
      name: "Trastorno de personalidad, criterios nucleares",
      matchedCriteria: [
        "patron perdurable",
        `${personalityCoreDomains}/4 dominios nucleares`,
        "inflexible y pervasivo",
        "inicio en infancia/adolescencia"
      ],
      missingCriteria: []
    }));
  }

  for (const dx of substanceDiagnostics(r, "alcohol", "Alcohol", "F10")) addDx(diagnoses, dx);
  for (const dx of substanceDiagnostics(r, "cannabis", "Cannabis", "F12")) addDx(diagnoses, dx);
  for (const dx of substanceDiagnostics(r, "opiates", "Opiaceos", "F11")) addDx(diagnoses, dx);
  for (const dx of substanceDiagnostics(r, "stimulants", "Estimulantes", "F15")) addDx(diagnoses, dx);

  if (diagnoses.some(dx => dx.code.startsWith("F25") && dx.confidence === "probable")) {
    return diagnoses.filter(dx =>
      dx.code.startsWith("F25") ||
      !/^(F20|F28|F29|F30|F31|F32|F33)/.test(dx.code)
    );
  }

  return diagnoses;
}
