(() => {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const toArray = (collection) => Array.prototype.slice.call(collection || []);
  const empty = (element) => {
    while (element && element.firstChild) element.removeChild(element.firstChild);
  };
  const prefersReducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const createChartInteraction = (container, config) => {
    const hotspotLayer = container ? container.querySelector(".chart-hotspots") : null;
    const tooltip = container ? container.querySelector(".chart-tooltip") : null;
    const image = container ? container.querySelector("img") : null;
    const points = config ? config.points : null;
    if (
      !container ||
      !hotspotLayer ||
      !tooltip ||
      !image ||
      !config.sourceWidth ||
      !config.sourceHeight ||
      !points ||
      !points.length
    ) return null;

    const buttons = [];
    const entriesByKey = new Map();
    const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    let pinnedState = null;

    const clearVisualState = () => {
      buttons.forEach((button) => button.classList.remove("is-active"));
      container.classList.remove("has-active");
      tooltip.classList.remove("is-visible", "is-below");
      empty(tooltip);
    };

    const renderState = (state) => {
      if (!state || !state.keys || !state.keys.length) {
        clearVisualState();
        return;
      }

      const activeKeys = new Set(state.keys);
      buttons.forEach((button) => {
        button.classList.toggle("is-active", activeKeys.has(button.dataset.pointKey));
      });
      container.classList.add("has-active");

      const anchorEntry = entriesByKey.get(state.anchorKey || state.keys[0]);
      if (!anchorEntry || !state.title) {
        tooltip.classList.remove("is-visible", "is-below");
        empty(tooltip);
        return;
      }

      const point = anchorEntry.point;
      const title = document.createTextNode(state.title);
      const detail = document.createElement("span");
      detail.textContent = state.detail || "";
      empty(tooltip);
      tooltip.appendChild(title);
      if (state.detail) tooltip.appendChild(detail);
      tooltip.style.left = `${clamp((point.sourceX / config.sourceWidth) * 100, 14, 86)}%`;
      tooltip.style.top = `${(point.sourceY / config.sourceHeight) * 100}%`;
      tooltip.classList.toggle("is-below", point.sourceY / config.sourceHeight < 0.18);
      tooltip.classList.add("is-visible");
    };

    const pointState = (point) => ({
      keys: [point.key],
      anchorKey: point.key,
      title: point.name,
      detail: point.detail,
    });

    const restore = () => renderState(pinnedState);

    points.forEach((rawPoint, index) => {
      const point = { ...rawPoint, key: rawPoint.key || `point-${index}` };
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chart-point";
      button.dataset.pointKey = point.key;
      button.setAttribute("aria-label", `${point.name}. ${point.detail}`);
      button.style.left = `${(point.sourceX / config.sourceWidth) * 100}%`;
      button.style.top = `${(point.sourceY / config.sourceHeight) * 100}%`;
      button.style.setProperty("--point-color", point.color || "#df2f2f");
      button.addEventListener("mouseenter", () => renderState(pointState(point)));
      button.addEventListener("focus", () => renderState(pointState(point)));
      button.addEventListener("blur", () => {
        window.setTimeout(() => {
          if (!buttons.includes(document.activeElement)) restore();
        }, 0);
      });
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        pinnedState = pointState(point);
        renderState(pinnedState);
      });
      buttons.push(button);
      entriesByKey.set(point.key, { button, point });
      hotspotLayer.appendChild(button);
    });

    const updateGeometry = () => {
      const renderedWidth = image.getBoundingClientRect().width || container.clientWidth;
      const scale = renderedWidth / config.sourceWidth;
      const minimumHitSize = coarsePointer ? 44 : 32;

      buttons.forEach((button, index) => {
        const markerSize = Math.max(8, points[index].sourceDiameter * scale + 2);
        const hitSize = Math.max(minimumHitSize, markerSize + 8);
        button.style.setProperty("--marker-size", `${markerSize}px`);
        button.style.setProperty("--hit-size", `${hitSize}px`);
      });
    };

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(updateGeometry);
      resizeObserver.observe(container);
    }
    image.addEventListener("load", updateGeometry);
    window.addEventListener("resize", updateGeometry, { passive: true });
    updateGeometry();

    container.addEventListener("mouseleave", () => {
      if (!buttons.includes(document.activeElement)) restore();
    });
    container.addEventListener("click", (event) => {
      if (!event.target.classList || !event.target.classList.contains("chart-point")) {
        pinnedState = null;
        restore();
      }
    });
    container.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        pinnedState = null;
        restore();
        container.focus();
      }
    });

    return {
      pulse(key) {
        const entry = entriesByKey.get(key);
        if (!entry || prefersReducedMotion) return;
        entry.button.classList.remove("is-guided");
        window.requestAnimationFrame(() => entry.button.classList.add("is-guided"));
        window.setTimeout(() => entry.button.classList.remove("is-guided"), 900);
      },
    };
  };

  const enhancePerformanceChart = () => {
    const data = window.EXOMIND_PERFORMANCE_DATA;
    const panel = data && data.panels
      ? data.panels.find((item) => item.id === "avg")
      : null;
    if (!panel) return;

    const source = {
      width: 5707,
      height: 2677,
      plotLeft: 321,
      plotRight: 4459,
      plotTop: 243,
      plotBottom: 2051,
      markerScale: 5707 / 3988,
    };

    const markerDiameters = {
      Ours: 102,
      "GPT-5.5 (xhigh)": 208,
      "Gemini-3.1-Pro-Preview": 208,
      "Gemini-3.5-Flash-Thinking": 204,
      "Claude-Opus-4.8-Thinking": 146,
      "Qwen3.7-Max": 128,
      "DeepSeek-V4-Pro (Max)": 154,
      "DeepSeek-V4-Flash (Max)": 102,
      "Kimi-K3": 170,
      "GLM-5.2": 132,
      "MiniMax-M3": 112,
      "Qwen3.5-397B-A17B": 108,
      "Qwen3.5-122B-A10B": 90,
      "Qwen3.5-35B-A3B": 84,
      "Gemma-4-31B": 84,
      "Intern-S2-Preview": 84,
      "Agents-A1": 84,
    };

    const modelSizes = {
      Ours: "35B",
      "GPT-5.5 (xhigh)": "~9.7T",
      "Gemini-3.1-Pro-Preview": "~9.0T",
      "Gemini-3.5-Flash-Thinking": "~6.6T",
      "Claude-Opus-4.8-Thinking": "~936B",
      "Qwen3.7-Max": "~685B",
      "DeepSeek-V4-Pro (Max)": "1.6T",
      "DeepSeek-V4-Flash (Max)": "284B",
      "Kimi-K3": "2.8T",
      "GLM-5.2": "744B",
      "MiniMax-M3": "428B",
      "Qwen3.5-397B-A17B": "397B",
      "Qwen3.5-122B-A10B": "122B",
      "Qwen3.5-35B-A3B": "35B",
      "Gemma-4-31B": "31B",
      "Intern-S2-Preview": "35B",
      "Agents-A1": "35B",
    };

    const measuredPositions = {
      "GLM-5.2": {
        sourceX: 2864,
        sourceY: 1320,
        sourceDiameter: 192,
      },
    };

    const points = panel.points.map((point) => {
      const measured = measuredPositions[point.key];
      return {
        key: point.key,
        name: point.label.replace(/\n/g, " "),
        detail: `Average score ${point.y.toFixed(1)} · Model size ${modelSizes[point.key]}`,
        sourceX:
          measured?.sourceX ??
          source.plotLeft + (point.x / 2.2) * (source.plotRight - source.plotLeft),
        sourceY:
          measured?.sourceY ??
          source.plotTop + ((70 - point.y) / 40) * (source.plotBottom - source.plotTop),
        color: point.color,
        sourceDiameter:
          measured?.sourceDiameter ??
          (markerDiameters[point.key] || 90) * source.markerScale,
      };
    });

    const chartController = createChartInteraction(document.querySelector("#performance-chart"), {
      sourceWidth: source.width,
      sourceHeight: source.height,
      points,
    });
    if (!chartController) return;

    const spotlight = document.querySelector(".result-spotlight");
    if (!spotlight || prefersReducedMotion || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        chartController.pulse("Ours");
        observer.disconnect();
      },
      { threshold: 0.35 }
    );
    observer.observe(spotlight);
  };

  const formatScore = (score) => Number(score).toFixed(1);

  const renderBenchmarkExplorer = () => {
    const tabsRoot = document.querySelector("#benchmark-tabs");
    const summaryRoot = document.querySelector("#benchmark-summary");
    const rankingRoot = document.querySelector("#benchmark-ranking");
    const previousButton = document.querySelector("#benchmark-previous");
    const nextButton = document.querySelector("#benchmark-next");
    const data = window.EXOMIND_BENCHMARK_DATA;
    const providerIcons = {
      Ours: { src: "assets/exomind-avatar.png", label: "ExoMind" },
      OpenAI: { src: "assets/providers/openai.png", label: "OpenAI" },
      Google: { src: "assets/providers/google.png", label: "Google" },
      Gemma: { src: "assets/providers/google.png", label: "Google" },
      Claude: { src: "assets/providers/claude.png", label: "Claude" },
      Qwen: { src: "assets/providers/qwen.png", label: "Qwen" },
      DeepSeek: { src: "assets/providers/deepseek.png", label: "DeepSeek" },
      Kimi: { src: "assets/providers/kimi.png", label: "Kimi" },
      GLM: { src: "assets/providers/glm.png", label: "GLM" },
      MiniMax: { src: "assets/providers/minimax.png", label: "MiniMax" },
      "Shanghai AI Lab": { src: "assets/providers/intern.png", label: "Shanghai AI Lab" },
    };
    if (
      !tabsRoot ||
      !summaryRoot ||
      !rankingRoot ||
      !data ||
      !data.datasets ||
      !data.datasets.length ||
      !data.models ||
      !data.models.length
    ) return;

    const datasets = data.datasets.concat(data.general ? [data.general] : []);
    const tabButtons = [];
    let activeIndex = 0;
    let transitionTimer = null;

    const renderSummary = (dataset, ours, rank, total) => {
      empty(summaryRoot);

      const context = document.createElement("div");
      const domain = document.createElement("p");
      const title = document.createElement("h3");
      domain.className = "summary-domain";
      domain.textContent = dataset.domain;
      title.className = "summary-title";
      title.textContent = dataset.label;
      context.appendChild(domain);
      context.appendChild(title);

      const result = document.createElement("p");
      const score = document.createElement("strong");
      const maxScore = Number.isFinite(dataset.maxScore) ? dataset.maxScore : 100;
      result.className = "summary-result";
      score.textContent = Number.isFinite(dataset.maxScore)
        ? `${formatScore(ours.scores[dataset.id])} / ${formatScore(maxScore)}`
        : formatScore(ours.scores[dataset.id]);
      result.appendChild(score);
      result.appendChild(document.createTextNode(` ExoMind score · Rank ${rank} of ${total}`));

      summaryRoot.appendChild(context);
      summaryRoot.appendChild(result);
    };

    const renderGeneralSummary = (dataset) => {
      empty(summaryRoot);

      const context = document.createElement("div");
      const domain = document.createElement("p");
      const title = document.createElement("h3");
      const result = document.createElement("p");
      const count = document.createElement("strong");

      domain.className = "summary-domain";
      domain.textContent = dataset.domain;
      title.className = "summary-title";
      title.textContent = "General intelligence benchmarks";
      result.className = "summary-result";
      count.textContent = `${dataset.series.length} / ${dataset.series.length}`;
      result.appendChild(count);
      result.appendChild(document.createTextNode(" benchmarks improved over Base 35B"));
      context.appendChild(domain);
      context.appendChild(title);
      summaryRoot.appendChild(context);
      summaryRoot.appendChild(result);
    };

    const renderRanking = (dataset) => {
      const maxScore = Number.isFinite(dataset.maxScore) ? dataset.maxScore : 100;
      const models = data.models
        .filter((model) => Number.isFinite(model.scores[dataset.id]))
        .slice()
        .sort((a, b) => b.scores[dataset.id] - a.scores[dataset.id]);
      const ours = models.find((model) => model.isOurs) || models[0];
      const ourRank = models.indexOf(ours) + 1;

      renderSummary(dataset, ours, ourRank, models.length);
      empty(rankingRoot);
      rankingRoot.classList.remove("is-general");
      rankingRoot.setAttribute("aria-labelledby", `benchmark-tab-${dataset.id}`);

      models.forEach((model, index) => {
        const score = model.scores[dataset.id];
        const row = document.createElement("div");
        const rank = document.createElement("span");
        const modelCell = document.createElement("span");
        const providerIcon = document.createElement("img");
        const name = document.createElement("span");
        const track = document.createElement("span");
        const fill = document.createElement("span");
        const value = document.createElement("span");
        const provider = providerIcons[model.provider];

        row.className = `ranking-row${model.isOurs ? " is-ours" : ""}`;
        row.setAttribute(
          "aria-label",
          `${index + 1}. ${model.name} by ${provider ? provider.label : model.provider}, ${formatScore(score)}${
            Number.isFinite(dataset.maxScore) ? ` of ${formatScore(maxScore)}` : ""
          } on ${dataset.label}`
        );
        rank.className = "ranking-rank";
        rank.textContent = index + 1;
        modelCell.className = "ranking-model";
        if (provider) {
          providerIcon.className = "model-provider-icon";
          providerIcon.src = provider.src;
          providerIcon.alt = "";
          providerIcon.width = 18;
          providerIcon.height = 18;
          providerIcon.decoding = "async";
          providerIcon.title = `${provider.label} logo`;
          providerIcon.setAttribute("aria-hidden", "true");
          modelCell.appendChild(providerIcon);
        }
        name.className = "model-name";
        name.textContent = model.name;
        track.className = "ranking-track";
        fill.className = "ranking-fill";
        const targetWidth = `${clamp((score / maxScore) * 100, 0, 100)}%`;
        fill.style.setProperty("--score-width", targetWidth);
        fill.style.width = prefersReducedMotion ? targetWidth : "0%";
        value.className = "ranking-score";
        value.textContent = formatScore(score);

        modelCell.appendChild(name);
        track.appendChild(fill);
        row.appendChild(rank);
        row.appendChild(modelCell);
        row.appendChild(track);
        row.appendChild(value);
        rankingRoot.appendChild(row);

        if (!prefersReducedMotion) {
          window.requestAnimationFrame(() => {
            fill.style.width = targetWidth;
          });
        }
      });
    };

    const renderGeneralComparison = (dataset) => {
      renderGeneralSummary(dataset);
      empty(rankingRoot);
      rankingRoot.classList.add("is-general");
      rankingRoot.setAttribute("aria-labelledby", `benchmark-tab-${dataset.id}`);

      dataset.series.forEach((benchmark) => {
        const row = document.createElement("div");
        const name = document.createElement("span");
        const bars = document.createElement("div");

        row.className = "general-row";
        row.setAttribute(
          "aria-label",
          `${benchmark.label}: Base 35B ${formatScore(benchmark.base)}, ExoMind ${formatScore(benchmark.exomind)}`
        );
        name.className = "general-name";
        name.textContent = benchmark.label;
        bars.className = "general-bars";

        [
          { label: "Base 35B", value: benchmark.base, ours: false },
          { label: "ExoMind", value: benchmark.exomind, ours: true },
        ].forEach((series) => {
          const seriesRow = document.createElement("div");
          const label = document.createElement("span");
          const track = document.createElement("span");
          const fill = document.createElement("span");
          const value = document.createElement("span");

          seriesRow.className = `general-series${series.ours ? " is-exomind" : ""}`;
          label.className = "general-series-label";
          label.textContent = series.label;
          track.className = "general-series-track";
          fill.className = "general-series-fill";
          const targetWidth = `${clamp(series.value, 0, 100)}%`;
          fill.style.width = prefersReducedMotion ? targetWidth : "0%";
          value.className = "general-series-value";
          value.textContent = formatScore(series.value);
          track.appendChild(fill);
          seriesRow.appendChild(label);
          seriesRow.appendChild(track);
          seriesRow.appendChild(value);
          bars.appendChild(seriesRow);

          if (!prefersReducedMotion) {
            window.requestAnimationFrame(() => {
              fill.style.width = targetWidth;
            });
          }
        });

        row.appendChild(name);
        row.appendChild(bars);
        rankingRoot.appendChild(row);
      });
    };

    const renderDataset = (dataset) => {
      if (dataset.id === "general") renderGeneralComparison(dataset);
      else renderRanking(dataset);
    };

    const renderActiveDataset = (animate) => {
      const render = () => {
        renderDataset(datasets[activeIndex]);
        window.requestAnimationFrame(() => {
          summaryRoot.classList.remove("is-changing");
          rankingRoot.classList.remove("is-changing");
        });
      };

      window.clearTimeout(transitionTimer);
      if (!animate || prefersReducedMotion) {
        render();
        return;
      }

      summaryRoot.classList.add("is-changing");
      rankingRoot.classList.add("is-changing");
      transitionTimer = window.setTimeout(render, 120);
    };

    const activateTab = (index, moveFocus, animate = true) => {
      activeIndex = (index + datasets.length) % datasets.length;
      tabButtons.forEach((button, buttonIndex) => {
        const selected = buttonIndex === activeIndex;
        button.setAttribute("aria-selected", selected ? "true" : "false");
        button.tabIndex = selected ? 0 : -1;
      });
      renderActiveDataset(animate);
      if (moveFocus) tabButtons[activeIndex].focus();
      const activeButton = tabButtons[activeIndex];
      const targetScroll = activeButton.offsetLeft - tabsRoot.clientWidth + activeButton.offsetWidth + 18;
      tabsRoot.scrollTo({
        left: activeIndex === 0 ? 0 : Math.max(0, targetScroll),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    };

    datasets.forEach((dataset, index) => {
      const button = document.createElement("button");
      button.id = `benchmark-tab-${dataset.id}`;
      button.type = "button";
      button.role = "tab";
      button.textContent = dataset.label;
      button.setAttribute("aria-controls", "benchmark-ranking");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.tabIndex = index === 0 ? 0 : -1;
      button.addEventListener("click", () => activateTab(index, false));
      button.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          activateTab(activeIndex + 1, true);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          activateTab(activeIndex - 1, true);
        } else if (event.key === "Home") {
          event.preventDefault();
          activateTab(0, true);
        } else if (event.key === "End") {
          event.preventDefault();
          activateTab(datasets.length - 1, true);
        }
      });
      tabButtons.push(button);
      tabsRoot.appendChild(button);
    });

    if (previousButton) {
      previousButton.addEventListener("click", () => activateTab(activeIndex - 1, false));
    }
    if (nextButton) {
      nextButton.addEventListener("click", () => activateTab(activeIndex + 1, false));
    }

    activateTab(0, false, false);
  };

  const enhanceTabGroups = () => {
    const groups = toArray(document.querySelectorAll(".evidence-viewer, [data-tab-group]"));

    groups.forEach((group) => {
      const buttons = toArray(group.querySelectorAll("[role='tab']"));
      const panels = toArray(group.querySelectorAll("[role='tabpanel']"));
      if (!buttons.length || !panels.length) return;

      let activeIndex = Math.max(
        0,
        buttons.findIndex((button) => button.getAttribute("aria-selected") === "true")
      );

      const activate = (index, moveFocus) => {
        activeIndex = (index + buttons.length) % buttons.length;
        buttons.forEach((button, buttonIndex) => {
          const selected = buttonIndex === activeIndex;
          button.setAttribute("aria-selected", selected ? "true" : "false");
          button.tabIndex = selected ? 0 : -1;
        });
        const activePanelId = buttons[activeIndex].getAttribute("aria-controls");
        panels.forEach((panel) => {
          const selected = panel.id === activePanelId;
          panel.hidden = !selected;
          panel.classList.remove("is-panel-entering");
          if (selected && !prefersReducedMotion) {
            window.requestAnimationFrame(() => panel.classList.add("is-panel-entering"));
          }
        });
        if (moveFocus) buttons[activeIndex].focus();
      };

      buttons.forEach((button, index) => {
        button.addEventListener("click", () => activate(index, false));
        button.addEventListener("keydown", (event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            activate(activeIndex + 1, true);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            activate(activeIndex - 1, true);
          } else if (event.key === "Home") {
            event.preventDefault();
            activate(0, true);
          } else if (event.key === "End") {
            event.preventDefault();
            activate(buttons.length - 1, true);
          }
        });
      });

      activate(activeIndex, false);
    });
  };

  const enhanceIkpChart = () => {
    const formatIkpDetail = (accuracy, modelSize, estimated = false) =>
      `IKP accuracy ${accuracy.toFixed(1)}% · Model size ${estimated ? "~" : ""}${modelSize}`;

    const source = {
      width: 5883,
      height: 2930,
    };
    const point = (
      name,
      accuracy,
      modelSize,
      sourceX,
      sourceY,
      sourceDiameter,
      color,
      estimated = false
    ) => ({
      name,
      detail: formatIkpDetail(accuracy, modelSize, estimated),
      sourceX,
      sourceY,
      sourceDiameter,
      color,
    });

    const points = [
      {
        name: "ExoMind",
        detail: "IKP accuracy 56.0% · Actual model size 35B · IKP-equivalent scale ~1T",
        sourceX: 502,
        sourceY: 1225,
        sourceDiameter: 144,
        color: "#e31a1c",
      },
      point("Qwen3.5-35B-A3B", 37.4, "35B", 503, 2038, 48, "#ab68e6"),
      point("Agents-A1", 47.1, "35B", 502, 1609, 54, "#2fab75"),
      point("Qwen3.5-122B-A10B", 48.3, "122B", 1393, 1558, 78, "#ab68e6"),
      point("MiniMax-M2.7", 40.9, "229B", 1841, 1880, 94, "#f03365"),
      point("DeepSeek-V4-Flash (Max)", 56.3, "284B", 1995, 1210, 104, "#4f6aef"),
      point("Qwen3.5-397B-A17B", 48.9, "397B", 2235, 1532, 112, "#ab68e6"),
      point("Qwen3.6-Plus", 53.3, "524B", 2433, 1340, 126, "#ab68e6", true),
      point("Claude-Opus-4.8", 53.9, "572B", 2495, 1315, 128, "#ee822f", true),
      point("Qwen3.7-Max", 54.7, "685B", 2623, 1264, 124, "#ab68e6", true),
      point("GLM-5", 56.8, "744B", 2681, 1183, 130, "#9da3aa"),
      point("GLM-5.1", 57.8, "744B", 2682, 1141, 126, "#9da3aa"),
      point(
        "Claude-Opus-4.8-Thinking",
        57.0,
        "936B",
        2847,
        1175,
        136,
        "#ee822f",
        true
      ),
      point("Kimi-K2.6", 62.4, "1.0T", 2921, 941, 134, "#69aeff"),
      point("Kimi-K2.7-Code", 53.9, "1.1T", 2959, 1315, 140, "#69aeff"),
      point("DeepSeek-V4-Pro (Max)", 61.3, "1.6T", 3227, 989, 142, "#4f6aef"),
      point("GPT-5.4 (xhigh)", 62.1, "2.2T", 3455, 938, 160, "#0ca982", true),
      point("Kimi-K3", 63.5, "2.8T", 3624, 890, 158, "#69aeff"),
      point(
        "Gemini-3.5-Flash-Thinking",
        69.5,
        "6.6T",
        4240,
        628,
        180,
        "#fabc05",
        true
      ),
      point("GPT-5.5 (xhigh)", 71.6, "9.7T", 4515, 522, 192, "#0ca982", true),
    ];

    createChartInteraction(document.querySelector("#ikp-chart"), {
      sourceWidth: source.width,
      sourceHeight: source.height,
      points,
    });
  };

  const enhanceFigureLightbox = () => {
    const dialog = document.querySelector("#figure-lightbox");
    const dialogImage = dialog ? dialog.querySelector("img") : null;
    const scroll = dialog ? dialog.querySelector(".lightbox-scroll") : null;
    const closeButton = dialog ? dialog.querySelector(".lightbox-close") : null;
    const triggers = toArray(document.querySelectorAll(".zoomable-figure[data-figure]"));
    let lastTrigger = null;
    if (!dialog || !dialogImage || !scroll || !closeButton) return;

    const clearImage = () => {
      dialogImage.removeAttribute("src");
      dialogImage.alt = "Expanded research figure";
    };

    const close = () => {
      if (dialog.open && typeof dialog.close === "function") dialog.close();
      else {
        dialog.removeAttribute("open");
        clearImage();
        if (lastTrigger) lastTrigger.focus();
      }
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const sourceImage = trigger.querySelector("img");
        lastTrigger = trigger;
        dialogImage.src = trigger.getAttribute("data-figure");
        dialogImage.alt = sourceImage
          ? sourceImage.alt
          : trigger.getAttribute("aria-label") || "Expanded figure";
        scroll.classList.add("is-fit");
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
      });
    });

    closeButton.addEventListener("click", close);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    scroll.addEventListener("click", () => scroll.classList.toggle("is-fit"));
    dialog.addEventListener("close", () => {
      clearImage();
      if (lastTrigger) lastTrigger.focus();
    });
  };

  const enhanceCitationCopy = () => {
    const button = document.querySelector("#copy-citation");
    const status = document.querySelector("#citation-copy-status");
    if (!button) return;

    const target = document.querySelector(`#${button.dataset.copyTarget}`);
    if (!target) return;

    const copyWithFallback = async (text) => {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand && document.execCommand("copy");
      textarea.remove();
      if (!copied) throw new Error("Copy command unavailable");
    };

    button.addEventListener("click", async () => {
      const originalLabel = "Copy BibTeX";
      try {
        await copyWithFallback(target.textContent.trim());
        button.textContent = "Copied";
        if (status) status.textContent = "BibTeX copied to clipboard.";
      } catch (error) {
        button.textContent = "Copy failed";
        if (status) status.textContent = "Unable to copy BibTeX automatically.";
      }

      window.setTimeout(() => {
        button.textContent = originalLabel;
        if (status) status.textContent = "";
      }, 1800);
    });
  };

  const enhanceNavigation = () => {
    const header = document.querySelector(".site-header");
    const links = toArray(document.querySelectorAll(".nav-links a[href^='#']"));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    let scrollTicking = false;
    const updateScrollState = () => {
      scrollTicking = false;
      if (!header) return;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = clamp(window.scrollY / scrollable, 0, 1) * 100;
      header.style.setProperty("--scroll-progress", `${progress}%`);
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    const requestScrollUpdate = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollState);
    };
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate, { passive: true });
    updateScrollState();

    if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

    const setActive = (id) => {
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -62% 0px", threshold: [0, 0.1, 0.25] }
    );

    sections.forEach((section) => observer.observe(section));
  };

  const enhanceReveal = () => {
    const elements = toArray(document.querySelectorAll(".reveal"));
    if (!elements.length) return;
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    elements.forEach((element) => observer.observe(element));
  };

  const enhanceBackToTop = () => {
    const button = document.querySelector("#back-to-top");
    if (!button) return;

    const update = () => button.classList.toggle("is-visible", window.scrollY > 700);
    window.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    update();
  };

  const enhanceDownloadStats = async () => {
    const root = document.querySelector("#model-downloads");
    const total = document.querySelector("#model-download-total");
    if (!root || !total) return;

    try {
      const response = await fetch("download-stats.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Download statistics request failed: ${response.status}`);
      const payload = await response.json();
      if (!Number.isSafeInteger(payload.total) || payload.total < 0) {
        throw new Error("Download statistics contain an invalid total");
      }

      total.textContent = new Intl.NumberFormat("en-US").format(payload.total);
      root.classList.remove("is-unavailable");
      if (payload.updatedAt) {
        const updated = new Date(payload.updatedAt);
        if (!Number.isNaN(updated.getTime())) {
          root.title = `Cumulative model-repository downloads across Hugging Face and ModelScope · Updated ${updated.toLocaleString()}`;
        }
      }
    } catch (_error) {
      total.textContent = "—";
      root.classList.add("is-unavailable");
      root.title = "Download statistics are temporarily unavailable";
    }
  };

  enhancePerformanceChart();
  renderBenchmarkExplorer();
  enhanceTabGroups();
  enhanceIkpChart();
  enhanceFigureLightbox();
  enhanceCitationCopy();
  enhanceNavigation();
  enhanceReveal();
  enhanceBackToTop();
  enhanceDownloadStats();
})();
