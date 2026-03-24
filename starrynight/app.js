const STORAGE_KEY = "starrynight-planner-state-v1";
const TAU = Math.PI * 2;

const canvas = document.getElementById("sky-canvas");
const ctx = canvas.getContext("2d");

const controls = {
  datetime: document.getElementById("datetime-input"),
  latitude: document.getElementById("latitude-input"),
  longitude: document.getElementById("longitude-input"),
  bortle: document.getElementById("bortle-input"),
  clouds: document.getElementById("cloud-input"),
  zoom: document.getElementById("zoom-input"),
  focus: document.getElementById("focus-input"),
  labels: document.getElementById("labels-toggle"),
  lines: document.getElementById("lines-toggle")
};

const outputs = {
  datetime: document.getElementById("datetime-readout"),
  latitude: document.getElementById("latitude-readout"),
  longitude: document.getElementById("longitude-readout"),
  bortle: document.getElementById("bortle-readout"),
  clouds: document.getElementById("cloud-readout"),
  zoom: document.getElementById("zoom-readout"),
  moonPhase: document.getElementById("moon-phase-value"),
  moonNote: document.getElementById("moon-phase-note"),
  skyQuality: document.getElementById("sky-quality-value"),
  skyNote: document.getElementById("sky-quality-note"),
  visibleCount: document.getElementById("visible-count-value"),
  visibleNote: document.getElementById("visible-count-note"),
  bestTarget: document.getElementById("best-target-value"),
  bestWindow: document.getElementById("best-window-value"),
  skyClass: document.getElementById("sky-class-value"),
  limitingMag: document.getElementById("limiting-mag-value"),
  twilight: document.getElementById("twilight-value"),
  selectedName: document.getElementById("selected-target-name"),
  selectedNote: document.getElementById("selected-target-note"),
  selectedKind: document.getElementById("selected-target-kind"),
  selectedMag: document.getElementById("selected-target-mag"),
  selectedAlt: document.getElementById("selected-target-alt"),
  selectedScore: document.getElementById("selected-target-score"),
  skyCaption: document.getElementById("sky-caption"),
  recommendationList: document.getElementById("recommendation-list")
};

const buttons = {
  now: document.getElementById("now-btn"),
  random: document.getElementById("random-btn"),
  reset: document.getElementById("reset-btn")
};

const presetButtons = Array.from(document.querySelectorAll("[data-preset]"));

const DEFAULT_STATE = {
  dateTime: new Date(),
  latitude: 29.7604,
  longitude: -95.3698,
  bortle: 4,
  clouds: 14,
  zoom: 1.05,
  focus: "auto",
  labels: true,
  lines: true,
  targetId: "auto"
};

const brightTargets = [
  {
    id: "polaris",
    name: "Polaris",
    kind: "bright star",
    raHours: 2.53,
    decDeg: 89.3,
    mag: 1.97,
    color: "#fff1c1",
    note: "Anchors the northern end of the chart and stays useful even when the sky is bright."
  },
  {
    id: "vega",
    name: "Vega",
    kind: "bright star",
    raHours: 18.62,
    decDeg: 38.8,
    mag: 0.03,
    color: "#cfeaff",
    note: "A clean high-altitude marker for summer skies."
  },
  {
    id: "deneb",
    name: "Deneb",
    kind: "bright star",
    raHours: 20.69,
    decDeg: 45.3,
    mag: 1.25,
    color: "#dfe9ff",
    note: "One of the brightest anchors in the Summer Triangle."
  },
  {
    id: "altair",
    name: "Altair",
    kind: "bright star",
    raHours: 19.85,
    decDeg: 8.9,
    mag: 0.77,
    color: "#fff2c9",
    note: "Low and easy to spot when the southern horizon is clear."
  },
  {
    id: "sirius",
    name: "Sirius",
    kind: "bright star",
    raHours: 6.75,
    decDeg: -16.7,
    mag: -1.46,
    color: "#e9f3ff",
    note: "The brightest star in the night sky and an obvious bright-sky fallback."
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    kind: "bright star",
    raHours: 5.92,
    decDeg: 7.4,
    mag: 0.45,
    color: "#ffccaa",
    note: "A warm red giant that makes Orion easy to frame."
  },
  {
    id: "rigel",
    name: "Rigel",
    kind: "bright star",
    raHours: 5.24,
    decDeg: -8.2,
    mag: 0.18,
    color: "#c9e2ff",
    note: "Bright, blue, and a good bright-target benchmark."
  },
  {
    id: "aldebaran",
    name: "Aldebaran",
    kind: "bright star",
    raHours: 4.6,
    decDeg: 16.5,
    mag: 0.86,
    color: "#ffceb2",
    note: "A reddish guide star in the Taurus area of the chart."
  },
  {
    id: "capella",
    name: "Capella",
    kind: "bright star",
    raHours: 5.28,
    decDeg: 46.0,
    mag: 0.08,
    color: "#fff6cf",
    note: "High, bright, and friendly to light-polluted skies."
  },
  {
    id: "procyon",
    name: "Procyon",
    kind: "bright star",
    raHours: 7.66,
    decDeg: 5.2,
    mag: 0.34,
    color: "#f2f8ff",
    note: "A useful bright star when you want a quick alignment."
  },
  {
    id: "regulus",
    name: "Regulus",
    kind: "bright star",
    raHours: 10.14,
    decDeg: 12.0,
    mag: 1.35,
    color: "#fff2d1",
    note: "A compact target that sits well in wider fields of view."
  },
  {
    id: "spica",
    name: "Spica",
    kind: "bright star",
    raHours: 13.42,
    decDeg: -11.1,
    mag: 0.97,
    color: "#cfe5ff",
    note: "Bright enough to survive mild haze and moonlight."
  },
  {
    id: "antares",
    name: "Antares",
    kind: "bright star",
    raHours: 16.49,
    decDeg: -26.4,
    mag: 1.06,
    color: "#ffb08a",
    note: "A deep red star that stands out on the southern arc."
  },
  {
    id: "fomalhaut",
    name: "Fomalhaut",
    kind: "bright star",
    raHours: 22.96,
    decDeg: -29.6,
    mag: 1.16,
    color: "#dcecff",
    note: "Low and solitary, which makes it easy to isolate in the chart."
  },
  {
    id: "dubhe",
    name: "Dubhe",
    kind: "bright star",
    raHours: 11.06,
    decDeg: 61.8,
    mag: 1.79,
    color: "#fff2c8",
    note: "A bright pointer in the Big Dipper pattern."
  },
  {
    id: "merak",
    name: "Merak",
    kind: "bright star",
    raHours: 11.02,
    decDeg: 56.4,
    mag: 2.37,
    color: "#f4f7ff",
    note: "Pairs with Dubhe to make the northern pointer line easy to read."
  },
  {
    id: "phecda",
    name: "Phecda",
    kind: "bright star",
    raHours: 11.91,
    decDeg: 53.7,
    mag: 2.43,
    color: "#d9e5ff",
    note: "A bright dipper star that fills out the bowl of the pattern."
  },
  {
    id: "megrez",
    name: "Megrez",
    kind: "bright star",
    raHours: 12.25,
    decDeg: 57.0,
    mag: 3.32,
    color: "#d7e4ff",
    note: "The bridge between the bowl and handle of the Big Dipper."
  },
  {
    id: "alioth",
    name: "Alioth",
    kind: "bright star",
    raHours: 12.9,
    decDeg: 56.0,
    mag: 1.76,
    color: "#e9f1ff",
    note: "One of the easiest stars to pick out in the upper northern sky."
  },
  {
    id: "mizar",
    name: "Mizar",
    kind: "bright star",
    raHours: 13.4,
    decDeg: 54.9,
    mag: 2.06,
    color: "#f0f5ff",
    note: "A convenient target for binocular alignment and visual calibration."
  },
  {
    id: "alkaid",
    name: "Alkaid",
    kind: "bright star",
    raHours: 13.8,
    decDeg: 49.3,
    mag: 1.85,
    color: "#fff0d5",
    note: "The tail star that closes the Big Dipper line."
  },
  {
    id: "bellatrix",
    name: "Bellatrix",
    kind: "bright star",
    raHours: 5.42,
    decDeg: 6.3,
    mag: 1.64,
    color: "#dfeaff",
    note: "A blue-white star that helps frame Orion's shoulder."
  },
  {
    id: "alnitak",
    name: "Alnitak",
    kind: "bright star",
    raHours: 5.68,
    decDeg: -1.9,
    mag: 1.74,
    color: "#fff0cf",
    note: "The eastern belt star in Orion."
  },
  {
    id: "alnilam",
    name: "Alnilam",
    kind: "bright star",
    raHours: 5.6,
    decDeg: -1.2,
    mag: 1.69,
    color: "#dbe9ff",
    note: "The central belt star that keeps Orion balanced."
  },
  {
    id: "mintaka",
    name: "Mintaka",
    kind: "bright star",
    raHours: 5.53,
    decDeg: -0.3,
    mag: 2.25,
    color: "#e6f0ff",
    note: "The western belt star in the Orion line."
  },
  {
    id: "shaula",
    name: "Shaula",
    kind: "bright star",
    raHours: 17.56,
    decDeg: -37.1,
    mag: 1.62,
    color: "#fbd2bf",
    note: "A sharp southern marker for the Scorpius arc."
  },
  {
    id: "castor",
    name: "Castor",
    kind: "bright star",
    raHours: 7.58,
    decDeg: 31.9,
    mag: 1.93,
    color: "#dce7ff",
    note: "A Gemini anchor that works well in moderately bright skies."
  },
  {
    id: "pollux",
    name: "Pollux",
    kind: "bright star",
    raHours: 7.75,
    decDeg: 28.0,
    mag: 1.14,
    color: "#fff3d0",
    note: "The brighter Gemini twin in the chart."
  }
];

const deepSkyTargets = [
  {
    id: "andromeda",
    name: "Andromeda Galaxy",
    kind: "galaxy",
    raHours: 0.71,
    decDeg: 41.3,
    mag: 3.44,
    color: "#d8e4ff",
    note: "A classic dark-sky target that fades quickly as sky glow rises."
  },
  {
    id: "pleiades",
    name: "Pleiades",
    kind: "cluster",
    raHours: 3.79,
    decDeg: 24.1,
    mag: 1.6,
    color: "#d7efff",
    note: "A broad open cluster that remains rewarding in wider fields."
  },
  {
    id: "double-cluster",
    name: "Double Cluster",
    kind: "cluster",
    raHours: 2.35,
    decDeg: 57.1,
    mag: 3.7,
    color: "#d1e6ff",
    note: "Best when the sky is reasonably dark and the view is wide."
  },
  {
    id: "orion-nebula",
    name: "Orion Nebula",
    kind: "nebula",
    raHours: 5.59,
    decDeg: -5.4,
    mag: 4.0,
    color: "#f9d7ff",
    note: "A nebula that loves clean transparency and low glare."
  },
  {
    id: "beehive",
    name: "Beehive Cluster",
    kind: "cluster",
    raHours: 8.67,
    decDeg: 19.7,
    mag: 3.7,
    color: "#d7ebff",
    note: "A wide open cluster that sits nicely in binocular fields."
  },
  {
    id: "hercules-cluster",
    name: "Hercules Cluster",
    kind: "cluster",
    raHours: 16.67,
    decDeg: 36.5,
    mag: 5.8,
    color: "#d2ddff",
    note: "Needs a darker site and benefits from a little patience."
  },
  {
    id: "ring-nebula",
    name: "Ring Nebula",
    kind: "nebula",
    raHours: 18.89,
    decDeg: 33.0,
    mag: 8.8,
    color: "#f3c9ff",
    note: "Very sensitive to moonlight and light pollution."
  },
  {
    id: "lagoon-nebula",
    name: "Lagoon Nebula",
    kind: "nebula",
    raHours: 18.05,
    decDeg: -24.4,
    mag: 6.0,
    color: "#f5d1ff",
    note: "A southern nebula target that only really breathes under dark skies."
  }
];

const catalog = [...brightTargets, ...deepSkyTargets];
const targetById = new Map(catalog.map((target) => [target.id, target]));
const backgroundStars = buildBackgroundStars(180);
const constellationGroups = [
  {
    name: "Orion",
    members: ["betelgeuse", "bellatrix", "alnitak", "alnilam", "mintaka", "rigel"]
  },
  {
    name: "Summer Triangle",
    members: ["vega", "deneb", "altair"]
  },
  {
    name: "Big Dipper",
    members: ["dubhe", "merak", "phecda", "megrez", "alioth", "mizar", "alkaid"]
  },
  {
    name: "Winter Hexagon",
    members: ["capella", "pollux", "procyon", "sirius", "rigel", "aldebaran"]
  },
  {
    name: "Scorpio arc",
    members: ["antares", "shaula"]
  }
];

const focusWeights = {
  auto: { star: 0, cluster: 0, galaxy: 0, nebula: 0 },
  "wide-field": { star: 11, cluster: 8, galaxy: 5, nebula: 5 },
  bright: { star: 16, cluster: 7, galaxy: -5, nebula: -8 },
  "deep-sky": { star: -8, cluster: 11, galaxy: 18, nebula: 18 },
  planetary: { star: 8, cluster: 1, galaxy: -10, nebula: -10 }
};

let state = loadState();
let viewport = { width: 0, height: 0, dpr: 1 };

initialize();

function initialize() {
  bindControls();
  syncControlsFromState();
  render();

  buttons.now.addEventListener("click", () => {
    updateState({ dateTime: new Date(), targetId: "auto" });
  });

  buttons.random.addEventListener("click", () => {
    const now = Date.now();
    const offsetDays = Math.floor(Math.random() * 730) - 365;
    const randomDate = new Date(now + offsetDays * 86400000);

    updateState({
      dateTime: randomDate,
      latitude: randomRange(-50, 68),
      longitude: randomRange(-170, 170),
      bortle: randomInt(1, 9),
      clouds: randomInt(0, 82),
      zoom: randomRange(0.85, 1.5),
      focus: randomChoice(["auto", "wide-field", "bright", "deep-sky", "planetary"]),
      labels: Math.random() > 0.3,
      lines: Math.random() > 0.2,
      targetId: "auto"
    });
  });

  buttons.reset.addEventListener("click", () => {
    updateState({ ...DEFAULT_STATE, dateTime: new Date(), targetId: "auto" });
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const preset = button.dataset.preset;

      if (preset === "urban") {
        updateState({
          bortle: 8,
          clouds: 20,
          zoom: 1.02,
          focus: "bright",
          labels: true,
          lines: false,
          targetId: "auto"
        });
      } else if (preset === "suburban") {
        updateState({
          bortle: 5,
          clouds: 12,
          zoom: 1.08,
          focus: "wide-field",
          labels: true,
          lines: true,
          targetId: "auto"
        });
      } else if (preset === "dark") {
        updateState({
          bortle: 2,
          clouds: 4,
          zoom: 1.18,
          focus: "deep-sky",
          labels: true,
          lines: true,
          targetId: "auto"
        });
      } else if (preset === "moonlit") {
        updateState({
          bortle: 4,
          clouds: 5,
          zoom: 1.0,
          focus: "bright",
          labels: true,
          lines: false,
          targetId: "auto"
        });
      }
    });
  });

  canvas.addEventListener("pointerdown", handleCanvasPick);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(() => render());
    observer.observe(canvas.parentElement);
  } else {
    window.addEventListener("resize", render);
  }
}

function bindControls() {
  controls.datetime.addEventListener("change", () => {
    updateState({ dateTime: parseLocalDate(controls.datetime.value) });
  });

  controls.latitude.addEventListener("input", () => {
    updateState({ latitude: Number(controls.latitude.value) });
  });

  controls.longitude.addEventListener("input", () => {
    updateState({ longitude: Number(controls.longitude.value) });
  });

  controls.bortle.addEventListener("input", () => {
    updateState({ bortle: Number(controls.bortle.value) });
  });

  controls.clouds.addEventListener("input", () => {
    updateState({ clouds: Number(controls.clouds.value) });
  });

  controls.zoom.addEventListener("input", () => {
    updateState({ zoom: Number(controls.zoom.value) });
  });

  controls.focus.addEventListener("change", () => {
    updateState({ focus: controls.focus.value, targetId: "auto" });
  });

  controls.labels.addEventListener("change", () => {
    updateState({ labels: controls.labels.checked });
  });

  controls.lines.addEventListener("change", () => {
    updateState({ lines: controls.lines.checked });
  });
}

function updateState(patch) {
  state = {
    ...state,
    ...patch
  };

  saveState();
  syncControlsFromState();
  render();
}

function loadState() {
  const fallback = {
    ...DEFAULT_STATE,
    dateTime: new Date(DEFAULT_STATE.dateTime.getTime())
  };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...parsed,
      dateTime: parsed.dateTime ? new Date(parsed.dateTime) : fallback.dateTime
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        dateTime: state.dateTime.toISOString()
      })
    );
  } catch {
    // Ignore storage failures and keep the planner usable.
  }
}

function syncControlsFromState() {
  controls.datetime.value = toLocalDateInputValue(state.dateTime);
  controls.latitude.value = String(state.latitude);
  controls.longitude.value = String(state.longitude);
  controls.bortle.value = String(state.bortle);
  controls.clouds.value = String(state.clouds);
  controls.zoom.value = String(state.zoom);
  controls.focus.value = state.focus;
  controls.labels.checked = Boolean(state.labels);
  controls.lines.checked = Boolean(state.lines);

  setRangeProgress(controls.latitude);
  setRangeProgress(controls.longitude);
  setRangeProgress(controls.bortle);
  setRangeProgress(controls.clouds);
  setRangeProgress(controls.zoom);

  outputs.datetime.textContent = formatDateTimeShort(state.dateTime);
  outputs.latitude.textContent = `${state.latitude.toFixed(1)}°`;
  outputs.longitude.textContent = `${state.longitude.toFixed(1)}°`;
  outputs.bortle.textContent = `Class ${state.bortle}`;
  outputs.clouds.textContent = `${state.clouds}%`;
  outputs.zoom.textContent = `${state.zoom.toFixed(2)}x`;
}

function render() {
  const moon = computeMoon(state.dateTime);
  const sky = computeSky(state, moon);
  const recommendations = scoreTargets(state, sky, moon);
  const selected = resolveSelectedTarget(state, recommendations, sky, moon);

  syncSummaryOutputs(state, sky, moon, recommendations, selected);
  renderRecommendationList(recommendations, selected);
  drawSkyChart(state, sky, moon, recommendations, selected);
}

function syncSummaryOutputs(currentState, sky, moon, recommendations, selected) {
  outputs.moonPhase.textContent = `${moon.phaseName} ${Math.round(moon.illumination * 100)}%`;
  outputs.moonNote.textContent = `${moon.phrase}. ${sky.darknessLabel} conditions are ${sky.skyClass.toLowerCase()}.`;

  outputs.skyQuality.textContent = `${Math.round(sky.quality)} / 100`;
  outputs.skyNote.textContent = `${sky.skyClass} sky with an estimated limiting magnitude of ${sky.limitingMagnitude.toFixed(1)}.`;

  const visibleObjects = sky.visibleBackgroundStars + recommendations.filter((item) => item.score >= 45).length;
  outputs.visibleCount.textContent = `${visibleObjects}`;
  outputs.visibleNote.textContent = `${sky.visibleBackgroundStars} chart stars and ${recommendations.length} tracked targets are being evaluated.`;

  outputs.bestTarget.textContent = selected.name;
  outputs.bestWindow.textContent = `Best window: ${sky.bestWindow}`;

  outputs.skyClass.textContent = sky.skyClass;
  outputs.limitingMag.textContent = `${sky.limitingMagnitude.toFixed(1)} mag`;
  outputs.twilight.textContent = sky.bestWindow;

  outputs.selectedName.textContent = selected.name;
  outputs.selectedNote.textContent =
    currentState.targetId === "auto"
      ? "Auto-selected from the highest scoring targets for the current sky."
      : selected.note;
  outputs.selectedKind.textContent = humanizeKind(selected.kind);
  outputs.selectedMag.textContent = `${selected.mag.toFixed(1)}`;
  outputs.selectedAlt.textContent = `${Math.round(selected.altitude)}°`;
  outputs.selectedScore.textContent = `${Math.round(selected.score)} / 100`;

  outputs.skyCaption.textContent = `${sky.skyClass} conditions, ${recommendations.length} usable targets, ${moon.phaseName.toLowerCase()} moon.`;
}

function renderRecommendationList(recommendations, selected) {
  outputs.recommendationList.replaceChildren();

  recommendations.slice(0, 6).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recommendation-item";
    if (item.id === selected.id) {
      button.classList.add("is-active");
    }
    button.dataset.targetId = item.id;
    button.setAttribute("role", "listitem");

    button.innerHTML = `
      <strong>${item.name}</strong>
      <small>${humanizeKind(item.kind)} · ${Math.round(item.score)} / 100 · ${item.comment}</small>
    `;

    button.addEventListener("click", () => {
      updateState({ targetId: item.id });
    });

    outputs.recommendationList.appendChild(button);
  });
}

function resolveSelectedTarget(currentState, recommendations, sky, moon) {
  if (currentState.targetId !== "auto") {
    const pinned = recommendations.find((item) => item.id === currentState.targetId) || targetById.get(currentState.targetId);
    if (pinned && typeof pinned.score === "number") {
      return pinned;
    }

    if (pinned) {
      return enrichTarget(pinned, currentState, sky, moon);
    }
  }

  if (recommendations[0]) {
    return recommendations[0];
  }

  return enrichTarget(catalog[0], currentState, sky, moon);
}

function scoreTargets(currentState, sky, moon) {
  const enriched = catalog.map((target) => enrichTarget(target, currentState, sky, moon));

  enriched.sort((a, b) => b.score - a.score);
  return enriched;
}

function enrichTarget(target, currentState, sky, moon) {
  const projection = projectTarget(target, currentState);
  const category = targetCategory(target);
  const focusBonus = focusWeights[currentState.focus]?.[category] || 0;
  const altitudeScore = projection.altitude * 0.36;
  const moonPenalty = moon.illumination * (category === "star" ? 6 : category === "cluster" ? 20 : 34);
  const cloudPenalty = currentState.clouds * (category === "star" ? 0.05 : 0.18);
  const bortlePenalty = (currentState.bortle - 1) * (category === "star" ? 0.85 : category === "cluster" ? 2.2 : 3.2);
  const magnitudePenalty = Math.max(0, target.mag) * (category === "star" ? 2.8 : category === "cluster" ? 3.2 : 4.2);
  const base = category === "star" ? 70 : category === "cluster" ? 60 : 52;
  const score = clamp(
    base + altitudeScore + focusBonus - moonPenalty - cloudPenalty - bortlePenalty - magnitudePenalty,
    0,
    100
  );

  return {
    ...target,
    ...projection,
    score,
    comment: suitabilityComment(score, category, sky)
  };
}

function suitabilityComment(score, category, sky) {
  if (score >= 85) {
    return category === "star" ? "Excellent alignment target." : "Excellent observing target.";
  }

  if (score >= 70) {
    return category === "star" ? "Bright and easy to center." : "Strong candidate for this sky.";
  }

  if (score >= 50) {
    return sky.quality >= 50 ? "Usable with a steady view." : "Needs a patient eye and clear air.";
  }

  return "Only worth it if the sky improves.";
}

function projectTarget(target, currentState) {
  const rotation = siderealAngle(currentState.dateTime, currentState.longitude);
  const ra = (target.raHours / 24) * TAU;
  const hourAngle = normalizeAngle(ra - rotation);
  const clippedLatitude = clamp(currentState.latitude, -70, 70);
  const adjustedDec = clamp(target.decDeg + clippedLatitude * 0.18, -89, 89);
  const normalizedRadius = (90 - adjustedDec) / 180;

  const rect = canvasRect();
  const baseRadius = Math.min(rect.width, rect.height) * (0.36 / currentState.zoom);
  const radius = normalizedRadius * baseRadius;

  return {
    x: rect.width / 2 + Math.sin(hourAngle) * radius,
    y: rect.height / 2 - Math.cos(hourAngle) * radius * 0.82,
    altitude: clamp(90 - Math.abs(currentState.latitude - target.decDeg), 0, 90)
  };
}

function drawSkyChart(currentState, sky, moon, recommendations, selected) {
  const rect = resizeCanvas();
  if (!rect.width || !rect.height) {
    return;
  }

  ctx.clearRect(0, 0, rect.width, rect.height);

  const background = ctx.createLinearGradient(0, 0, 0, rect.height);
  background.addColorStop(0, "#040713");
  background.addColorStop(0.55, "#07111f");
  background.addColorStop(1, "#05070f");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, rect.width, rect.height);

  const haze = ctx.createRadialGradient(
    rect.width * 0.5,
    rect.height * 0.38,
    rect.height * 0.1,
    rect.width * 0.5,
    rect.height * 0.38,
    rect.height * 0.95
  );
  haze.addColorStop(0, `rgba(139, 240, 255, ${0.08 + sky.quality / 600})`);
  haze.addColorStop(0.45, `rgba(210, 195, 255, ${0.04 + moon.illumination * 0.08})`);
  haze.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, rect.width, rect.height);

  drawConcentricRings(rect, sky);
  drawBackgroundStars(rect, sky, currentState);

  if (currentState.lines) {
    drawConstellations(currentState);
  }

  drawNamedTargets(currentState, sky, recommendations, selected);
  drawSelectionHalo(selected, sky);
  drawCompassLabels(rect, currentState);
}

function drawConcentricRings(rect, sky) {
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const maxRadius = Math.min(rect.width, rect.height) * 0.38;

  ctx.save();
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 + sky.quality / 900})`;
  ctx.lineWidth = 1;

  for (let index = 1; index <= 4; index += 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, (maxRadius / 4) * index, 0, TAU);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.ellipse(cx, cy + maxRadius * 0.74, maxRadius * 1.2, maxRadius * 0.26, 0, 0, TAU);
  ctx.strokeStyle = `rgba(139, 240, 255, ${0.08 + sky.quality / 850})`;
  ctx.stroke();
  ctx.restore();
}

function drawBackgroundStars(rect, sky, currentState) {
  const visibleLimit = sky.limitingMagnitude;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const rotation = siderealAngle(currentState.dateTime, currentState.longitude);

  ctx.save();
  ctx.shadowBlur = 8;

  backgroundStars.forEach((star) => {
    if (star.mag > visibleLimit + 0.7) {
      return;
    }

    const ra = (star.raHours / 24) * TAU;
    const hourAngle = normalizeAngle(ra - rotation);
    const radius = ((90 - star.decDeg) / 180) * Math.min(rect.width, rect.height) * (0.36 / currentState.zoom);
    const x = cx + Math.sin(hourAngle) * radius;
    const y = cy - Math.cos(hourAngle) * radius * 0.82;
    const size = clamp((visibleLimit - star.mag + 1.6) * 0.7, 0.6, 3.2);
    const alpha = clamp((visibleLimit - star.mag + 0.7) / 6, 0.06, 0.95);

    ctx.fillStyle = star.color;
    ctx.globalAlpha = alpha;
    ctx.shadowColor = star.color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TAU);
    ctx.fill();
  });

  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawConstellations(currentState) {
  const rect = canvasRect();
  const points = new Map(catalog.map((target) => [target.id, projectTarget(target, currentState)]));

  ctx.save();
  ctx.strokeStyle = "rgba(255, 226, 154, 0.22)";
  ctx.lineWidth = 1.4;
  ctx.setLineDash([6, 10]);

  constellationGroups.forEach((group) => {
    const members = group.members.map((id) => points.get(id)).filter(Boolean);
    if (members.length < 2) {
      return;
    }

    ctx.beginPath();
    members.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  });

  ctx.restore();
}

function drawNamedTargets(currentState, sky, recommendations, selected) {
  const points = new Map(catalog.map((target) => [target.id, projectTarget(target, currentState)]));
  const cx = canvasRect().width / 2;
  const cy = canvasRect().height / 2;

  catalog.forEach((target) => {
    const point = points.get(target.id);
    const category = targetCategory(target);
    const baseRadius = category === "star" ? 4.1 : category === "cluster" ? 5.5 : 6.2;
    const alpha = clamp((sky.limitingMagnitude - target.mag + 1.5) / 5.5, 0.15, 1);
    const isSelected = selected.id === target.id;

    ctx.save();
    ctx.shadowBlur = isSelected ? 18 : 8;
    ctx.shadowColor = isSelected ? "rgba(252, 167, 214, 0.9)" : target.color;
    ctx.fillStyle = target.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(point.x, point.y, isSelected ? baseRadius * 1.45 : baseRadius, 0, TAU);
    ctx.fill();

    if (currentState.labels && (isSelected || target.mag <= 1.8 || category !== "star")) {
      drawLabel(point.x, point.y, target.name, isSelected ? "#ffffff" : "rgba(247, 251, 255, 0.9)", isSelected);
    }

    ctx.restore();
  });

  recommendations.slice(0, 6).forEach((target) => {
    if (target.id === selected.id) {
      return;
    }

    const point = points.get(target.id);
    ctx.save();
    ctx.strokeStyle = "rgba(252, 167, 214, 0.5)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, TAU);
    ctx.stroke();
    ctx.restore();
  });
}

function drawSelectionHalo(selected, sky) {
  const point = projectTarget(selected, state);
  ctx.save();
  ctx.strokeStyle = "rgba(252, 167, 214, 0.8)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "rgba(252, 167, 214, 0.9)";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 15 + sky.quality * 0.04, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawCompassLabels(rect, currentState) {
  ctx.save();
  ctx.font = '600 13px "IBM Plex Mono", monospace';
  ctx.fillStyle = "rgba(214, 225, 255, 0.55)";
  ctx.textBaseline = "middle";
  ctx.fillText("N", rect.width / 2 - 6, 20);
  ctx.fillText("E", rect.width - 24, rect.height / 2);
  ctx.fillText("S", rect.width / 2 - 5, rect.height - 16);
  ctx.fillText("W", 14, rect.height / 2);

  const hourText = `${formatHour(currentState.dateTime.getHours())}:${String(currentState.dateTime.getMinutes()).padStart(2, "0")}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.26)";
  ctx.fillText(hourText, rect.width / 2 - 24, rect.height - 40);
  ctx.restore();
}

function drawLabel(x, y, text, color, highlighted) {
  ctx.save();
  ctx.font = highlighted ? '700 13px "Manrope", sans-serif' : '600 12px "Manrope", sans-serif';
  const paddingX = 8;
  const paddingY = 5;
  const metrics = ctx.measureText(text);
  const width = metrics.width + paddingX * 2;
  const height = 22;
  const labelX = x + 12;
  const labelY = y - 12;

  ctx.fillStyle = highlighted ? "rgba(7, 10, 19, 0.86)" : "rgba(7, 10, 19, 0.64)";
  ctx.strokeStyle = highlighted ? "rgba(252, 167, 214, 0.6)" : "rgba(169, 194, 255, 0.12)";
  ctx.lineWidth = 1;
  roundRect(ctx, labelX, labelY - height, width, height, 999);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(text, labelX + paddingX, labelY - 7);
  ctx.restore();
}

function handleCanvasPick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const points = catalog.map((target) => ({
    target,
    point: projectTarget(target, state)
  }));

  let nearest = null;
  let bestDistance = Infinity;

  points.forEach(({ target, point }) => {
    const distance = Math.hypot(point.x - x, point.y - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = target;
    }
  });

  if (nearest && bestDistance < 28) {
    updateState({ targetId: nearest.id });
  }
}

function computeMoon(date) {
  const synodic = 29.53058867;
  const reference = Date.parse("2000-01-06T18:14:00Z");
  const age = (((date.getTime() - reference) / 86400000) % synodic + synodic) % synodic;
  const phase = age / synodic;
  const illumination = (1 - Math.cos(TAU * phase)) / 2;

  return {
    age,
    phase,
    illumination,
    phaseName: moonPhaseName(age),
    phrase: moonPhasePhrase(age)
  };
}

function computeSky(currentState, moon) {
  const darkness = clamp(1 - (currentState.bortle - 1) / 8, 0, 1);
  const cloudPenalty = currentState.clouds / 100;
  const moonPenalty = moon.illumination * (0.42 + (1 - darkness) * 0.36);
  const quality = clamp((darkness * 0.52 + (1 - cloudPenalty) * 0.28 + (1 - moonPenalty) * 0.2) * 100, 0, 100);
  const limitingMagnitude = clamp(7.3 - currentState.bortle * 0.48 - currentState.clouds * 0.015 - moon.illumination * 0.9, 1.1, 7.2);
  const visibleBackgroundStars = backgroundStars.filter((star) => star.mag <= limitingMagnitude).length;
  const skyClass = skyClassFor(quality);
  const bestWindow = bestWindowFor(currentState, quality, moon);

  return {
    quality,
    limitingMagnitude,
    visibleBackgroundStars,
    skyClass,
    bestWindow,
    darknessLabel: darkness >= 0.75 ? "Dark" : darkness >= 0.5 ? "Mixed" : "Bright"
  };
}

function bestWindowFor(currentState, quality, moon) {
  const localHour = currentState.dateTime.getHours() + currentState.dateTime.getMinutes() / 60;

  if (quality >= 82) {
    return localHour < 21 ? "After 9:30 PM" : "Until midnight";
  }

  if (quality >= 62) {
    return moon.illumination < 0.35 ? "Around local midnight" : "Late evening";
  }

  if (quality >= 42) {
    return "Short window for bright targets";
  }

  return "Only bright stars are practical";
}

function skyClassFor(score) {
  if (score >= 82) {
    return "Pristine";
  }

  if (score >= 66) {
    return "Excellent";
  }

  if (score >= 48) {
    return "Good";
  }

  if (score >= 32) {
    return "Mixed";
  }

  return "Urban";
}

function moonPhaseName(age) {
  if (age < 1.6 || age > 27.9) {
    return "New moon";
  }

  if (age < 6.4) {
    return "Waxing crescent";
  }

  if (age < 8.1) {
    return "First quarter";
  }

  if (age < 13.8) {
    return "Waxing gibbous";
  }

  if (age < 15.7) {
    return "Full moon";
  }

  if (age < 21.2) {
    return "Waning gibbous";
  }

  if (age < 23.0) {
    return "Last quarter";
  }

  return "Waning crescent";
}

function moonPhasePhrase(age) {
  if (age < 1.6 || age > 27.9) {
    return "Moonlight is nearly absent";
  }

  if (age < 8.1) {
    return "The moon is still building";
  }

  if (age < 15.7) {
    return "Moonlight is becoming dominant";
  }

  if (age < 23.0) {
    return "The moon is now fading";
  }

  return "Only a sliver remains";
}

function targetCategory(target) {
  if (target.kind.includes("nebula")) {
    return "nebula";
  }

  if (target.kind.includes("galaxy")) {
    return "galaxy";
  }

  if (target.kind.includes("cluster")) {
    return "cluster";
  }

  return "star";
}

function humanizeKind(kind) {
  return kind
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function setRangeProgress(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  input.style.setProperty("--progress", `${clamp(percent, 0, 100)}%`);
}

function toLocalDateInputValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes())
  ].join("");
}

function parseLocalDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

function formatDateTimeShort(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatHour(hour) {
  const normalized = ((hour % 24) + 24) % 24;
  return String(Math.floor(normalized)).padStart(2, "0");
}

function siderealAngle(date, longitude) {
  const daysSinceEpoch = date.getTime() / 86400000;
  const turns = daysSinceEpoch * 1.00273790935 + longitude / 360;
  return normalizeAngle(turns * TAU);
}

function normalizeAngle(value) {
  return ((value % TAU) + TAU) % TAU;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function canvasRect() {
  return canvas.getBoundingClientRect();
}

function resizeCanvas() {
  const rect = canvasRect();
  const dpr = window.devicePixelRatio || 1;

  if (!rect.width || !rect.height) {
    return { width: 0, height: 0, dpr };
  }

  if (rect.width !== viewport.width || rect.height !== viewport.height || dpr !== viewport.dpr) {
    viewport = { width: rect.width, height: rect.height, dpr };
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return viewport;
}

function buildBackgroundStars(count) {
  const rng = mulberry32(0x7a1f9d4b);
  const stars = [];

  for (let index = 0; index < count; index += 1) {
    stars.push({
      raHours: rng() * 24,
      decDeg: rng() * 160 - 80,
      mag: 0.8 + rng() * 5.8,
      color: randomStarColor(rng)
    });
  }

  return stars;
}

function randomStarColor(rng) {
  const palette = ["#ffffff", "#d7e6ff", "#fff0d2", "#cfefff"];
  return palette[Math.floor(rng() * palette.length)];
}

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}
