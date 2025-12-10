import React, { useMemo } from 'react';
import type { LocalBody, Ward, PollingStation } from '../../services/dataService';

interface DistrictTableProps {
    localBodies: LocalBody[];
    wards: Ward[];
    pollingStations: PollingStation[];
    selectedKPI: string | null;
    onDrillDown: (district: string, type: string) => void;
}

export const DistrictTable: React.FC<DistrictTableProps> = ({
    localBodies,
    wards,
    pollingStations,
    selectedKPI,
    onDrillDown,
}) => {
    const districts = useMemo(() => {
        const uniqueDistricts = Array.from(new Set(localBodies.map(lb => lb.district_name))).sort();
        return uniqueDistricts;
    }, [localBodies]);

    const kpiLabel = useMemo(() => {
        switch (selectedKPI) {
            case 'corporations': return 'Corporations';
            case 'municipalities': return 'Municipalities';
            case 'gramaPanchayats': return 'Grama Panchayats';
            case 'blockPanchayats': return 'Block Panchayats';
            case 'districtPanchayats': return 'District Panchayats';
            case 'voters': return 'Total Voters';
            case 'pollingStations': return 'Polling Stations';
            default: return 'Local Bodies';
        }
    }, [selectedKPI]);

    const tableData = useMemo(() => {
        return districts.map(district => {
            // Filter entities for this district
            const districtLBs = localBodies.filter(lb => lb.district_name === district);

            let filteredLBs = districtLBs;
            let kpiCount = 0;

            if (selectedKPI && !['voters', 'pollingStations'].includes(selectedKPI)) {
                let typeFilter = '';
                switch (selectedKPI) {
                    case 'corporations': typeFilter = 'Municipal Corporation'; break;
                    case 'municipalities': typeFilter = 'Municipality'; break;
                    case 'gramaPanchayats': typeFilter = 'Grama Panchayat'; break;
                    case 'blockPanchayats': typeFilter = 'Block Panchayat'; break;
                    case 'districtPanchayats': typeFilter = 'District Panchayat'; break;
                }
                filteredLBs = districtLBs.filter(lb => lb.lb_type === typeFilter);
                kpiCount = filteredLBs.length;
            } else {
                kpiCount = districtLBs.length;
            }

            // Use filtered LBs to calculate voters and stations
            // We should ONLY sum voters/stations for base tiers (Corp, Mun, GP) to avoid double counting

            // Let's define base types.
            const baseTypes = ['Municipal Corporation', 'Municipality', 'Grama Panchayat'];

            // For the "Total Voters" column, we should always use the base types in the district.
            const baseLBsInDistrict = districtLBs.filter(lb => baseTypes.includes(lb.lb_type));
            const baseLBCodes = new Set(baseLBsInDistrict.map(lb => lb.lb_code));

            const voters = wards
                .filter(w => baseLBCodes.has(w.lb_code))
                .reduce((acc, curr) => acc + curr.total_voters, 0);

            const stations = pollingStations
                .filter(ps => baseLBCodes.has(ps.lb_code))
                .length;

            return {
                district,
                kpiCount,
                voters,
                stations
            };
        }).filter(row => !selectedKPI || ['voters', 'pollingStations'].includes(selectedKPI) || row.kpiCount > 0);
    }, [districts, localBodies, wards, pollingStations, selectedKPI]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider">District</th>
                            <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider text-right">
                                {selectedKPI && !['voters', 'pollingStations'].includes(selectedKPI) ? kpiLabel : 'Local Bodies'}
                            </th>
                            <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider text-right">Total Voters</th>
                            <th className="py-4 px-6 font-semibold text-slate-700 text-sm uppercase tracking-wider text-right">Polling Stations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tableData.map((row) => (
                            <tr key={row.district} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-slate-900">{row.district}</td>
                                <td
                                    className={`py-4 px-6 text-right font-medium ${selectedKPI && !['voters', 'pollingStations'].includes(selectedKPI) ? 'text-blue-600 cursor-pointer hover:underline' : 'text-slate-600'}`}
                                    onClick={() => {
                                        if (selectedKPI && !['voters', 'pollingStations'].includes(selectedKPI)) {
                                            onDrillDown(row.district, kpiLabel);
                                        }
                                    }}
                                >
                                    {row.kpiCount.toLocaleString()}
                                </td>
                                <td className="py-4 px-6 text-slate-600 text-right">
                                    {row.voters.toLocaleString()}
                                </td>
                                <td className="py-4 px-6 text-slate-600 text-right">
                                    {row.stations.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
