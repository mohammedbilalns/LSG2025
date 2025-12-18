import React, { useState } from 'react';
import { InteractiveMap } from './InteractiveMap';
import type { LocalBody, TrendResult } from '../../services/dataService';
import { PartyWinKPIs } from './PartyWinKPIs';
import { MapLegend } from './MapLegend';
import { ArrowLeft } from 'lucide-react';

interface DistrictMapProps {
    districtName: string;
    onSelectLB: (lbCode: string) => void;
    onBack: () => void;
    localBodies: LocalBody[];
    trends: TrendResult[];
}

import { useStaticTopoJSON } from '../../services/map';

export const DistrictMap: React.FC<DistrictMapProps> = ({
    districtName,
    onSelectLB,
    onBack,
    localBodies,
    trends
}) => {
    const [activeTab, setActiveTab] = useState<'grama' | 'block' | 'district'>('grama');
    const [hoveredLB, setHoveredLB] = useState<string | null>(null);

    // Filters
    const [showMuni, setShowMuni] = useState(true);
    const [showCorp, setShowCorp] = useState(true);

    // Fetch Map Data (Cached)
    const { data: rawGeoJsonData, isLoading: loading, error: mapError } = useStaticTopoJSON(`district_maps/${districtName}_${activeTab}.json`);

    // Process & Style Data
    const styledData = React.useMemo(() => {
        if (!rawGeoJsonData) return null;

        // Inject style properties based on trends
        const processedFeatures = rawGeoJsonData.features.map((feature: any) => {
            const props = feature.properties;
            const code = props.SEC_Kerala_code || props.LSG_code || props.LGD_Code;

            const trend = trends.find(t => t.LB_Code === code);
            let color = '#94a3b8'; // Default slate

            if (trend) {
                switch (trend.Leading_Front) {
                    case 'LDF': color = '#ef4444'; break;
                    case 'UDF': color = '#2768F5'; break;
                    case 'NDA': color = '#f97316'; break;
                    case 'Hung': color = '#64748b'; break;
                    case 'IND': color = '#94a3b8'; break;
                }
            }

            return {
                ...feature,
                properties: {
                    ...props,
                    _fillColor: color
                }
            };
        });

        return { ...rawGeoJsonData, features: processedFeatures };
    }, [rawGeoJsonData, trends]);

    const filteredData = React.useMemo(() => {
        if (!styledData) return null;

        // If filters are all on, return styled
        if (showMuni && showCorp) return styledData;

        // Clone to avoid mutating
        const features = (styledData.features || []).filter((f: any) => {
            const type = f.properties.Lsgd_Type || f.properties.lsgd_type || f.properties.LB_Type;

            if (!type) return true; // Keep if unknown

            const normalizedType = type.toLowerCase().trim();
            if (normalizedType.includes('municipality') && !showMuni) return false;
            // District map might not have corporations in all districts, but if it does:
            if (normalizedType.includes('corporation') && !showCorp) return false;

            return true;
        });

        return { ...styledData, features };
    }, [styledData, showMuni, showCorp]);

    const error = mapError ? `Failed to load ${activeTab} map for ${districtName}` : null;

    const handleFeatureClick = (feature: any) => {
        const props = feature.properties;
        const code = props.SEC_Kerala_code || props.LSG_code || props.LGD_Code;
        if (code) {
            onSelectLB(code);
        }
    };

    const handleFeatureHover = (feature: any) => {
        const props = feature.properties;
        const name = props['English Label'] || props.LSGI_NAME || props.LSGD || '';
        setHoveredLB(name);
    };





    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100dvh-150px)]">
            <div className="p-4 border-b border-slate-200 bg-white z-10
                flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-700 shadow-sm border border-transparent hover:border-slate-200"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-slate-800">
                                {districtName}
                            </h2>
                            <p className="text-xs md:text-sm text-slate-500">
                                District Overview
                            </p>
                        </div>
                    </div>
                    {/* Filters */}
                    <div className="flex gap-3 text-xs pl-8 md:pl-0">
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded select-none border border-transparent hover:border-slate-200 transition-colors">
                            <input
                                type="checkbox"
                                checked={showMuni}
                                onChange={e => setShowMuni(e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span className="text-slate-700 font-medium">Municipalities</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded select-none border border-transparent hover:border-slate-200 transition-colors">
                            <input
                                type="checkbox"
                                checked={showCorp}
                                onChange={e => setShowCorp(e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span className="text-slate-700 font-medium">Corporations</span>
                        </label>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg self-start md:self-auto">
                    {(['district', 'block', 'grama'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>


            <div className="flex-1 flex flex-col md:flex-row">
                <div className="flex-1 relative bg-slate-50 min-h-[50vh] md:min-h-0">
                    {loading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4">
                            {error}
                        </div>
                    )}

                    <div className="h-full w-full">
                        <InteractiveMap
                            geoJsonData={filteredData}
                            onFeatureClick={handleFeatureClick}
                            onFeatureHover={handleFeatureHover}
                            onFeatureOut={() => setHoveredLB(null)}
                            interactive={true}
                            zoomControl={false}
                            padding={[5, 5]}
                            maxZoomRelative={1}
                        />
                        {/* Legend Overlay */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0 z-[400] w-max max-w-[90%]">
                            <MapLegend />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full md:w-80 border-l border-slate-200 bg-white p-6 flex flex-col gap-6">
                    {/* Hover Info */}
                    <div className="min-h-[60px]">
                        {hoveredLB ? (
                            <div className="text-sm font-bold text-blue-600">{hoveredLB}</div>
                        ) : (
                            <div className="text-sm text-slate-400 italic">Hover over map to view details</div>
                        )}

                        {/* Party Performance */}
                        <div className="overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
                            <h5 className="font-semibold text-slate-700 mb-3">Party Performance</h5>
                            <PartyWinKPIs trends={trends} localBodies={localBodies} activeTab={activeTab} />
                        </div>
                    </div>


                    <div className="mt-auto p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                            Click on any {activeTab === 'district' ? 'area' : 'Local Body'} in the map to view detailed election trends and ward-level breakdown.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
