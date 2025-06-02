async function loadJsonData() {
  const finds = await fetch("finds_data.json");
  const data = await finds.json();
  return data.filter((d) => d.Type);
}

const loadingSpinner = document.getElementById("loadingSpinner");
const findsTableContainer = document.getElementById("findsTableContainer");
const findsTable = document.getElementById("findsTable");
const tableSectionHeading = document.getElementById("findsTableHeading");

function showSpinner() {
  loadingSpinner.style.display = "block";
  const spinner = loadingSpinner.querySelector(".spinner-border");
  spinner.classList.remove("text-primary");
  spinner.style.color = "hsl(330, 66%, 57%)";
  findsTableContainer.style.display = "none";
}

function hideSpinner() {
  loadingSpinner.style.display = "none";
  findsTableContainer.style.display = "block";
  findsTable.style.display = "table";
  tableSectionHeading.style.display = "block";
}

// Create data table
let findsTableInstance;

function populateTable(data) {
  showSpinner();

  setTimeout(() => {
    const tbody = document.querySelector("#findsTable tbody");
    tbody.innerHTML = "";

    data.forEach((item) => {
      const row = `
        <tr>
          <td>${item["Finds number"] || ""}</td>
          <td>${item["Type"] || ""}</td>
          <td>${item["ID"] || ""}</td>
          <td>${item["Context"] || ""}</td>
          <td>${item["Site"] || ""}</td>
          <td>${item["Grid"] || ""}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    // Destroy old instance if needed
    if (findsTableInstance) {
      findsTableInstance.destroy();
    }

    // ✅ Create new DataTable (v2 style)
    findsTableInstance = new DataTable("#findsTable", {
      paging: true,
      searching: true,
      ordering: true,
    });

    hideSpinner();
  }, 300);
}

// Chart creation

// Set colour pallette
function generateGradientColors(count, hslStart, hslEnd) {
  const [hStart, sStart, lStart] = hslStart;
  const [hEnd, sEnd, lEnd] = hslEnd;

  return Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(count - 1, 1); // Avoid division by 0
    const h = hStart + t * (hEnd - hStart);
    const s = sStart + t * (sEnd - sStart);
    const l = lStart + t * (lEnd - lStart);
    return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
  });
}

let allCounts = null;
let barChartInstance = null;
let pieChartInstance = null;
let doughnutChartInstance = null;

function renderBarChart(counts) {
  const context = document.getElementById("barChart").getContext("2d");

  if (barChartInstance) {
    barChartInstance.destroy();
  }

  barChartInstance = new Chart(context, {
    type: "bar",
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "Finds by Type",
          data: Object.values(counts),
          backgroundColor: "hsl(210, 22%, 49%)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Finds by Type" },
      },
    },
  });
}

function renderPieChart(counts) {
  const context = document.getElementById("pieChart").getContext("2d");

  if (pieChartInstance) {
    pieChartInstance.destroy();
  }

  const backgroundColors = generateGradientColors(
    Object.keys(counts).length,
    [227, 42, 51],
    [329, 100, 94]
  );

  pieChartInstance = new Chart(context, {
    type: "pie",
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "Finds by Type",
          data: Object.values(counts),
          backgroundColor: backgroundColors,
          borderColor: "white",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, position: "right" },
        title: { display: false, text: "Finds by Type (Pie Chart)" },
      },
    },
  });
}

function renderDoughnutChart(counts) {
  const context = document.getElementById("doughnutChart").getContext("2d");

  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
  }

  const backgroundColors = generateGradientColors(
    Object.keys(counts).length,
    [227, 42, 51],
    [329, 100, 94]
  );

  doughnutChartInstance = new Chart(context, {
    type: "doughnut",
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "Finds by Type",
          data: Object.values(counts),
          backgroundColor: backgroundColors,
          borderColor: "white",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, position: "right" },
        title: { display: false, text: "Finds by Type (Doughnut Chart)" },
      },
    },
  });
}

function countFinds(data, key) {
  return data.reduce((acc, obj) => {
    const k = obj[key] || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function createCheckboxes(counts) {
  const container = document.getElementById("category-filters");
  container.innerHTML = "";

  Object.keys(counts).forEach((category) => {
    const label = document.createElement("label");
    label.className = "filter-badge active";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = category;
    checkbox.checked = true;

    checkbox.addEventListener("change", () => {
      label.classList.toggle("active", checkbox.checked);
      updateChart();
    });

    const textNode = document.createTextNode(category);
    const closeIcon = document.createElement("span");
    closeIcon.innerHTML = "&times;";

    label.appendChild(checkbox);
    label.appendChild(textNode);
    container.appendChild(label);
  });
}

function updateChart() {
  const checkedBoxes = Array.from(
    document.querySelectorAll(
      '#category-filters input[type="checkbox"]:checked'
    )
  );
  const filteredCounts = {};

  checkedBoxes.forEach((checked) => {
    filteredCounts[checked.value] = allCounts[checked.value];
  });

  renderBarChart(filteredCounts);
  renderPieChart(filteredCounts);
  renderDoughnutChart(filteredCounts);
}

loadJsonData().then((data) => {
  allCounts = countFinds(data, "Type");
  createCheckboxes(allCounts);
  renderBarChart(allCounts);
  renderPieChart(allCounts);
  renderDoughnutChart(allCounts);
  populateTable(data);
});
