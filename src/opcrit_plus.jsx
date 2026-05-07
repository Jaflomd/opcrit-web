import { useMemo, useState } from "react";
import { ALL_ITEMS, ALL_ITEM_IDS, OPCRIT_SECTIONS, getItemLabel, isAnswered } from "./opcritSchema";
import { runDiagnostics } from "./diagnostics";

const STORAGE_KEY = "opcrit_plus_table1_cases_v1";

function computeValue(item, responses) {
  if (item.compute === "packYears") {
    const cigarettes = Number(responses.tobacco_avg_cigarettes_day) || 0;
    const years = Number(responses.tobacco_years_smoking) || 0;
    return cigarettes && years ? Number(((cigarettes / 20) * years).toFixed(1)) : "";
  }
  return "";
}

function valueForExport(item, responses) {
  const value = item.type === "computed" ? computeValue(item, responses) : responses[item.id];
  if (value === true) return "Si";
  if (value === false) return "No";
  if (value === "unk") return "Desconocido";
  return value ?? "";
}

function visibleSections(query) {
  const q = query.trim().toLowerCase();
  if (!q) return OPCRIT_SECTIONS;
  return OPCRIT_SECTIONS.map(section => {
    const sectionMatch = `${section.title} ${section.short}`.toLowerCase().includes(q);
    const groups = section.groups.map(group => {
      const groupMatch = group.title.toLowerCase().includes(q);
      const items = group.items.filter(item =>
        sectionMatch || groupMatch || item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
      );
      return { ...group, items };
    }).filter(group => group.items.length > 0);
    return { ...section, groups };
  }).filter(section => section.groups.length > 0);
}

function sectionStats(section, responses) {
  const items = section.groups.flatMap(group => group.items).filter(item => item.type !== "computed");
  const answered = items.filter(item => isAnswered(responses[item.id])).length;
  return { answered, total: items.length, pct: items.length ? Math.round((answered / items.length) * 100) : 0 };
}

function overallStats(responses) {
  const items = ALL_ITEMS.filter(item => item.type !== "computed");
  const answered = items.filter(item => isAnswered(responses[item.id])).length;
  return { answered, total: items.length, pct: items.length ? Math.round((answered / items.length) * 100) : 0 };
}

function flattenDiagnosisText(diagnostics) {
  return diagnostics.map(dx => `${dx.code}: ${dx.name} (${dx.confidence})`).join(" | ");
}

function DiagnosticCard({ dx }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-xs font-bold text-slate-500">{dx.code}</div>
          <div className="mt-1 font-semibold text-slate-800">{dx.name}</div>
          <div className="mt-1 text-xs text-slate-400">{dx.system}</div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${dx.confidence === "probable" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {dx.confidence}
        </span>
      </div>
      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <div className="mb-1 font-semibold text-emerald-700">Criterios presentes</div>
          <ul className="list-disc space-y-1 pl-4 text-slate-600">
            {(dx.matchedCriteria?.length ? dx.matchedCriteria : ["No especificados"]).map((criterion, index) => (
              <li key={index}>{criterion}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-1 font-semibold text-amber-700">Pendiente/limitaciones</div>
          <ul className="list-disc space-y-1 pl-4 text-slate-600">
            {(dx.missingCriteria?.length ? dx.missingCriteria : ["Sin faltantes criticos documentados"]).map((criterion, index) => (
              <li key={index}>{criterion}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({ item, value, onChange, responses }) {
  const base = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";

  if (item.type === "computed") {
    return (
      <div className="inline-flex min-w-28 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500">
        {computeValue(item, responses) || "Pendiente"}
      </div>
    );
  }

  if (item.type === "bool3") {
    const choices = [
      ["Si", true],
      ["No", false],
      ["Desconocido", "unk"]
    ];
    return (
      <div className="flex flex-wrap gap-2">
        {choices.map(([label, option]) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(value === option ? undefined : option)}
            className={`min-h-9 rounded-lg border px-3 py-1.5 text-sm transition ${
              value === option
                ? "border-indigo-500 bg-indigo-50 font-semibold text-indigo-700"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  if (item.type === "select") {
    return (
      <select value={value || ""} onChange={event => onChange(event.target.value || undefined)} className={`${base} w-full max-w-md`}>
        <option value="">Seleccionar...</option>
        {item.opts.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    );
  }

  if (item.type === "number") {
    return (
      <input
        type="number"
        min={item.min}
        max={item.max}
        value={value ?? ""}
        onChange={event => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
        className={`${base} w-32`}
      />
    );
  }

  return (
    <textarea
      value={value || ""}
      onChange={event => onChange(event.target.value || undefined)}
      className={`${base} min-h-20 w-full`}
      placeholder="Registrar fuente, periodo o matiz clinico..."
    />
  );
}

export default function OPCRITApp() {
  const [view, setView] = useState("cases");
  const [cases, setCases] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [responses, setResponses] = useState({});
  const [activeSectionId, setActiveSectionId] = useState(OPCRIT_SECTIONS[0].id);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [current, setCurrent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const sections = useMemo(() => visibleSections(search), [search]);
  const activeSection = sections.find(section => section.id === activeSectionId) || sections[0] || OPCRIT_SECTIONS[0];
  const stats = overallStats(responses);
  const diagnostics = useMemo(() => runDiagnostics(responses), [responses]);

  function persist(nextCases) {
    setCases(nextCases);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCases));
  }

  function updateField(id, value) {
    setResponses(prev => {
      const next = { ...prev };
      if (value === undefined || value === null || value === "") delete next[id];
      else next[id] = value;
      return next;
    });
  }

  function startNew() {
    setResponses({});
    setCurrent(null);
    setEditId(null);
    setActiveSectionId(OPCRIT_SECTIONS[0].id);
    setSearch("");
    setView("form");
  }

  function startEdit(caseRecord) {
    setResponses({ ...caseRecord.responses });
    setCurrent(null);
    setEditId(caseRecord.id);
    setActiveSectionId(OPCRIT_SECTIONS[0].id);
    setSearch("");
    setView("form");
  }

  function saveCase() {
    const now = new Date().toISOString();
    const caseRecord = {
      id: editId || String(Date.now()),
      createdAt: editId ? cases.find(item => item.id === editId)?.createdAt || now : now,
      updatedAt: now,
      responses,
      diagnostics
    };
    const nextCases = editId ? cases.map(item => item.id === editId ? caseRecord : item) : [...cases, caseRecord];
    persist(nextCases);
    setCurrent(caseRecord);
    setView("results");
  }

  function deleteCase() {
    persist(cases.filter(item => item.id !== deleteId));
    setDeleteId(null);
  }

  function exportCSV() {
    const header = [
      "caso_id",
      "fecha_creacion",
      "fecha_actualizacion",
      ...ALL_ITEM_IDS,
      "diagnosticos"
    ];
    const rows = cases.map(caseRecord => [
      caseRecord.id,
      caseRecord.createdAt,
      caseRecord.updatedAt,
      ...ALL_ITEMS.map(item => valueForExport(item, caseRecord.responses)),
      flattenDiagnosisText(caseRecord.diagnostics || [])
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `OPCRIT_Table1_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  if (view === "cases") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-4 px-5 py-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">OPCRIT+ Web</h1>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">Table 1 + Table 2</span>
              </div>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                Captura completa segun la tabla OPCRIT+ y diagnosticos por reglas transparentes aproximadas.
              </p>
            </div>
            <div className="flex gap-2">
              {cases.length > 0 && (
                <button type="button" onClick={exportCSV} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Exportar CSV ({cases.length})
                </button>
              )}
              <button type="button" onClick={startNew} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Nueva evaluacion
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-6">
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Las reglas diagnosticas son transparentes y aproximadas; no equivalen al algoritmo propietario OPCRIT+ original.
          </div>

          {cases.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <p className="text-sm text-slate-500">No hay evaluaciones guardadas.</p>
              <button type="button" onClick={startNew} className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Comenzar primera evaluacion
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Caso</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Diagnosticos</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map(caseRecord => {
                    const dx = caseRecord.diagnostics || [];
                    return (
                      <tr key={caseRecord.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">#{caseRecord.id.slice(-6)}</td>
                        <td className="px-4 py-3 text-slate-600">{new Date(caseRecord.createdAt).toLocaleDateString("es-PE")}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {caseRecord.responses.gender || "Genero no registrado"} · {caseRecord.responses.age ? `${caseRecord.responses.age} anos` : "edad no registrada"}
                        </td>
                        <td className="px-4 py-3">
                          {dx.length ? (
                            <div className="flex flex-wrap gap-1">
                              {dx.slice(0, 4).map((itemDx, index) => (
                                <span key={`${itemDx.code}-${index}`} className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  {itemDx.name}
                                </span>
                              ))}
                              {dx.length > 4 && <span className="text-xs text-slate-400">+{dx.length - 4}</span>}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">Sin criterios</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-3 text-xs">
                            <button type="button" onClick={() => { setCurrent(caseRecord); setView("results"); }} className="font-semibold text-indigo-600 hover:underline">Ver</button>
                            <button type="button" onClick={() => startEdit(caseRecord)} className="text-slate-500 hover:underline">Editar</button>
                            <button type="button" onClick={() => setDeleteId(caseRecord.id)} className="text-red-500 hover:underline">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
              <h2 className="font-semibold">Eliminar evaluacion</h2>
              <p className="mt-2 text-sm text-slate-500">Esta accion no se puede deshacer.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setDeleteId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancelar</button>
                <button type="button" onClick={deleteCase} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === "form") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setView("cases")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
                Volver
              </button>
              <div>
                <div className="font-semibold">{editId ? "Editar evaluacion" : "Nueva evaluacion OPCRIT+"}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <div className="h-1.5 w-36 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${stats.pct}%` }} />
                  </div>
                  {stats.answered}/{stats.total} items
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar item o seccion..."
                className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button type="button" onClick={saveCase} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                Guardar y diagnosticar
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Secciones</div>
              <div className="space-y-1">
                {sections.map(section => {
                  const sectionStat = sectionStats(OPCRIT_SECTIONS.find(item => item.id === section.id) || section, responses);
                  const active = section.id === activeSection.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSectionId(section.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{section.short}</span>
                        <span className={`shrink-0 font-mono text-xs ${active ? "text-indigo-100" : "text-slate-400"}`}>
                          {sectionStat.answered}/{sectionStat.total}
                        </span>
                      </div>
                      <div className={`mt-1 h-1 overflow-hidden rounded-full ${active ? "bg-indigo-500" : "bg-slate-100"}`}>
                        <div className={`h-full rounded-full ${active ? "bg-white" : "bg-indigo-500"}`} style={{ width: `${sectionStat.pct}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main>
            {activeSection ? (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: activeSection.color }}>{activeSection.short}</div>
                  <h2 className="mt-1 text-2xl font-bold text-slate-800">{activeSection.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeSection.groups.flatMap(group => group.items).length} items visibles en esta vista.
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {activeSection.groups.map(group => (
                    <section key={group.id} className="px-6 py-5">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">{group.title}</h3>
                      <div className="space-y-4">
                        {group.items.map(item => (
                          <div key={item.id} className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-4 md:grid-cols-[minmax(0,1fr)_minmax(260px,auto)]">
                            <label className="text-sm font-medium leading-6 text-slate-700">
                              {item.label}
                              <span className="ml-2 font-mono text-[11px] text-slate-300">{item.id}</span>
                            </label>
                            <Field
                              item={item}
                              value={responses[item.id]}
                              responses={responses}
                              onChange={value => updateField(item.id, value)}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No hay items que coincidan con la busqueda.
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  if (view === "results" && current) {
    const responseStats = overallStats(current.responses);
    const currentDiagnostics = current.diagnostics || [];
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setView("cases")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
                Casos
              </button>
              <div>
                <h1 className="font-bold text-slate-800">Resultados diagnosticos</h1>
                <p className="text-xs text-slate-400">#{current.id.slice(-6)} · {new Date(current.createdAt).toLocaleDateString("es-PE")}</p>
              </div>
            </div>
            <button type="button" onClick={() => startEdit(current)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Editar evaluacion
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-5 px-5 py-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-400">Genero</div>
              <div className="mt-1 font-semibold">{current.responses.gender || "No registrado"}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-400">Edad</div>
              <div className="mt-1 font-semibold">{current.responses.age ? `${current.responses.age} anos` : "No registrada"}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-400">Items completados</div>
              <div className="mt-1 font-semibold">{responseStats.answered}/{responseStats.total}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-400">Diagnosticos</div>
              <div className="mt-1 font-semibold">{currentDiagnostics.length}</div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Las reglas diagnosticas son transparentes y aproximadas; no equivalen al algoritmo propietario OPCRIT+ original.
          </div>

          {currentDiagnostics.length ? (
            <div className="grid gap-4">
              {currentDiagnostics.map((dx, index) => <DiagnosticCard key={`${dx.code}-${index}`} dx={dx} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No se cumplen criterios diagnosticos con los datos ingresados.
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold">Respuestas registradas</h2>
            <div className="grid gap-2 text-xs md:grid-cols-2">
              {ALL_ITEMS.filter(item => valueForExport(item, current.responses) !== "").map(item => (
                <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="font-medium text-slate-600">{getItemLabel(item.id)}</div>
                  <div className="mt-1 text-slate-500">{valueForExport(item, current.responses)}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
