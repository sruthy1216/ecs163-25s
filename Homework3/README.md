# Homework 3: Visualization Dashboard Pt 2 (Interactivity)

For this assignment, I extended my Homework 2 Pokémon dashboard to include interactivity and animated transitions using D3.js. The goal was to enhance user engagement and understanding of the dataset through dynamic visual behaviors and drill-down capabilities.

---

## 💡 Project Overview

My dashboard explores battle statistics for different Pokémon using three coordinated views:

- 📊 **Bar Chart** – Shows the distribution of Pokémon by primary type (serves as the overview).
- 🟢 **Scatter Plot** – Plots HP vs. Attack to compare individual performance.
- 📈 **Parallel Coordinates Plot** – An advanced visualization comparing six stats: HP, Attack, Defense, Sp. Atk, Sp. Def, and Speed.

These views are integrated using the **focus + context** paradigm, allowing users to maintain a broad view of the dataset while zooming into specific areas of interest through interaction.

---

## 🖱️ Interactions Implemented

### 1. **Selection via Bar Click**
Clicking on any bar in the bar chart highlights all Pokémon of that type in both the scatter plot and parallel coordinates plot. This filters the display using animated transitions to emphasize the selected group.

### 2. **Brushing in Scatter Plot**
Users can drag a rectangular brush across the scatter plot to select a subset of Pokémon. The corresponding lines in the parallel coordinates plot are then highlighted, allowing for close inspection of their full stat profiles.

### 3. **Reset Button**
A reset button is included to restore the dashboard to its default view by clearing all selections and reapplying the original visual styles.

---

## ✨ Animated Transitions

To improve the clarity and smoothness of interactions, I implemented the following transitions using D3:

- **Filtering Transition**  
  On bar selection, the dashboard uses opacity and color to:
  - Fade out unrelated circles and lines.
  - Enlarge and highlight the selected items.
  - Apply a consistent transition duration (500ms) for a smooth experience.

- **Brushing Transition**  
  The brushing interaction triggers a fade-in/fade-out effect on parallel coordinate lines depending on whether they match the brushed region.

- **Reset Transition**  
  All visuals return to default opacity and size using a smooth transition, helping users reorient themselves without abrupt visual changes.

---

## 🎨 Design Considerations

In designing these transitions, I followed several principles outlined in the paper by Heer and Robertson (2007):

- **Consistency** – Similar transitions (e.g., fade) are used across views for semantic alignment.
- **Predictability** – Transitions are direct and short enough to track easily.
- **Semantic Correspondence** – Visual elements always represent the same data points throughout transitions.
- **Common Fate** – Grouped elements animate in the same way to reinforce their relatedness.

---

## 📁 File Structure

Homework3/
├── ssabesan/ # My UC Davis email prefix folder
│ ├── index.html # Main HTML file
│ ├── main.js # JS file with D3 code
│ ├── data/
│ │ └── pokemon_alopez247.csv
│ └── README.md # This file


---

## 🔧 Technologies Used

- [D3.js v7](https://d3js.org/)
- JavaScript (ES6)
- HTML5 / SVG

Resources I referred to:
- [Event handling in D3.js](https://gramener.github.io/d3js-playbook/events.html)
- [d3-brush](https://github.com/d3/d3-brush)
- [Brushable Scatterplot Demo](https://observablehq.com/@d3/brushable-scatterplot)
- [D3 Transitions](https://www.d3indepth.com/transitions/)
- *Animated transitions in statistical data graphics* – Heer & Robertson (2007)


---

Let me know if you'd like me to add screenshots, a demo link, or a brief walkthrough of the implementation!
