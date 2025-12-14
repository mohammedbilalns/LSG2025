import React, { useState } from 'react';
import { InteractiveMap } from './InteractiveMap';
import type { TrendResult, LocalBody } from '../../services/dataService';
import { useMap } from '../../services/map';
import { PartyWinKPIs } from './PartyWinKPIs';
import { MapLegend } from './MapLegend';

interface StateMapProps {
    trends: TrendResult[];
    localBodies: LocalBody[];
    onSelectLB: (lbCode: string, districtName: string, type: string) => void;
}

const tabToFile = {
    "district": "districts.json",
    "block": "block-panchayats.json",
    "grama": "grama-panchayats.json"
}

export const StateMap: React.FC<StateMapProps> = ({
    trends,
    localBodies,
    onSelectLB
}) => {
    const [activeTab, setActiveTab] = useState<'district' | 'block' | 'grama'>('grama');
    const [hoveredInfo, setHoveredInfo] = useState<{ name: string, district: string, trend?: TrendResult } | null>(null);
    const [showMuni, setShowMuni] = useState(true);
    const [showCorp, setShowCorp] = useState(true);

    const fileName = tabToFile[activeTab];

    const map = useMap(fileName, trends);

    const filteredData = React.useMemo(() => {
        if (!map.data) return null;

        // If filters are all on, return original
        if (showMuni && showCorp) return map.data;

        // Clone to avoid mutating original source if re-used
        const features = (map.data.features || []).filter((f: any) => {
            const type = f.properties.Lsgd_Type || f.properties.lsgd_type || f.properties.LB_Type; // Handle potential varied property names

            // If type is missing, we might default to showing it or rely on other logic.
            // Assuming strict filtering if property exists.
            if (!type) return true; // Keep if unknown

            const normalizedType = type.toLowerCase().trim();
            if (normalizedType.includes('municipality') && !showMuni) return false;
            if (normalizedType.includes('corporation') && !showCorp) return false;

            return true;
        });

        return { ...map.data, features };
    }, [map.data, showMuni, showCorp]);

    const handleFeatureClick = (feature: any) => {
        const props = feature.properties;
        const code = props.SEC_Kerala_code || props.LSG_code || props.LGD_Code;
        const district = props.District || props.DISTRICT || props.District_N;
        if (code && district) {
            // Normalise district name
            const dName = district.trim().toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
            const finalDName = dName === 'Thiruvanathapuram' ? 'Thiruvananthapuram' :
                dName === 'Kasargod' ? 'Kasaragod' : dName;
            onSelectLB(code, finalDName, activeTab);
        }
    };

    const handleFeatureHover = (feature: any) => {
        const props = feature.properties;
        const name = props['English Label'] || props.LSGI_NAME || props.LSGD || '';
        const district = props.District || props.DISTRICT || props.District_N || '';
        const code = props.SEC_Kerala_code || props.LSG_code || props.LGD_Code;

        const trend = trends.find(t => t.LB_Code === code);
        setHoveredInfo({ name, district, trend });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100dvh-150px)]">
            <div className="p-4 border-b border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white z-10">
                <div className="flex flex-col gap-1">
                    <h2 className="text-l font-bold text-slate-800">Kerala Election Trends</h2>
                    {/* Filters */}
                    <div className="flex gap-3 text-xs">
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

            <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
                {/* overflow-hidden added to container to ensure scrolling within children if needed */}
                <div className="flex-1 relative bg-slate-50 min-h-[50vh] md:min-h-0">
                    {map.isLoading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    {map.isError && (
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4">
                            {map.error.message}
                        </div>
                    )}

                    <div className="h-full w-full">
                        {/* We need InteractiveMap to respect feature colors. I'll need to modify InteractiveMapProps to allow style callback or property */}
                        <InteractiveMap
                            key={activeTab}
                            geoJsonData={filteredData}
                            onFeatureClick={handleFeatureClick}
                            onFeatureHover={handleFeatureHover}
                            onFeatureOut={() => setHoveredInfo(null)}
                            interactive={true}
                            zoomControl={false}
                            padding={[5, 5]}
                            maxZoomRelative={2}
                        />
                        {/* Legend Overlay */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0 z-[400] w-max max-w-[90%]">
                            <MapLegend />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Legend & Info */}
                <div className="w-full md:w-80 border-l border-slate-200 bg-white p-6 flex flex-col gap-6">
                    <div className="min-h-[60px]">
                        {hoveredInfo ? (
                            <div>
                                <div className="text-sm font-bold text-slate-800 leading-tight">{hoveredInfo.name}</div>
                                <div className="text-sm text-slate-500 mb-2">{hoveredInfo.district}</div>
                                {hoveredInfo.trend ? (
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2 py-0.5 rounded text-xs font-bold text-white
                                            ${hoveredInfo.trend.Leading_Front === 'LDF' ? 'bg-red-500' :
                                                hoveredInfo.trend.Leading_Front === 'UDF' ? 'bg-indigo-500' :
                                                    hoveredInfo.trend.Leading_Front === 'NDA' ? 'bg-orange-500' : 'bg-slate-500'
                                            }`}
                                        >
                                            {hoveredInfo.trend.Leading_Front} Leading
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {hoveredInfo.trend.Wards_Declared} wards counted
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-400">No results available</div>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 italic">Hover over map to view results</div>
                        )}

                        {/* Party Performance */}
                        <div className="overflow-y-auto max-h-[300px] custom-scrollbar pr-1 mt-6">
                            <h4 className="font-semibold text-slate-700 mb-3">Party Performance</h4>
                            <PartyWinKPIs trends={trends} localBodies={localBodies} activeTab={activeTab} />
                        </div>
                    </div>

                    <div className="mt-auto p-6 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                            Click on any area to drill down into the detailed view.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
