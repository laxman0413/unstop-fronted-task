import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import type { Chart, ChartConfiguration } from 'chart.js';
import { RoleDistribution } from '../../core/models/user.model';

@Component({
    selector: 'app-role-pie-chart',
    standalone: true,
    templateUrl: './role-pie-chart.component.html',
    styleUrl: './role-pie-chart.component.scss',
})
export class RolePieChartComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() distribution: RoleDistribution | null = null;

    @ViewChild('roleChartCanvas', { static: true })
    private readonly chartCanvas!: ElementRef<HTMLCanvasElement>;

    private chart: Chart<'pie', number[], string> | null = null;

    async ngAfterViewInit(): Promise<void> {
        await this.initializeChart();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['distribution'] && this.chart) {
            this.updateChartData();
        }
    }

    ngOnDestroy(): void {
        this.chart?.destroy();
    }

    private async initializeChart(): Promise<void> {
        const chartModule = await import('chart.js/auto');
        const ChartAuto = chartModule.default;

        const config: ChartConfiguration<'pie', number[], string> = {
            type: 'pie',
            data: {
                labels: ['Admin', 'Editor', 'Viewer'],
                datasets: [
                    {
                        data: this.getDataset(),
                        backgroundColor: ['#1c4980', '#4f7db4', '#8baecd'],
                        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                        borderWidth: 2,
                        hoverOffset: 12,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 450,
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 14,
                            boxHeight: 14,
                            font: {
                                family: 'Space Grotesk',
                                size: 12,
                                weight: 600,
                            },
                            color: '#383838',
                        },
                    },
                },
            },
        };

        this.chart = new ChartAuto(this.chartCanvas.nativeElement, config);
    }

    private updateChartData(): void {
        if (!this.chart) {
            return;
        }

        this.chart.data.datasets[0].data = this.getDataset();
        this.chart.update();
    }

    private getDataset(): number[] {
        const summary = this.distribution ?? { Admin: 0, Editor: 0, Viewer: 0 };
        return [summary.Admin, summary.Editor, summary.Viewer];
    }
}
