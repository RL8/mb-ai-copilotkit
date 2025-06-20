export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: unknown;
}

export class ChartBuilder {
  generateChart(): string {
    return 'Chart component';
  }
}
