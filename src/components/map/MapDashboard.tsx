import React, { useState, useEffect } from 'react';
const DistrictMap = React.lazy(() => import('./DistrictMap').then(m => ({ default: m.DistrictMap })));
const StateMap = React.lazy(() => import('./StateMap').then(m => ({ default: m.StateMap })));
const LocalBodyTrendMap = React.lazy(() => import('./LocalBodyTrendMap').then(m => ({ default: m.LocalBodyTrendMap })));
import { fetchLocalBodies, fetchTrendResults } from '../../services/dataService';
import type { LocalBody, TrendResult } from '../../services/dataService';

interface MapDashboardProps {
    // Add props as needed
}

export const MapDashboard: React.FC<MapDashboardProps> = () => {
    // Navigation State
    const [view, setView] = useState<'districts' | 'lbs' | 'map'>('districts');
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedLB, setSelectedLB] = useState<LocalBody | null>(null);

    // Data State
    const [allLocalBodies, setAllLocalBodies] = useState<LocalBody[]>([]);
    const [allTrends, setAllTrends] = useState<TrendResult[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Initial Data Load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [lbs, trends] = await Promise.all([
                    fetchLocalBodies(),
                    fetchTrendResults()
                ]);
                setAllLocalBodies(lbs);
                setAllTrends(trends);
            } catch (error) {
                console.error("Failed to load initial dashboard data", error);
            } finally {
                setLoadingData(false);
            }
        };
        loadInitialData();
    }, []);

    // Handlers
    // handleSelectDistrict and handleSelectLB replaced by StateMap logic and DistrictMap logic

    const handleBackToDistricts = () => {
        setSelectedDistrict(null);
        setView('districts');
    };

    const handleBackToLBs = () => {
        setSelectedLB(null);
        setView('lbs');
    };

    const handleSelectLBByCode = (lbCode: string) => {
        const lb = allLocalBodies.find(b => b.lb_code === lbCode);
        if (lb) {
            setSelectedLB(lb);
            setView('map');
        } else {
            console.warn(`Local Body with code ${lbCode} not found in metadata`);
        }
    };

    const handleStateMapSelection = (_lbCode: string, districtName: string, _type: string) => {
        setSelectedDistrict(districtName);
        setView('lbs');
        // Future enhancement: Deep link to specific LB via lbCode
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <React.Suspense fallback={
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            }>
                {view === 'districts' && (
                    <StateMap
                        trends={allTrends}
                        onSelectLB={handleStateMapSelection}
                    />
                )}

                {view === 'lbs' && selectedDistrict && (
                    <DistrictMap
                        districtName={selectedDistrict}
                        onSelectLB={handleSelectLBByCode}
                        onBack={handleBackToDistricts}
                        localBodies={allLocalBodies.filter(lb => lb.district_name === selectedDistrict)}
                        trends={allTrends}
                    />
                )}

                {view === 'map' && selectedLB && selectedDistrict && (
                    <LocalBodyTrendMap
                        lbName={selectedLB.lb_name_english}
                        lbCode={selectedLB.lb_code}
                        districtName={selectedDistrict}
                        totalWards={selectedLB.total_wards}
                        trendData={allTrends.find(t => t.LB_Code === selectedLB.lb_code)}
                        onBack={handleBackToLBs}
                    />
                )}
            </React.Suspense>
        </div>
    );
};
