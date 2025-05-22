async function loadJsonData() {
  const finds = await fetch('finds_data.json');
  const data = await finds.json();
  return data.filter(d => d.Type);
}

function populateTable(data) {
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
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
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
