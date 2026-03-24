const curatedNotes = {
  setBacklight:
    "A focused Chromebook utility written in C to directly control screen backlight levels. Small, practical, and clearly built to solve a personal hardware problem.",
  imageToSpreadsheet:
    "A Go side project that converts common image formats into an XLSX spreadsheet output. The idea is playful and utilitarian at the same time: pixels translated into cells.",
  "The-Powder-Toy-Go":
    "A forked C++ codebase described as an attempt to rewrite or revisit The Powder Toy. It reads like an exploratory branch rather than a finished standalone product.",
  TheGoToy:
    "An original Go rewrite of The Powder Toy from scratch. Compared with the forked repo, this signals a shift from studying an existing codebase to building a fresh simulation path.",
  creepySpiderBot:
    "An early-stage Go project with no public README or description at the time of this snapshot. It is presented here as an experiment still in the notebook rather than a fully documented release.",
  euro:
    "An interactive AP European History web application with a timeline UI, profiles, and a Go backend. It combines content presentation with a cleaner front-end orientation than the systems-heavy repos.",
  chess:
    "A Go chess experiment where two lightweight MLP-driven chess AIs play each other. The README frames it candidly as beginner-level play, which makes it feel like an honest machine-learning sandbox.",
  cordium:
    "A Go repository without public README detail in this snapshot. It appears to be another communications-oriented or systems experiment, but the public metadata is still sparse.",
  cordverse:
    "A self-hosted Discord client MVP with a TypeScript front-end, Node proxy backend, encrypted token storage, and multi-account support. Ambitious, privacy-aware, and structurally more involved than a simple client clone.",
  discordo:
    "A fork of the terminal Discord client Discordo. The upstream project provides the bulk of the documented feature set; this repository is best read as Grammercy’s adaptation or investigation branch.",
  ClankerIsComing:
    "A substantial Go-based Pokemon Showdown engine with deterministic simulation, MCTS search, live play support, replay scraping, and neural evaluation workflows. This is the most technically dense repository in the public set.",
  chemistry:
    "A chemistry visualizer that currently runs as a lightweight local web server in Go. It is especially fitting for this site because it mirrors the chemistry motif in both subject matter and presentation.",
  fourierify:
    "A JavaScript signal-processing project focused on Fourier concepts and interactive experimentation. This is the newest active addition to the public project set.",
  starrynight:
    "An interactive night-sky app built on the React + TypeScript + Vite scaffold. It launches the same live sky viewer that is hosted in the GitHub project.",
  "Grammercy.github.io":
    "The repository for this GitHub Pages site itself. It acts as the front door to the public project catalog and is intentionally deployed as a zero-build static website."
};

const registryNote = document.querySelector("#registry-note");
const syncStamp = document.querySelector("#sync-stamp");
const repoCount = document.querySelector("#repo-count");
const createdAt = document.querySelector("#created-at");
const languageCount = document.querySelector("#language-count");
const projectsGrid = document.querySelector("#projects-grid");
const template = document.querySelector("#project-card-template");

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

const formulaFromName = (name) => {
  const clean = name.replace(/[^a-zA-Z0-9]/g, "");
  if (!clean) return "X";
  if (clean.length === 1) return clean.toUpperCase();
  return `${clean[0]}${clean[Math.min(1, clean.length - 1)]}`.replace(/^./, (char) =>
    char.toUpperCase()
  );
};

const projectKind = (repo) => {
  if (repo.name === "Grammercy.github.io") return "site";
  if (repo.fork) return "fork";
  if (repo.language === "Go") return "systems";
  if (repo.language === "TypeScript" || repo.language === "JavaScript" || repo.language === "HTML") {
    return "interface";
  }
  return "experiment";
};

const descriptionFor = (repo) =>
  curatedNotes[repo.name] ||
  repo.description ||
  "Public repository with limited metadata exposed on GitHub at the time of this page load.";

const buildTags = (repo) => {
  const tags = [];
  tags.push(repo.fork ? "Forked base" : "Original work");
  tags.push(repo.language || "No primary language");
  tags.push(projectKind(repo));

  if (repo.name === "chemistry") tags.push("chemistry motif");
  if (repo.name === "fourierify") tags.push("signal processing");
  if (repo.name === "starrynight") tags.push("night-sky");
  if (repo.name === "ClankerIsComing") tags.push("AI engine");
  if (repo.name === "cordverse") tags.push("self-hosted");
  if (repo.name === "Grammercy.github.io") tags.push("GitHub Pages");

  return tags;
};

const renderRepos = (repos) => {
  projectsGrid.innerHTML = "";

  repos.forEach((repo) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".project-card");

    fragment.querySelector(".project-formula").textContent = formulaFromName(repo.name);
    fragment.querySelector(".project-state").textContent = repo.fork ? "Forked compound" : "Original compound";
    fragment.querySelector("h3").textContent = repo.name;

    const link = fragment.querySelector(".project-link");
    link.href = repo.html_url;

    fragment.querySelector(".project-description").textContent = descriptionFor(repo);
    fragment.querySelector(".meta-created").textContent = formatDate(repo.created_at);
    fragment.querySelector(".meta-updated").textContent = formatDate(repo.updated_at);
    fragment.querySelector(".meta-language").textContent = repo.language || "Unspecified";
    fragment.querySelector(".meta-kind").textContent = projectKind(repo);

    const tags = fragment.querySelector(".project-tags");
    buildTags(repo).forEach((tag) => {
      const chip = document.createElement("span");
      chip.textContent = tag;
      tags.appendChild(chip);
    });

    if (repo.fork) {
      card.style.borderColor = "rgba(255, 201, 117, 0.35)";
    }

    projectsGrid.appendChild(fragment);
  });
};

const hydrate = async () => {
  const now = new Date();
  syncStamp.textContent = `Synced ${formatDate(now.toISOString())}`;

  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch("https://api.github.com/users/Grammercy"),
      fetch("https://api.github.com/users/Grammercy/repos?per_page=100&sort=updated")
    ]);

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error("GitHub API request failed");
    }

    const user = await userResponse.json();
    const repos = await reposResponse.json();

    const sourceRepos = repos
      .filter((repo) => repo.owner?.login === "Grammercy")
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const languages = new Set(sourceRepos.map((repo) => repo.language).filter(Boolean));

    repoCount.textContent = `${sourceRepos.length}`;
    createdAt.textContent = formatDate(user.created_at);
    languageCount.textContent = `${languages.size}`;
    registryNote.textContent = `Live GitHub registry, currently showing ${sourceRepos.length} public repositories for Grammercy.`;

    renderRepos(sourceRepos);
  } catch (error) {
    const fallbackRepos = [
      "Grammercy.github.io",
      "chemistry",
      "fourierify",
      "starrynight",
      "ClankerIsComing",
      "cordverse",
      "discordo",
      "cordium",
      "chess",
      "euro",
      "creepySpiderBot",
      "TheGoToy",
      "The-Powder-Toy-Go",
      "imageToSpreadsheet",
      "setBacklight"
    ].map((name) => ({
      name,
      html_url: `https://github.com/Grammercy/${name}`,
      description: "",
      created_at: "2026-03-15T00:00:00Z",
      updated_at: "2026-03-15T00:00:00Z",
      language: null,
      fork: name === "discordo" || name === "The-Powder-Toy-Go"
    }));

    repoCount.textContent = `${fallbackRepos.length}`;
    createdAt.textContent = "Dec 23, 2023";
    languageCount.textContent = "8";
    registryNote.textContent =
      "GitHub API sync failed, so the page is showing the last known project framing from this build.";

    renderRepos(fallbackRepos);
    console.error(error);
  }
};

hydrate();
