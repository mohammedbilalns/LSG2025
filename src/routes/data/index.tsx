import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { DataDashboard } from '../../components/dashboard/DataDashboard';
import { useLocalBody, useWards, usePollingStations } from '../../services/data';
import { useState, useMemo } from 'react';

export const Route = createFileRoute('/data/')({
    component: DataRoute,
});

function DataRoute() {
    const navigate = useNavigate();
    const { data: localBodies = [], isLoading: lbLoading } = useLocalBody();
    const { data: wards = [], isLoading: wardsLoading } = useWards();
    const { data: pollingStations = [], isLoading: psLoading } =
        usePollingStations();

    const [selectedKPI, setSelectedKPI] = useState<string | null>(null);

    const loading = lbLoading || wardsLoading || psLoading;

    // Derived State for KPI Counts 
    const counts = useMemo(() => {
        if (loading)
            return {
                corporations: 0,
                municipalities: 0,
                gramaPanchayats: 0,
                blockPanchayats: 0,
                districtPanchayats: 0,
                voters: 0,
                pollingStations: 0,
                totalWards: 0,
            };

        const lbTypeMap = new Map(localBodies.map((lb) => [lb.lb_code, lb.lb_type]));
        const validTypes = [
            'Municipal Corporation',
            'Municipality',
            'Grama Panchayat',
        ];

        const validWards = wards.filter((w) => {
            const type = lbTypeMap.get(w.lb_code);
            return type && validTypes.includes(type);
        });

        const validStations = pollingStations.filter((ps) => {
            const type = lbTypeMap.get(ps.lb_code);
            return type && validTypes.includes(type);
        });

        return {
            corporations: localBodies.filter(
                (lb) => lb.lb_type === 'Municipal Corporation'
            ).length,
            municipalities: localBodies.filter((lb) => lb.lb_type === 'Municipality')
                .length,
            gramaPanchayats: localBodies.filter(
                (lb) => lb.lb_type === 'Grama Panchayat'
            ).length,
            blockPanchayats: localBodies.filter(
                (lb) => lb.lb_type === 'Block Panchayat'
            ).length,
            districtPanchayats: localBodies.filter(
                (lb) => lb.lb_type === 'District Panchayat'
            ).length,
            voters: validWards.reduce((acc, curr) => acc + curr.total_voters, 0),
            pollingStations: validStations.length,
            totalWards: localBodies.reduce((acc, curr) => acc + curr.total_wards, 0),
        };
    }, [localBodies, wards, pollingStations, loading]);

    const handleStatewideDrillDown = (kpiId: string) => {
        let type = '';
        switch (kpiId) {
            case 'corporations': type = 'Corporations'; break;
            case 'municipalities': type = 'Municipalities'; break;
            case 'gramaPanchayats': type = 'Grama Panchayats'; break;
            case 'blockPanchayats': type = 'Block Panchayats'; break;
            case 'districtPanchayats': type = 'District Panchayats'; break;
            default: return; // Voters and Polling stations don't list bodies
        }
        // Navigate to a drilldown route. 
        navigate({
            to: '/district/$districtName',
            params: { districtName: 'Kerala' },
            search: { type }
        })
    };

    const handleDistrictDrillDown = (district: string, type: string) => {
        navigate({
            to: '/district/$districtName',
            params: { districtName: district },
            search: { type }
        })
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <DataDashboard
            counts={counts}
            selectedKPI={selectedKPI}
            onSelectKPI={setSelectedKPI}
            onStatewideDrillDown={handleStatewideDrillDown}
            localBodies={localBodies}
            wards={wards}
            pollingStations={pollingStations}
            onDistrictDrillDown={handleDistrictDrillDown}
        />
    );
}
