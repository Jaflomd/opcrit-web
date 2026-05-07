const bool = "bool3";

const yesNoUnknown = ["Si", "No", "Desconocido"];

const frequencyOptions = [
  "Nunca",
  "Mensual o menos",
  "2-4 veces al mes",
  "2-3 veces por semana",
  "4 o mas veces por semana",
  "Diario o casi diario",
  "Desconocido"
];

const courseOptions = [
  "Episodio unico",
  "Episodico con recuperacion completa",
  "Episodico con deficit residual",
  "Continuo o cronico",
  "Curso fluctuante",
  "Desconocido"
];

const onsetOptions = [
  "Agudo",
  "Subagudo",
  "Insidioso",
  "Desconocido"
];

function item(id, label, type = bool, extra = {}) {
  return { id, label, type, ...extra };
}

function depCriteria(prefix) {
  return [
    item(`${prefix}_dep_craving`, "Deseo intenso o sentido de compulsion por tomar la sustancia"),
    item(`${prefix}_dep_control`, "Capacidad deteriorada para controlar la conducta de consumo"),
    item(`${prefix}_dep_withdrawal`, "Presencia de un estado fisiologico de abstinencia"),
    item(`${prefix}_dep_tolerance`, "Evidencia de tolerancia"),
    item(`${prefix}_dep_salience`, "Preocupacion por el consumo con reduccion o ausencia de intereses alternativos"),
    item(`${prefix}_dep_harm`, "Uso persistente pese a evidencia clara de consecuencias daninas")
  ];
}

function substanceGroup(prefix, title, harmfulLabel, relatedLabel) {
  return {
    id: `${prefix}_use`,
    title,
    items: [
      item(`${prefix}_harmful_use`, harmfulLabel),
      item(`${prefix}_frequency`, "Frecuencia de uso", "select", { opts: frequencyOptions }),
      item(`${prefix}_related_psychopathology`, relatedLabel),
      item(`${prefix}_regular_use_age`, "Edad de inicio de uso regular", "number", { min: 0, max: 120 }),
      ...depCriteria(prefix)
    ]
  };
}

export const OPCRIT_SECTIONS = [
  {
    id: "dem_pc",
    title: "Demografia y motivo de presentacion",
    short: "Demografia",
    color: "#0f766e",
    groups: [
      {
        id: "rating_context",
        title: "Contexto de la valoracion",
        items: [
          item("time_frame", "Marco temporal de la valoracion", "text"),
          item("source_of_rating", "Fuente de la valoracion", "text")
        ]
      },
      {
        id: "demographics",
        title: "Datos demograficos",
        items: [
          item("gender", "Genero", "select", { opts: ["Masculino", "Femenino", "Otro/no especificado", "Desconocido"] }),
          item("age", "Edad", "number", { min: 0, max: 120 }),
          item("ethnicity", "Etnicidad", "text"),
          item("current_employment_status", "Estado laboral actual", "select", {
            opts: ["Empleado/a", "Desempleado/a", "Estudiante", "Jubilado/a", "Incapacidad laboral", "Otro", "Desconocido"]
          }),
          item("current_accommodation_status", "Situacion actual de alojamiento", "select", {
            opts: ["Vivienda propia o familiar", "Vivienda alquilada", "Institucion", "Sin vivienda estable", "Otro", "Desconocido"]
          }),
          item("twin", "Gemelo/a"),
          item("first_presentation", "Primera presentacion")
        ]
      }
    ]
  },
  {
    id: "hpc",
    title: "Historia del problema actual",
    short: "Historia actual",
    color: "#1e3a8a",
    groups: [
      {
        id: "course",
        title: "Inicio, curso y duracion",
        items: [
          item("age_of_onset", "Edad de inicio", "number", { min: 0, max: 120 }),
          item("mode_of_onset", "Modo de inicio", "select", { opts: onsetOptions }),
          item("duration_illness_weeks", "Duracion de la enfermedad en semanas", "number", { min: 0, max: 998 }),
          item("course_of_disorder", "Curso del trastorno", "select", { opts: courseOptions }),
          item("impairment_during_disorder", "Deterioro o incapacidad durante el trastorno"),
          item("organic_brain_disease_prior", "Enfermedad cerebral organica definida o probable previa al inicio"),
          item("psychosocial_stressor_prior", "Estresor psicosocial definido o experiencia traumatica catastrofica previa al inicio"),
          item("harmful_alcohol_drug_prior", "Uso danino definido de alcohol o drogas ilicitas previo al inicio"),
          item("current_episode_duration_weeks", "Duracion del episodio actual en semanas", "number", { min: 0, max: 99 })
        ]
      },
      {
        id: "risk",
        title: "Historia de alteracion conductual que causa preocupacion por...",
        items: [
          item("risk_harm_others", "Riesgo de dano a otros"),
          item("risk_harm_self", "Riesgo de dano a si mismo"),
          item("risk_vulnerability_exploitation", "Riesgo de vulnerabilidad y/o explotacion por otros")
        ]
      },
      {
        id: "complaints",
        title: "Paciente o informante colateral refiere...",
        items: [
          item("complaint_f0x_cognitive", "F0X: alteracion cognitiva"),
          item("complaint_f1x_substance", "F1X: problemas relacionados con uso de sustancias"),
          item("complaint_f2x_psychotic", "F2X: sintomas psicoticos"),
          item("complaint_f3x_mood", "F3X: sintomas afectivos"),
          item("complaint_f4x_anxiety_trauma", "F4X: sintomas de ansiedad o respuesta a trauma"),
          item("complaint_f6x_personality", "F6X: problemas atribuibles a personalidad")
        ]
      }
    ]
  },
  {
    id: "family",
    title: "Historia familiar",
    short: "Familia",
    color: "#7c3aed",
    groups: [
      {
        id: "family_mental",
        title: "Historia familiar de enfermedad mental",
        items: [
          item("fh_schizophrenia", "Esquizofrenia"),
          item("fh_schizoaffective", "Trastorno esquizoafectivo"),
          item("fh_bipolar", "Trastorno afectivo bipolar"),
          item("fh_major_depression", "Trastorno depresivo mayor"),
          item("fh_anxiety", "Trastornos de ansiedad"),
          item("fh_drug_alcohol_dependence", "Dependencia de drogas o alcohol"),
          item("fh_personality_disorder", "Trastorno de personalidad"),
          item("fh_dementia", "Demencia"),
          item("fh_adhd", "TDAH"),
          item("fh_autism", "Trastorno del espectro autista")
        ]
      },
      {
        id: "family_physical",
        title: "Historia familiar de enfermedad fisica",
        items: [
          item("fh_diabetes", "Diabetes"),
          item("fh_cardiovascular", "Enfermedad cardiovascular"),
          item("fh_cerebrovascular", "Enfermedad cerebrovascular"),
          item("fh_malignant_cancer", "Cancer maligno")
        ]
      }
    ]
  },
  {
    id: "personal",
    title: "Historia personal",
    short: "Personal",
    color: "#2563eb",
    groups: [
      {
        id: "development",
        title: "Experiencias o diagnosticos prenatales, infantiles o adolescentes adversos",
        items: [
          item("prenatal_high_maternal_stress", "Alto estres materno durante el embarazo"),
          item("prematurity_low_birth_weight", "Prematuridad o bajo peso al nacer"),
          item("obstetric_difficulties_birth_injury", "Dificultades obstetricas o lesion al nacer"),
          item("speech_not_by_age_3", "No desarrollo habla hacia los 3 anos"),
          item("play_not_by_age_3", "No desarrollo juego apropiado hacia los 3 anos"),
          item("social_not_by_age_3", "No desarrollo habilidades esperadas de interaccion social hacia los 3 anos"),
          item("sexual_abuse_exposure", "Exposicion a abuso sexual"),
          item("physical_abuse_exposure", "Exposicion a abuso fisico"),
          item("childhood_adhd_diagnosis", "Diagnostico de TDAH en la infancia"),
          item("childhood_conduct_diagnosis", "Diagnostico de trastorno de conducta en la infancia"),
          item("childhood_autism_diagnosis", "Diagnostico de trastorno del espectro autista en la infancia"),
          item("childhood_depression_anxiety_diagnosis", "Diagnostico de depresion o ansiedad en la infancia")
        ]
      },
      {
        id: "education",
        title: "Educacion",
        items: [
          item("highest_educational_attainment", "Mayor nivel educativo alcanzado", "select", {
            opts: ["Sin escolaridad", "Primaria incompleta", "Primaria completa", "Secundaria incompleta", "Secundaria completa", "Tecnica", "Universitaria", "Posgrado", "Desconocido"]
          })
        ]
      },
      {
        id: "recent_life_events",
        title: "Eventos vitales adversos recientes (ultimos 6 meses)",
        items: [
          item("life_serious_illness_injury_assault", "Enfermedad grave, lesion o agresion"),
          item("life_serious_illness_relative", "Enfermedad grave, lesion o agresion a familiar cercano"),
          item("life_death_parent_partner_child_sibling", "Muerte de padre/madre, pareja, hijo/a o hermano/a"),
          item("life_death_close_friend_relative", "Muerte de amigo familiar cercano u otro familiar"),
          item("life_marital_separation", "Separacion matrimonial o ruptura de relacion estable"),
          item("life_serious_problem_close_person", "Problema grave con amigo cercano, vecino o familiar"),
          item("life_redundant_sacked", "Despido o redundancia laboral"),
          item("life_unsuccessful_job_search", "Busqueda de trabajo por mas de un mes sin exito"),
          item("life_major_financial_crisis", "Crisis financiera mayor"),
          item("life_police_court_problem", "Problema con la policia o comparecencia judicial"),
          item("life_loss_highly_valued", "Perdida de algo altamente valorado"),
          item("life_birth_child", "Nacimiento de un hijo/a")
        ]
      }
    ]
  },
  {
    id: "past_psych",
    title: "Antecedentes psiquiatricos",
    short: "Psiq previos",
    color: "#4f46e5",
    groups: [
      {
        id: "past_psych_history",
        title: "Diagnostico, tratamiento e ingresos previos",
        items: [
          item("past_psych_diagnosis_treatment", "Historia de cualquier diagnostico o tratamiento psiquiatrico previo"),
          item("past_self_harm", "Autolesion"),
          item("past_attempted_suicide", "Intento suicida"),
          item("past_informal_admissions", "Ingresos informales"),
          item("past_formal_admissions", "Ingresos formales")
        ]
      }
    ]
  },
  {
    id: "medical",
    title: "Antecedentes medicos y quirurgicos",
    short: "Medicos",
    color: "#0891b2",
    groups: [
      {
        id: "medical_history",
        title: "Condiciones medicas o quirurgicas",
        items: [
          item("medical_surgical_condition_history", "Historia de tratamiento o diagnostico de condicion medica/quirurgica"),
          item("med_hypertension", "Hipertension"),
          item("med_diabetes", "Diabetes"),
          item("med_hyperlipidaemia", "Hiperlipidemia"),
          item("med_thyroid_disease", "Enfermedad tiroidea"),
          item("med_cardiovascular", "Enfermedad cardiovascular"),
          item("med_cerebrovascular", "Enfermedad cerebrovascular"),
          item("med_epilepsy", "Epilepsia")
        ]
      }
    ]
  },
  {
    id: "substances",
    title: "Historia de drogas y alcohol",
    short: "Sustancias",
    color: "#9333ea",
    groups: [
      {
        id: "tobacco",
        title: "Tabaco",
        items: [
          item("tobacco_smoker_ever", "Ha fumado tabaco alguna vez"),
          item("tobacco_current_smoker", "Fumador/a actual"),
          item("tobacco_avg_cigarettes_day", "Promedio de cigarrillos por dia durante la vida", "number", { min: 0, max: 200 }),
          item("tobacco_years_smoking", "Numero de anos fumando", "number", { min: 0, max: 100 }),
          item("tobacco_pack_years", "Paquetes-ano", "computed", { compute: "packYears" })
        ]
      },
      {
        id: "substance_general",
        title: "Uso danino o dependencia general",
        items: [
          item("harmful_substance_misuse_dependence_suspected", "Sospecha de uso danino o dependencia de alcohol y/o drogas ilicitas"),
          item("alcohol_drug_abuse_within_year_psychosis_onset", "Abuso de alcohol/drogas dentro del ano del inicio de sintomas psicoticos")
        ]
      },
      {
        id: "alcohol_use",
        title: "Alcohol",
        items: [
          item("alcohol_harmful_use", "Uso danino de alcohol"),
          item("alcohol_drink_frequency", "Frecuencia con que toma una bebida alcoholica", "select", { opts: frequencyOptions }),
          item("alcohol_drinks_typical_day", "Numero de bebidas alcoholicas en un dia tipico de consumo", "number", { min: 0, max: 99 }),
          item("alcohol_six_or_more_frequency", "Frecuencia de seis o mas bebidas en una ocasion", "select", { opts: frequencyOptions }),
          item("alcohol_binge_adverse_outcomes", "Conducta de consumo episodico intenso asociada putativamente a resultados adversos de salud psiquiatricos y fisicos"),
          item("alcohol_related_psychopathology", "Abuso de alcohol relacionado con psicopatologia"),
          item("alcohol_regular_use_age", "Edad de inicio de uso regular", "number", { min: 0, max: 120 }),
          ...depCriteria("alcohol")
        ]
      },
      substanceGroup("cannabis", "Cannabis", "Uso danino de cannabis", "Abuso de cannabis relacionado con psicopatologia"),
      substanceGroup("opiates", "Opiaceos", "Uso danino de opiaceos", "Abuso de opiaceos relacionado con psicopatologia"),
      substanceGroup("stimulants", "Estimulantes (anfetaminas/cocaina/crack)", "Uso danino de estimulantes", "Abuso de estimulantes relacionado con psicopatologia")
    ]
  },
  {
    id: "medication",
    title: "Historia farmacologica",
    short: "Medicacion",
    color: "#0d9488",
    groups: [
      {
        id: "medication_history",
        title: "Respuesta a tratamiento",
        items: [
          item("psychotic_symptoms_respond_neuroleptics", "Los sintomas psicoticos responden a neurolepticos")
        ]
      }
    ]
  },
  {
    id: "forensic",
    title: "Historia forense",
    short: "Forense",
    color: "#b45309",
    groups: [
      {
        id: "forensic_history",
        title: "Conducta criminal o violenta",
        items: [
          item("criminal_violent_history", "Historia de conducta criminal y/o violenta"),
          item("convictions_under_18", "Condenas previas antes de los 18 anos"),
          item("under18_assaults_sexual_aggression", "Agresiones y/o agresion sexual a otros antes de los 18"),
          item("under18_thieving", "Robo antes de los 18"),
          item("under18_drug_selling", "Venta de drogas antes de los 18"),
          item("convictions_over_18", "Condenas previas desde los 18 anos"),
          item("over18_assaults_sexual_aggression", "Agresiones y/o agresion sexual a otros desde los 18"),
          item("over18_thieving", "Robo desde los 18"),
          item("over18_drug_selling", "Venta de drogas desde los 18"),
          item("more_than_one_asbo_under18", "Mas de una orden antisocial/conductual antes de los 18"),
          item("more_than_one_asbo_over18", "Mas de una orden antisocial/conductual desde los 18"),
          item("patient_weapon_injury_last5y", "Historia de lesion con arma causada por el paciente en los ultimos 5 anos"),
          item("perpetrator_violence_rape_last6m", "Historia de ser perpetrador de violencia o violacion en los ultimos 6 meses"),
          item("victim_criminal_behaviour_history", "Historia de ser victima de conducta criminal"),
          item("victim_weapon_injury_last5y", "Historia de ser victima de lesion con arma en los ultimos 5 anos"),
          item("victim_violence_rape_last6m", "Historia de ser victima de violencia o violacion en los ultimos 6 meses")
        ]
      }
    ]
  },
  {
    id: "social",
    title: "Historia social",
    short: "Social",
    color: "#64748b",
    groups: [
      {
        id: "social_history",
        title: "Funcionamiento social y laboral",
        items: [
          item("single_never_married", "Soltero/a: nunca se ha casado ni vivido como casado/a"),
          item("poor_work_adjustment", "Mal ajuste laboral"),
          item("unemployed_at_onset", "Desempleado/a al inicio"),
          item("poor_premorbid_social_adjustment", "Mal ajuste social premorbido"),
          item("deterioration_premorbid_functioning", "Deterioro desde el nivel premorbido de funcionamiento")
        ]
      }
    ]
  },
  {
    id: "personality",
    title: "Personalidad",
    short: "Personalidad",
    color: "#db2777",
    groups: [
      {
        id: "personality_core",
        title: "Criterios nucleares",
        items: [
          item("personality_enduring_pattern", "Patron perdurable de experiencia interna y conducta que se desvia marcadamente de las expectativas culturales"),
          item("personality_cognition", "Se manifiesta en formas de percibir e interpretar a si mismo, a otras personas y eventos"),
          item("personality_affectivity", "Se manifiesta en rango, intensidad, labilidad y adecuacion de la respuesta emocional"),
          item("personality_interpersonal", "Se manifiesta en funcionamiento interpersonal"),
          item("personality_impulse_control", "Se manifiesta en control de impulsos y gratificacion de necesidades"),
          item("personality_inflexible_pervasive", "El patron es inflexible y pervasivo en una amplia gama de situaciones personales y sociales"),
          item("personality_onset_child_adol", "El inicio del patron ocurre en la infancia o adolescencia"),
          item("personality_onset_early_childhood", "Inicio en primera infancia"),
          item("personality_onset_late_childhood_adolescence", "Inicio en infancia tardia o adolescencia")
        ]
      },
      {
        id: "personality_antisocial",
        title: "Tendencia hacia conducta antisocial",
        items: [
          item("personality_antisocial_tendency", "Tendencia hacia conducta antisocial"),
          item("personality_callous_unconcern", "Despreocupacion fria por los sentimientos de otros"),
          item("personality_irresponsibility", "Actitudes persistentes de irresponsabilidad y desconsideracion por normas, reglas y obligaciones sociales"),
          item("personality_relationship_incapacity", "Incapacidad para mantener relaciones duraderas, aunque sin dificultad para establecerlas"),
          item("personality_low_frustration_aggression", "Muy baja tolerancia a la frustracion y bajo umbral para descargar agresion, incluida violencia"),
          item("personality_no_guilt_no_learning", "Incapacidad para experimentar culpa o aprender de experiencias adversas, especialmente castigo"),
          item("personality_blames_others", "Tendencia marcada a culpar a otros u ofrecer racionalizaciones plausibles de la conducta conflictiva")
        ]
      },
      {
        id: "personality_impulsive",
        title: "Tendencia emocionalmente inestable o impulsiva",
        items: [
          item("personality_impulsive_tendency", "Tendencia hacia conducta emocionalmente inestable o impulsiva"),
          item("personality_fidgety", "Excesivamente inquieto/a o se retuerce al estar sentado/a mucho tiempo"),
          item("personality_excessively_active_on_go", "Excesivamente activo/a o compelido/a a hacer cosas, sensacion de estar siempre en marcha"),
          item("personality_quarrelsome", "Tendencia marcada a conducta conflictiva o peleas, especialmente si se frustran o critican actos impulsivos"),
          item("personality_unexpected_acts", "Tendencia marcada a actuar inesperadamente y sin considerar consecuencias"),
          item("personality_anger_violence_outbursts", "Tendencia a arrebatos de ira o violencia con incapacidad para controlar explosiones conductuales"),
          item("personality_no_immediate_reward_difficulty", "Dificultad para mantener cursos de accion sin recompensa inmediata"),
          item("personality_unstable_mood", "Humor inestable y caprichoso"),
          item("personality_self_image_uncertainty", "Alteraciones e incertidumbre sobre autoimagen, metas y preferencias internas, incluidas sexuales"),
          item("personality_unstable_relationships", "Tendencia a relaciones intensas e inestables, a menudo con crisis emocionales"),
          item("personality_avoid_abandonment", "Esfuerzos excesivos para evitar abandono"),
          item("personality_recurrent_self_harm_threats", "Amenazas o actos recurrentes de autolesion"),
          item("personality_chronic_emptiness", "Sentimientos cronicos de vacio")
        ]
      },
      {
        id: "personality_narcissistic",
        title: "Tendencia hacia conducta narcisista",
        items: [
          item("personality_narcissistic_tendency", "Tendencia hacia conducta narcisista"),
          item("personality_grandiose_self_importance", "Sentido grandioso de autoimportancia"),
          item("personality_fantasies_success_power", "Preocupacion por fantasias de exito, poder, brillantez, belleza o amor ideal ilimitados"),
          item("personality_special_unique", "Cree que es especial o unico/a y que solo puede ser entendido/a por personas o instituciones especiales o de alto estatus"),
          item("personality_requires_admiration", "Requiere admiracion excesiva"),
          item("personality_entitlement", "Sentido inapropiado de derecho"),
          item("personality_interpersonally_exploitative", "Es interpersonalmente explotador/a"),
          item("personality_lacks_empathy", "Falta de empatia al no reconocer o identificarse con sentimientos y necesidades de otros"),
          item("personality_envy", "A menudo envidia a otros o cree que otros le envidian"),
          item("personality_arrogant_haughty", "Conductas o actitudes arrogantes o soberbias")
        ]
      },
      {
        id: "personality_attention",
        title: "Dificultad de atencion, distractibilidad o autoorganizacion",
        items: [
          item("personality_attention_organization_tendency", "Tendencia hacia dificultad para sostener atencion, distractibilidad o problemas de autoorganizacion"),
          item("personality_task_completion_difficulty", "Dificultad excesiva para completar tareas iniciadas por distractibilidad o bajo umbral de aburrimiento"),
          item("personality_organizing_tasks_difficulty", "Dificultad excesiva para organizar tareas"),
          item("personality_forgetfulness_losing_things", "Olvidos excesivos de citas u obligaciones, o perdida frecuente de objetos"),
          item("personality_avoid_effort_tasks", "Evitacion o demora excesiva en iniciar tareas que requieren mucho pensamiento o esfuerzo mental"),
          item("personality_thoughts_unfocused", "Dificultad persistente para enfocar pensamientos; pensamientos breves, desenfocados, flotantes y en marcha")
        ]
      }
    ]
  },
  {
    id: "appearance_behaviour",
    title: "Apariencia y conducta",
    short: "Conducta",
    color: "#dc2626",
    groups: [
      {
        id: "appearance",
        title: "Apariencia",
        items: [
          item("appearance_abnormal", "Apariencia anormal"),
          item("lack_self_care", "Falta de autocuidado"),
          item("obesity", "Obesidad"),
          item("extrapyramidal_side_effects", "Efectos secundarios extrapiramidales evidentes")
        ]
      },
      {
        id: "behaviour",
        title: "Conducta",
        items: [
          item("behaviour_abnormal", "Conducta anormal"),
          item("excessive_activity", "Actividad excesiva"),
          item("reckless_activity", "Actividad temeraria"),
          item("distractibility_behaviour", "Distractibilidad"),
          item("agitated_activity", "Actividad agitada"),
          item("slowed_activity", "Actividad enlentecida"),
          item("catatonia", "Catatonia"),
          item("bizarre_behaviour", "Conducta bizarra"),
          item("difficult_rapport", "Rapport dificil"),
          item("information_not_credible", "La informacion no es creible")
        ]
      }
    ]
  },
  {
    id: "speech_thought",
    title: "Habla y forma del pensamiento",
    short: "Habla/pens.",
    color: "#be123c",
    groups: [
      {
        id: "speech_thought_form",
        title: "Habla y forma del pensamiento",
        items: [
          item("speech_thought_abnormal", "Habla (velocidad, ritmo y volumen) y/o forma del pensamiento anormal"),
          item("speech_difficult_understand", "Habla dificil de entender"),
          item("speech_incoherent", "Habla incoherente"),
          item("positive_formal_thought_disorder", "Trastorno formal positivo del pensamiento"),
          item("negative_formal_thought_disorder", "Trastorno formal negativo del pensamiento"),
          item("pressured_speech", "Habla presionada"),
          item("thoughts_racing", "Pensamientos acelerados")
        ]
      }
    ]
  },
  {
    id: "mood_affect",
    title: "Animo, afecto y caracteristicas asociadas",
    short: "Animo",
    color: "#f59e0b",
    groups: [
      {
        id: "affect_mood",
        title: "Afecto y animo",
        items: [
          item("affect_mood_abnormal", "Afecto y animo anormales"),
          item("restricted_affect", "Afecto restringido"),
          item("blunted_affect", "Afecto embotado"),
          item("inappropriate_affect", "Afecto inapropiado"),
          item("elevated_mood", "Animo elevado"),
          item("irritable_mood", "Animo irritable"),
          item("dysphoria", "Disforia"),
          item("increased_self_esteem", "Aumento de autoestima"),
          item("increased_sociability", "Aumento de sociabilidad"),
          item("poor_concentration", "Pobre concentracion"),
          item("altered_libido", "Libido alterada"),
          item("diurnal_variation_worse_morning", "Variacion diurna: animo peor por las mananas"),
          item("loss_of_pleasure", "Perdida de placer"),
          item("loss_of_energy", "Perdida de energia o cansancio"),
          item("excessive_self_reproach", "Autorreproche excesivo"),
          item("suicidal_ideation", "Ideacion suicida")
        ]
      },
      {
        id: "sleep",
        title: "Sueno",
        items: [
          item("sleep_abnormal", "Sueno anormal"),
          item("initial_insomnia", "Insomnio inicial"),
          item("middle_insomnia", "Insomnio medio o sueno fragmentado"),
          item("early_morning_waking", "Despertar precoz"),
          item("excessive_sleep", "Sueno excesivo"),
          item("reduced_need_sleep", "Disminucion de necesidad de dormir")
        ]
      },
      {
        id: "appetite_weight",
        title: "Apetito y peso",
        items: [
          item("appetite_weight_abnormal", "Apetito o peso anormal"),
          item("poor_appetite", "Pobre apetito"),
          item("weight_loss", "Perdida de peso"),
          item("increased_appetite", "Aumento de apetito"),
          item("weight_gain", "Aumento de peso")
        ]
      }
    ]
  },
  {
    id: "anxiety_trauma",
    title: "Ansiedad, trauma y caracteristicas asociadas",
    short: "Ansiedad",
    color: "#059669",
    groups: [
      {
        id: "anxiety_general",
        title: "Ansiedad general",
        items: [
          item("anxiety_levels_abnormal", "Niveles de ansiedad anormales"),
          item("autonomic_arousal_anxiety", "Sintomas de activacion autonomica durante momentos de ansiedad")
        ]
      },
      {
        id: "panic",
        title: "Ataques de panico",
        items: [
          item("panic_recurrent_abrupt_severe", "Ataques recurrentes y abruptos de ansiedad severa"),
          item("panic_not_restricted", "No restringidos a una situacion particular"),
          item("panic_unpredictable", "Algunos son impredecibles"),
          item("panic_peak_minutes", "Alcanzan maximo en pocos minutos y duran al menos algunos minutos antes de remitir"),
          item("panic_autonomic_or_other", "Caracterizados por sintomas autonomicos u otros sintomas de ansiedad")
        ]
      },
      {
        id: "gad",
        title: "Tension, preocupacion y aprehension generalizadas",
        items: [
          item("gad_free_floating_worry", "Tension, preocupacion o aprehension excesiva y libre sobre eventos/problemas cotidianos"),
          item("gad_restlessness", "Inquietud o sentirse en alerta"),
          item("gad_easily_fatigued", "Se fatiga facilmente"),
          item("gad_poor_concentration_blank", "Pobre concentracion o mente en blanco"),
          item("gad_irritability", "Irritabilidad"),
          item("gad_muscle_tension", "Tension muscular"),
          item("gad_sleep_disturbance", "Alteracion del sueno")
        ]
      },
      {
        id: "phobic",
        title: "Miedo o evitacion situacional",
        items: [
          item("phobic_marked_fear_avoidance", "Miedo o evitacion marcada y consistente de situaciones especificas o generales"),
          item("phobic_crowds", "Multitudes"),
          item("phobic_public_places", "Lugares publicos"),
          item("phobic_travelling_alone", "Viajar solo/a"),
          item("phobic_travelling_away_home", "Viajar lejos de casa"),
          item("phobic_focus_attention_social", "Ser foco de atencion o actuar de forma embarazosa en situacion social"),
          item("phobic_public_symptoms", "Rubor, temblor, miedo a vomitar o urgencia urinaria en publico")
        ]
      },
      {
        id: "ocd",
        title: "Obsesiones y compulsiones",
        items: [
          item("ocd_obsessions_compulsions", "Refiere obsesiones y/o compulsiones"),
          item("ocd_repetitive_unpleasant", "Son repetitivas y desagradables"),
          item("ocd_resisted_unsuccessfully", "Son resistidas sin exito por el paciente"),
          item("ocd_own_mind", "Son reconocidas como originadas en la propia mente"),
          item("ocd_excessive_unreasonable", "Son reconocidas como excesivas o irracionales")
        ]
      },
      {
        id: "trauma",
        title: "Evento traumatico y respuesta postraumatica",
        items: [
          item("trauma_catastrophic_within_6m", "Evento traumatico catastrofico dentro de seis meses del inicio de sintomas"),
          item("trauma_reexperiencing", "Reexperimentacion persistente del evento traumatico"),
          item("trauma_avoidance_numbing", "Evitacion persistente de disparadores o recuerdos, o embotamiento/desapego de la experiencia general"),
          item("trauma_hyperarousal", "Sintomas persistentes de hiperactivacion")
        ]
      }
    ]
  },
  {
    id: "thought_content",
    title: "Contenido del pensamiento",
    short: "Contenido",
    color: "#991b1b",
    groups: [
      {
        id: "delusions",
        title: "Delirios",
        items: [
          item("delusions_present", "Delirios presentes"),
          item("delusions_hallucinations_one_week", "Delirios y alucinaciones duran al menos una semana"),
          item("persecutory_delusions", "Delirios persecutorios"),
          item("persecutory_jealous_delusions_hallucinations", "Delirios persecutorios/celotipicos y alucinaciones"),
          item("widespread_delusions", "Delirios generalizados"),
          item("well_organized_delusions", "Delirios bien organizados"),
          item("bizarre_delusions", "Delirios bizarros"),
          item("delusions_of_influence", "Delirios de influencia"),
          item("primary_delusional_perception", "Percepcion delirante primaria"),
          item("other_primary_delusions", "Otros delirios primarios"),
          item("grandiose_delusions", "Delirios de grandiosidad"),
          item("delusions_of_guilt", "Delirios de culpa"),
          item("delusions_of_poverty", "Delirios de pobreza"),
          item("nihilistic_delusions", "Delirios nihilistas")
        ]
      },
      {
        id: "passivity",
        title: "Fenomenos de pasividad",
        items: [
          item("passivity_phenomena_present", "Fenomenos de pasividad presentes"),
          item("delusions_of_passivity", "Delirios de pasividad"),
          item("thought_insertion", "Insercion del pensamiento"),
          item("thought_withdrawal", "Robo del pensamiento"),
          item("thought_broadcast", "Difusion del pensamiento")
        ]
      },
      {
        id: "psychotic_affective_relationship",
        title: "Relacion entre sintomas psicoticos y afectivos",
        items: [
          item("psychotic_affective_relationship", "Relacion entre sintomas psicoticos y afectivos", "select", {
            opts: ["No aplica", "Psicoticos solo durante sintomas afectivos", "Psicoticos fuera de sintomas afectivos", "Psicoticos y afectivos concurrentes", "Desconocido"]
          })
        ]
      }
    ]
  },
  {
    id: "perceptions",
    title: "Percepciones",
    short: "Percepciones",
    color: "#c2410c",
    groups: [
      {
        id: "perceptions_abnormal",
        title: "Percepciones anormales",
        items: [
          item("abnormal_perceptions_present", "Percepciones anormales presentes"),
          item("thought_echo", "Eco del pensamiento"),
          item("third_person_auditory_hallucinations", "Alucinaciones auditivas en tercera persona"),
          item("running_commentary_voices", "Voces que comentan en tiempo real"),
          item("abusive_accusatory_persecutory_voices", "Voces abusivas, acusatorias o persecutorias"),
          item("other_non_affective_auditory_hallucinations", "Otras alucinaciones auditivas no afectivas"),
          item("non_affective_hallucination_any_modality", "Alucinacion no afectiva en cualquier modalidad")
        ]
      }
    ]
  },
  {
    id: "cognition",
    title: "Cognicion",
    short: "Cognicion",
    color: "#475569",
    groups: [
      {
        id: "cognitive_state",
        title: "Estado cognitivo",
        items: [
          item("cognition_broadly_intact", "Cognicion globalmente intacta"),
          item("mmse_score", "Puntaje MMSE", "number", { min: 0, max: 30 })
        ]
      }
    ]
  },
  {
    id: "insight",
    title: "Insight",
    short: "Insight",
    color: "#334155",
    groups: [
      {
        id: "insight_state",
        title: "Insight",
        items: [
          item("lack_of_insight_present", "Falta de insight presente")
        ]
      }
    ]
  },
  {
    id: "capacity",
    title: "Capacidad",
    short: "Capacidad",
    color: "#1f2937",
    groups: [
      {
        id: "capacity_state",
        title: "Capacidad",
        items: [
          item("capacity_consent_admission", "Capacidad para consentir ingreso"),
          item("capacity_consent_medical_treatment", "Capacidad para consentir tratamiento medico")
        ]
      }
    ]
  }
];

export function getAllItems() {
  return OPCRIT_SECTIONS.flatMap(section =>
    section.groups.flatMap(group =>
      group.items.map(itemDef => ({ ...itemDef, sectionId: section.id, groupId: group.id }))
    )
  );
}

export const ALL_ITEMS = getAllItems();
export const ALL_ITEM_IDS = ALL_ITEMS.map(itemDef => itemDef.id);

export function getItemLabel(id) {
  return ALL_ITEMS.find(itemDef => itemDef.id === id)?.label || id;
}

export function isAnswered(value) {
  return value !== undefined && value !== null && value !== "";
}

export { yesNoUnknown };
