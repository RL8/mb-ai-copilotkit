export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  title: string;
  data: ChartData;
  options?: {
    responsive?: boolean;
    plugins?: {
      legend?: { display: boolean; position: 'top' | 'bottom' | 'left' | 'right' };
      title?: { display: boolean; text: string };
    };
    scales?: {
      x?: { display: boolean; title: { display: boolean; text: string } };
      y?: { display: boolean; title: { display: boolean; text: string } };
    };
  };
  styling?: {
    width?: number;
    height?: number;
    colorScheme?: 'default' | 'vibrant' | 'pastel' | 'monochrome';
  };
}

export class ChartBuilder {
  static generateChart(config: ChartConfig): string {
    const colors = this.getColorScheme(config.styling?.colorScheme || 'default');
    const chartData = this.applyColors(config.data, colors);
    
    return `
<div className="bg-white p-6 rounded-lg shadow-lg" style={{ width: '${config.styling?.width || 600}px', height: '${config.styling?.height || 400}px' }}>
  <h3 className="text-xl font-bold text-gray-900 mb-4">${config.title}</h3>
  <div className="relative h-full">
    <canvas id="${config.id}" width="${config.styling?.width || 600}" height="${config.styling?.height || 400}"></canvas>
  </div>
</div>

<script>
const ctx${config.id} = document.getElementById('${config.id}').getContext('2d');
const chart${config.id} = new Chart(ctx${config.id}, {
  type: '${config.type}',
  data: ${JSON.stringify(chartData, null, 2)},
  options: ${JSON.stringify(config.options || this.getDefaultOptions(config.type), null, 2)}
});
</script>`;
  }

  private static applyColors(data: ChartData, colors: string[]): ChartData {
    return {
      ...data,
      datasets: data.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || colors[index % colors.length],
        borderColor: dataset.borderColor || colors[index % colors.length].replace('0.6', '1'),
        borderWidth: dataset.borderWidth || 2
      }))
    };
  }

  private static getColorScheme(scheme: string): string[] {
    switch (scheme) {
      case 'vibrant':
        return [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ];
      case 'pastel':
        return [
          'rgba(255, 182, 193, 0.6)',
          'rgba(173, 216, 230, 0.6)',
          'rgba(255, 218, 185, 0.6)',
          'rgba(152, 251, 152, 0.6)',
          'rgba(221, 160, 221, 0.6)',
          'rgba(255, 240, 245, 0.6)'
        ];
      case 'monochrome':
        return [
          'rgba(75, 75, 75, 0.6)',
          'rgba(100, 100, 100, 0.6)',
          'rgba(125, 125, 125, 0.6)',
          'rgba(150, 150, 150, 0.6)',
          'rgba(175, 175, 175, 0.6)',
          'rgba(200, 200, 200, 0.6)'
        ];
      default:
        return [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(139, 92, 246, 0.6)',
          'rgba(236, 72, 153, 0.6)'
        ];
    }
  }

  private static getDefaultOptions(type: string) {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' as const },
        title: { display: false }
      }
    };

    switch (type) {
      case 'pie':
      case 'doughnut':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: { display: true, position: 'right' as const }
          }
        };
      case 'line':
        return {
          ...baseOptions,
          scales: {
            x: { display: true, grid: { display: false } },
            y: { display: true, beginAtZero: true }
          }
        };
      default:
        return {
          ...baseOptions,
          scales: {
            x: { display: true },
            y: { display: true, beginAtZero: true }
          }
        };
    }
  }

  static generateChartJS(config: ChartConfig): string {
    return `
const Chart${config.id} = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: '${config.type}',
        data: ${JSON.stringify(config.data, null, 8)},
        options: ${JSON.stringify(config.options || this.getDefaultOptions(config.type), null, 8)}
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">${config.title}</h3>
      <div className="relative" style={{ height: '${config.styling?.height || 400}px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};`;
  }
} 