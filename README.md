<div align="center">

<img src="./ExoMind.png" alt="ExoMind" width="560">

<h1>ExoMind: Democratizing Scientific Intelligence via Extended-Mind-Inspired Agentic System</h1>

<p><strong>Surpassing Frontier Proprietary Models in Scientific Reasoning and Research<br>with Less Data, Small Model, and Low-cost Training</strong></p>

<p><strong>ExoMind Team · Shanghai Artificial Intelligence Laboratory</strong></p>

<p>
  <a href="https://ai4sgi.github.io/ExoMind/">
    <img src="https://img.shields.io/badge/Project_Page-Visit-1f6feb?style=flat-square&logo=googlechrome&logoColor=white" alt="Project Page">
  </a>
  <a href="./Paper.pdf">
    <img src="https://img.shields.io/badge/Technical_Report-PDF-E34F26?style=flat-square&logo=adobeacrobatreader&logoColor=white" alt="Technical Report PDF">
  </a>
  <img src="https://img.shields.io/badge/Hugging_Face-Coming_Soon-FFD21E?style=flat-square&logo=huggingface&logoColor=000000" alt="Hugging Face Coming Soon">
  <img src="https://img.shields.io/badge/ModelScope-Coming_Soon-624AFF?style=flat-square" alt="ModelScope Coming Soon">
</p>

</div>

## 🔥 News

- **2026-07-21**: 🔥 We release the ExoMind technical report, official project page,
  and public repository.

> [!NOTE]
> This initial release contains the technical report and official project website.
> Model weights, data, and training and inference code are forthcoming.

## Overview

**ExoMind** is the first extended-mind-inspired agentic system designed for
scientific domains. It integrates a systematic data engineering pipeline, a
scientific interaction framework, and a systematic training strategy to enable
deep specialization at low cost.

Built on Qwen3.5-35B-A3B, ExoMind achieves substantial and consistent
improvements across scientific reasoning and research tasks using less data, a
small model, and low-cost training. Its average score across eight scientific
benchmarks increases from **36.2 to 67.5**, while it also improves over the base
model on all six evaluated general-capability benchmarks.

<p align="center">
  <a href="https://ai4sgi.github.io/ExoMind/#results">
    <img src="./docs/assets/fig1-benchmark.png" alt="ExoMind scientific intelligence evaluation" width="100%">
  </a>
</p>

<p align="center"><sub>Parameter counts marked with “~” are IKP-based estimates; the ~277× parameter-scale comparison uses the estimated ~9.7T parameters of GPT-5.5 (xhigh).</sub></p>

## Highlights

- **Extended-mind-inspired scientific intelligence:** Organizes an LLM,
  interaction objects, and autonomous interaction processes as a unified agentic
  system, enabling deep specialization, new scaling dimensions, and stronger
  representational capacity.
- **Training-value-aware data engineering:** Predicts problem difficulty and
  interaction benefit before trajectory generation, then performs quality
  filtering, difficulty selection, and capability routing.
- **Deeply specialized scientific interaction:** Abstracts source discovery,
  source grounding, executable verification, and observation integration into
  typed interaction objects under a unified action–observation contract, and
  distills verifiable Chain-of-Interaction trajectories.
- **Systematic progressive training:** Enforces training–inference consistency
  and progressively develops intrinsic reasoning and autonomous interaction
  through two-stage hybrid CoI training.
- **Low-cost frontier performance:** Using Qwen3.5-35B-A3B, a few thousand
  high-quality trajectories, and 1–2 days of full-parameter SFT on 8 NVIDIA H200
  GPUs, ExoMind attains the strongest average performance across eight evaluated
  scientific benchmarks and improves all six general-capability benchmarks over
  the base model.

## Intelligence Beyond a Single LLM

Rather than relying solely on the internal parameters and intrinsic capabilities
of a single LLM, ExoMind organizes intelligence as an agentic system composed of
an LLM, interaction objects, and autonomous interaction processes. Through
long-horizon autonomous interactions with diverse objects, this system develops
capabilities that extend beyond the boundaries of an individual LLM.

<p align="center">
  <a href="https://ai4sgi.github.io/ExoMind/#overview">
    <img src="./docs/assets/fig2-paradigm.png" alt="The extended-mind-inspired ExoMind paradigm" width="92%">
  </a>
</p>

- **Deep specialization:** Shifts the focus of specialization from modifying LLM
  parameters alone to designing external interaction objects tailored to
  different scientific tasks and domains.
- **New scaling dimensions:** Expands capability through richer interaction
  objects and deeper autonomous interactions, beyond model size, data volume,
  and training time.
- **Stronger representational capacity:** Better captures the diverse,
  fine-grained, and long-horizon characteristics of scientific processes.

## Building ExoMind

The construction of ExoMind follows three stages: a systematic data engineering
pipeline, a scientific interaction framework, and a systematic training strategy.

| Component | Role |
| --- | --- |
| **Systematic Data Engineering Pipeline** | Builds a roughly 60K multidisciplinary scientific problem–answer pool, predicts problem difficulty and interaction benefit before trajectory generation, applies quality filtering and difficulty selection to retain around 30K challenging problems, and then routes them to pure- or interaction-reasoning trajectories. |
| **Scientific Interaction Framework** | Abstracts source discovery, source grounding, executable verification, and observation integration as atomic capabilities, then instantiates Web Search, Google Scholar, Browser, and Code Executor as typed interaction objects under a unified action–observation contract; CoI distillation and multilevel trajectory verification produce high-quality interaction trajectories. |
| **Systematic Training Strategy** | Applies a training–inference consistency constraint and two-stage hybrid progressive CoI training: Stage 1 jointly develops intrinsic reasoning and basic interaction capability, while Stage 2 further strengthens interaction reasoning with higher-quality interaction trajectories. |

<details>
<summary><strong>Systematic Data Engineering Pipeline</strong></summary>

<p align="center">
  <a href="https://ai4sgi.github.io/ExoMind/#approach">
    <img src="./docs/assets/fig3-data-pipeline.png" alt="ExoMind systematic data engineering pipeline" width="94%">
  </a>
</p>

</details>

<details>
<summary><strong>Scientific Interaction Framework</strong></summary>

<p align="center">
  <a href="https://ai4sgi.github.io/ExoMind/#approach">
    <img src="./docs/assets/fig4-interaction-framework.png" alt="ExoMind scientific interaction framework" width="96%">
  </a>
</p>

</details>

<details>
<summary><strong>Systematic Training Strategy</strong></summary>

<p align="center">
  <a href="https://ai4sgi.github.io/ExoMind/#approach">
    <img src="./docs/assets/fig5-training-paradigm.png" alt="ExoMind hybrid progressive Chain-of-Interaction training" width="94%">
  </a>
</p>

</details>

## Performance

<p align="center">
  <a href="https://ai4sgi.github.io/ExoMind/#results">
    <img src="./docs/assets/fig8-benchmarks.png" alt="ExoMind performance across eight scientific benchmarks" width="100%">
  </a>
</p>

See the [project-page evaluation explorer](https://ai4sgi.github.io/ExoMind/#results)
for complete model comparisons, benchmark scope, and interactive rankings.

## Citation

Please cite the ExoMind technical report as follows:

```bibtex
@misc{exomind2026,
  title  = {ExoMind: Democratizing Scientific Intelligence via Extended-Mind-Inspired Agentic System},
  author = {Peng Ye and Zhuo Liu and Jingqi Ye and Fangchen Yu and Shengji Tang and Yichen Jiang and Haonan He and Tao Chen and Shuyue Hu and Bo Zhang and Bowen Zhou and Wanli Ouyang and Lei Bai},
  year   = {2026},
  note   = {Technical report},
  url    = {https://github.com/AI4SGI/ExoMind/blob/main/Paper.pdf}
}
```

## License

License terms are under institutional review. A `LICENSE` file will be added
after the review is complete. Until then, no open-source license is granted for
the materials in this repository.
