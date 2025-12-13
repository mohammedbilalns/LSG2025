import React from 'react';
import { KPIGrid } from './KPIGrid';
import { DistrictTable } from './DistrictTable';
import type { LocalBody, Ward, PollingStation } from '../../services/dataService';

interface DataDashboardProps {
    counts: {
        corporations: number;
        municipalities: number;
        gramaPanchayats: number;
        blockPanchayats: number;
        districtPanchayats: number;
        voters: number;
        pollingStations: number;
        totalWards: number;
    };
    selectedKPI: string | null;
    onSelectKPI: (kpi: string | null) => void;
    onStatewideDrillDown: (kpiId: string) => void;
    localBodies: LocalBody[];
    wards: Ward[];
    pollingStations: PollingStation[];
    onDistrictDrillDown: (district: string, type: string) => void;
}

export const DataDashboard: React.FC<DataDashboardProps> = ({
    counts,
    selectedKPI,
    onSelectKPI,
    onStatewideDrillDown,
    localBodies,
    wards,
    pollingStations,
    onDistrictDrillDown,
}) => {
    return (
        <>
            <KPIGrid
                counts={counts}
                selectedKPI={selectedKPI}
                onSelectKPI={onSelectKPI}
                onDrillDown={onStatewideDrillDown}
            />

            <div className="mt-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                        {selectedKPI ? 'District Breakdown' : 'Overview by District'}
                    </h2>
                    {selectedKPI && (
                        <button
                            onClick={() => onSelectKPI(null)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
                <DistrictTable
                    localBodies={localBodies}
                    wards={wards}
                    pollingStations={pollingStations}
                    selectedKPI={selectedKPI}
                    onDrillDown={onDistrictDrillDown}
                />
            </div>
        </>
    );
};
