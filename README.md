<div align="center">

<h1>ExoMind: Democratizing Scientific Intelligence via Extended-Mind-Inspired Agentic System</h1>

<p><strong>Frontier-level scientific reasoning and research at 35B scale through data- and compute-efficient specialization</strong></p>

<p><strong>ExoMind Team · Shanghai Artificial Intelligence Laboratory</strong></p>

<p>
  <a href="https://ai4sgi.github.io/ExoMind/">
    <img src="https://img.shields.io/badge/Project_Page-Visit-1f6feb?style=flat-square&logo=googlechrome&logoColor=white" alt="Project Page">
  </a>
  <img src="https://img.shields.io/badge/Technical_Report-Coming_Soon-b0b0b0?style=flat-square" alt="Technical Report Coming Soon">
  <img src="https://img.shields.io/badge/Hugging_Face-Coming_Soon-FFD21E?style=flat-square&logo=huggingface&logoColor=000000" alt="Hugging Face Coming Soon">
  <img src="https://img.shields.io/badge/ModelScope-Coming_Soon-624AFF?style=flat-square" alt="ModelScope Coming Soon">
</p>

</div>

## News

- **2026-07-21:** We release the official ExoMind project page and public repository.

> [!NOTE]
> This initial release contains the official project website. The technical report,
> model weights, data, and training and inference code are forthcoming.

## Overview

**ExoMind** is an extended-mind-inspired agentic system for scientific reasoning
and research. Rather than treating scientific specialization solely as parameter
adaptation, ExoMind organizes an LLM, typed scientific interaction objects, and
autonomous interaction processes as a unified intelligence system.

ExoMind connects three components: systematic scientific data engineering,
deeply specialized scientific interaction, and train–inference-aligned progressive
training. Built on Qwen3.5-35B-A3B, it raises the average score across eight
scientific benchmarks from **36.2 to 67.5**, while improving over the base model
on all six evaluated general-capability benchmarks.

<p align="center">
  <a href="https://ai4sgi.github.io/ExoMind/#results">
    <img src="./docs/assets/fig1-benchmark.png" alt="ExoMind scientific intelligence evaluation" width="100%">
  </a>
</p>

<p align="center"><sub>Parameter counts marked with “~” are IKP-based estimates; the ~277× parameter-scale comparison uses the estimated ~9.7T parameters of GPT-5.5 (xhigh).</sub></p>

## Highlights

- **Extended-mind-inspired scientific intelligence:** Treats the model,
  interaction objects, and autonomous interaction process as one agentic system.
- **Systematic scientific data engineering:** Predicts problem difficulty and
  interaction value before rollout, then filters and routes examples into
  reasoning and interaction trajectories.
- **Typed scientific interaction:** Grounds source discovery, source grounding,
  executable verification, and observation integration in a unified
  action–observation interface.
- **Progressive Chain-of-Interaction training:** Aligns training and inference
  protocols and progressively develops intrinsic reasoning, basic tool use, and
  high-quality closed-loop interaction patterns.

## Intelligence Beyond a Single LLM

ExoMind expands scientific specialization beyond a model's internal parameters.
It treats external interaction objects and long-horizon interaction processes as
first-class components of the intelligence system.

<p align="center">
  <a href="https://ai4sgi.github.io/ExoMind/#overview">
    <img src="./docs/assets/fig2-paradigm.png" alt="The extended-mind-inspired ExoMind paradigm" width="92%">
  </a>
</p>

- **Deep specialization:** Shift specialization from parameter adaptation alone
  toward interaction objects tailored to scientific operations and domains.
- **New scaling dimensions:** Expand capability through richer interaction
  objects and deeper autonomous interaction, beyond model size, data volume,
  and training time.
- **Stronger system capacity:** Organize the model, external objects, and
  interaction process as a system that can represent diverse, fine-grained, and
  long-horizon scientific work.

## Building ExoMind

| Component | Role |
| --- | --- |
| **Systematic data engineering** | Predicts problem difficulty and tool benefit before rollout, progressively filters a roughly 60K multidisciplinary pool into about 30K high-value questions, and routes them to pure-reasoning or interaction-reasoning paths. |
| **Scientific interaction framework** | Instantiates Web Search, Google Scholar, Browser, and Code Executor as typed interaction objects under a shared action–observation contract, with outcome-, rule-, and process-level trajectory verification. |
| **Systematic training strategy** | Enforces train–inference consistency and applies hybrid progressive CoI training. Full-parameter SFT uses a few thousand high-quality trajectories and runs on 8 NVIDIA H200 GPUs for approximately one to two days. |

<p align="center">
  <a href="https://ai4sgi.github.io/ExoMind/#approach">
    <img src="./docs/assets/fig4-interaction-framework.png" alt="ExoMind scientific interaction framework" width="96%">
  </a>
</p>

<details>
<summary><strong>Systematic scientific data engineering</strong></summary>

<p align="center">
  <img src="./docs/assets/fig3-data-pipeline.png" alt="ExoMind systematic data engineering pipeline" width="94%">
</p>

</details>

<details>
<summary><strong>Train–inference-aligned progressive training</strong></summary>

<p align="center">
  <img src="./docs/assets/fig5-training-paradigm.png" alt="ExoMind hybrid progressive Chain-of-Interaction training" width="94%">
</p>

</details>

## Performance

Among the compared models, ExoMind achieves the highest average score,
**67.5**, across eight scientific benchmarks and ranks first on **6 of 8**
benchmarks. Its average rises from **36.2 to 67.5** over the
Qwen3.5-35B-A3B base model.

### Scientific reasoning and research

| Benchmark | Base | ExoMind | Gain vs. Base |
| --- | ---: | ---: | ---: |
| HLE w/ tools | 47.4 | **50.9** | +3.5 |
| FrontierScience-Research | 2.5 | **70.0** | +67.5 |
| CMT-Benchmark | 20.0 | **84.0** | +64.0 |
| CritPt | 0.9 | **26.0** | +25.1 |
| AMO-Bench | 46.0 | **78.0** | +32.0 |
| IMO-AnswerBench | 71.0 | **92.8** | +21.8 |
| HiPhO | 37.0 | **49.7** | +12.7 |
| FrontierScience-Olympiad | 64.5 | **89.0** | +24.5 |

### General capabilities

| Benchmark | Base | ExoMind | Gain vs. Base |
| --- | ---: | ---: | ---: |
| MMLU-Pro | 85.3 | **94.5** | +9.2 |
| GPQA-Diamond | 84.2 | **95.0** | +10.8 |
| MedMCQA | 79.5 | **93.9** | +14.4 |
| xbench | 77.0 | **84.0** | +7.0 |
| τ²-Bench | 32.5 | **74.8** | +42.3 |
| LiveCodeBench | 74.6 | **85.7** | +11.1 |

For complete model comparisons, benchmark scope, and interactive rankings, see
the [project-page evaluation explorer](https://ai4sgi.github.io/ExoMind/#results).

## Emergent Scientific Interaction Patterns

After training, ExoMind composes a finite set of interaction objects into
scientific behaviors that adapt to the evolving reasoning state:

- **Verification-seeking:** Uses executable feedback to inspect fragile
  derivations, identify inconsistencies, and revise subsequent reasoning.
- **Evidence-seeking:** Moves from source discovery to primary-source grounding
  and incorporates retrieved evidence into the reasoning process.
- **Hybrid closed loop:** Alternates between literature evidence and executable
  mathematical or numerical checks so that the two constrain each other.

Explore the complete trajectories on the
[project page](https://ai4sgi.github.io/ExoMind/#cases-title).

## Release Status

| Resource | Status |
| --- | --- |
| [Project page](https://ai4sgi.github.io/ExoMind/) | Available |
| Technical report | Coming soon |
| Model weights | Coming soon |
| Data | Coming soon |
| Training and inference code | Coming soon |

## Repository Layout

The current release contains the static project website:

```text
docs/
├── index.html
├── styles.css
├── script.js
├── benchmark-data.js
├── performance-data.js
└── assets/
```

The website is published with GitHub Pages from the `docs/` directory on the
`main` branch.

## Citation

Please use the following provisional citation until the technical report is
available:

```bibtex
@misc{exomind2026,
  title  = {ExoMind: Democratizing Scientific Intelligence via Extended-Mind-Inspired Agentic System},
  author = {{ExoMind Team}},
  year   = {2026},
  note   = {Technical report, forthcoming}
}
```

## License

License terms are under institutional review. A `LICENSE` file will be added
after the review is complete. Until then, no open-source license is granted for
the materials in this repository.
