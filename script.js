let myChart = null;

document.addEventListener('DOMContentLoaded', function () {
  const toggleDark = document.getElementById('toggleDark');
  const body = document.body;

  toggleDark.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    toggleDark.textContent = body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
  });

  // Load from localStorage
  const saved = localStorage.getItem('lastChartData');
  if (saved) {
    const { data, type } = JSON.parse(saved);
    updateChart(data, type);
    renderTable(data);
  }
});

function handleCSVUpload() {
  const file = document.getElementById('csvFile').files[0];
  const chartType = document.getElementById('chartType').value;

  if (!file) {
    alert('Please upload a CSV file');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    const parsed = parseCSV(content);
    updateChart(parsed, chartType);
    renderTable(parsed);
    localStorage.setItem('lastChartData', JSON.stringify({ data: parsed, type: chartType }));
  };
  reader.readAsText(file);
}

function parseCSV(content) {
  const rows = content.trim().split('\n');
  const headers = rows[0].split(',').map(h => h.trim());
  const labels = [], data = [], tableData = [];

  for (let i = 1; i < rows.length; i++) {
    const [label, value] = rows[i].split(',');
    labels.push(label.trim());
    data.push(parseFloat(value.trim()));
    tableData.push({ [headers[0]]: label.trim(), [headers[1]]: value.trim() });
  }

  return { labels, data, tableData, headers };
}

function updateChart(parsed, type) {
  if (myChart) {
    myChart.destroy();
  }

  const ctx = document.getElementById('myChart').getContext('2d');
  myChart = new Chart(ctx, {
    type: type,
    data: {
      labels: parsed.labels,
      datasets: [{
        label: 'Uploaded Data',
        data: parsed.data,
        backgroundColor: (type === 'pie' || type === 'doughnut' || type === 'radar')
          ? generateColors(parsed.data.length)
          : 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: type === 'pie' || type === 'doughnut' || type === 'radar'
        }
      },
      scales: type === 'pie' || type === 'doughnut' ? {} : {
        x: { title: { display: true, text: 'Labels' } },
        y: { title: { display: true, text: 'Values' }, beginAtZero: true }
      }
    }
  });
}

function renderTable(parsed) {
  const container = document.getElementById('data-table-container');
  let html = `<table><thead><tr>`;
  parsed.headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += `</tr></thead><tbody>`;
  parsed.tableData.forEach(row => {
    html += `<tr><td>${row[parsed.headers[0]]}</td><td>${row[parsed.headers[1]]}</td></tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

function generateColors(count) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#E7E9ED', '#00A36C',
    '#8A2BE2', '#DE3163', '#6495ED', '#3CB371'
  ];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}

function downloadChart() {
  const canvas = document.getElementById('myChart');
  const link = document.createElement('a');
  const tempCanvas = document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d');

  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  // Fill white background regardless of theme
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // Draw the chart on top
  ctx.drawImage(canvas, 0, 0);

  link.href = tempCanvas.toDataURL('image/png');
  link.download = 'chart.png';
  link.click();
}
