async function loadJsonData() {
  const finds = await fetch('finds_data.json');
  const data = await finds.json();
  return data.filter(d => d.Type);
}

const loadingSpinner = document.getElementById('loadingSpinner');
const findsTableContainer = document.getElementById('findsTableContainer');
const findsTable = document.getElementById('findsTable');
const tableSectionHeading = document.getElementById('findsTableHeading');

function showSpinner() {
  loadingSpinner.style.display = 'block';
  const spinner = loadingSpinner.querySelector('.spinner-border');
  spinner.classList.remove('text-primary');
  spinner.style.color = 'hsl(330, 66%, 57%)';
  findsTableContainer.style.display = 'none';
}

function hideSpinner() {
  loadingSpinner.style.display = 'none';
  findsTableContainer.style.display = 'block';
  findsTable.style.display = 'table';
  tableSectionHeading.style.display = 'block';
}

function populateTable(data) {

  showSpinner();

  setTimeout(() => {
  const tbody = document.querySelector('#findsTable tbody');
  tbody.innerHTML = '';
  data.forEach(item => {
    const row = `
      <tr>
        <td>${item["Finds number"] || ''}</td>
        <td>${item["Type"] || ''}</td>
        <td>${item["ID"] || ''}</td>
        <td>${item["Context"] || ''}</td>
        <td>${item["Site"] || ''}</td>
        <td>${item["Grid"] || ''}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', row);
  });

  // Use jQuery DataTable plugin to paginate table
   if ($.fn.DataTable.isDataTable('#findsTable')) {
    $('#findsTable').DataTable().destroy();
  }
  $('#findsTable').DataTable();

  hideSpinner();
  }, 300);
}

let allCounts = null;
let barChartInstance = null;
let pieChartInstance = null;
let doughnutChartInstance = null

function renderBarChart(counts) {
  const context = document.getElementById('barChart').getContext('2d');

  if (barChartInstance) {
    barChartInstance.destroy();
  }

  barChartInstance = new Chart(context, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Finds by Type',
        data: Object.values(counts),
        backgroundColor: 'hsl(185, 84%, 25%)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Finds by Type' }
      }
    }
  });
}

function renderPieChart(counts) {
  const context = document.getElementById('pieChart').getContext('2d');

  if (pieChartInstance) {
    pieChartInstance.destroy();
  }

    const backgroundColors = Object.keys(counts).map((_, i) =>
    `hsl(${(i * 360) / Object.keys(counts).length}, 70%, 60%)`
  );

  pieChartInstance = new Chart(context, {
      type: 'pie',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          label: 'Finds by Type',
          data: Object.values(counts),
          backgroundColor: backgroundColors,
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'right' },
          title: { display: true, text: 'Finds by Type (Pie Chart)' }
        }
      }
    });
  }

  function renderDoughnutChart(counts) {
  const context = document.getElementById('doughnutChart').getContext('2d');

  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
  }

    const backgroundColors = Object.keys(counts).map((_, i) =>
    `hsl(${(i * 360) / Object.keys(counts).length}, 70%, 60%)`
  );

  doughnutChartInstance = new Chart(context, {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          label: 'Finds by Type',
          data: Object.values(counts),
          backgroundColor: backgroundColors,
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'right' },
          title: { display: true, text: 'Finds by Type (Pie Chart)' }
        }
      }
    });
  }



function countFinds(data, key) {
  return data.reduce((acc, obj) => {
    const k = obj[key] || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function createCheckboxes(counts) {
  const container = document.getElementById('category-filters');
  container.innerHTML = '';

  Object.keys(counts).forEach(category => {
    const label = document.createElement('label');
    label.className = 'filter-badge active';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = category;
    checkbox.checked = true;

    checkbox.addEventListener('change', () => {
      label.classList.toggle('active', checkbox.checked);
      updateChart();
    });

    const textNode = document.createTextNode(category);
    const closeIcon = document.createElement('span');
    closeIcon.className = 'close-icon';
    closeIcon.innerHTML = '&times;';

    label.appendChild(checkbox);
    label.appendChild(textNode);
    label.appendChild(closeIcon);
    container.appendChild(label);
  });
}

function updateChart() {
  const checkedBoxes = Array.from(document.querySelectorAll('#category-filters input[type="checkbox"]:checked'));
  const filteredCounts = {};

  checkedBoxes.forEach(checked => {
    filteredCounts[checked.value] = allCounts[checked.value];
  });

  renderBarChart(filteredCounts);
  renderPieChart(filteredCounts);
  renderDoughnutChart(filteredCounts);
}

loadJsonData().then(data => {
  allCounts = countFinds(data, 'Type');
  createCheckboxes(allCounts);
  renderBarChart(allCounts);
  renderPieChart(allCounts);
  renderDoughnutChart(allCounts);
  populateTable(data);
});
