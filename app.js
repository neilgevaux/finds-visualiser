async function loadJsonData() {
  const finds = await fetch('finds_data.json');
  const data = await finds.json();
  return data.filter(d => d.Type);
}

const loadingSpinner = document.getElementById('loadingSpinner');
const findsTable = document.getElementById('findsTable');
const tableSectionHeading = document.getElementById('findsTableHeading');

function showSpinner() {
  loadingSpinner.style.display = 'block';
  const spinner = loadingSpinner.querySelector('.spinner-border');
  spinner.classList.remove('text-primary');
  spinner.style.color = 'hsl(330, 66%, 57%)';
  findsTable.style.display = 'none';
  tableSectionHeading.style.display = 'none';
}

function hideSpinner() {
  loadingSpinner.style.display = 'none';
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

function renderChart(counts) {
  const context = document.getElementById('typeChart').getContext('2d');
  new Chart(context, {
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

function countFinds(data, key) {
  return data.reduce((acc, obj) => {
    const k = obj[key] || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

loadJsonData().then(data => {
  const counts = countFinds(data, 'Type');
  renderChart(counts);
  populateTable(data);
});
