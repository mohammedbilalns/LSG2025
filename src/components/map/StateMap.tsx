import React, { useEffect, useState } from 'react';
import { InteractiveMap } from './InteractiveMap';
import type { TrendResult } from '../../services/dataService';
import { feature } from 'topojson-client';

interface StateMapProps {
    trends: TrendResult[];
    onSelectLB: (lbCode: string, districtName: string, type: string) => void;
}

export const StateMap: React.FC<StateMapProps> = ({
    trends,
    onSelectLB
}) => {
    const [activeTab, setActiveTab] = useState<'district' | 'block' | 'grama'>('district');
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredInfo, setHoveredInfo] = useState<{ name: string, district: string, trend?: TrendResult } | null>(null);

    useEffect(() => {
        const loadMap = async () => {
            setLoading(true);
            setError(null);
            setGeoJsonData(null);
            try {
                const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
                let fileName = '';
                switch (activeTab) {
                    case 'district': fileName = 'districts.json'; break;
                    case 'block': fileName = 'block-panchayats.json'; break;
                    case 'grama': fileName = 'grama-panchayats.json'; break;
                }

                const path = `${baseUrl}data/topojson/Kerala/${fileName}`;
                const response = await fetch(path);
                if (!response.ok) throw new Error('Map data not found');

                let data = await response.json();

                // Convert TopoJSON to GeoJSON if needed
                if (data.type === 'Topology') {
                    const objectName = Object.keys(data.objects)[0];
                    if (objectName) {
                        data = feature(data, data.objects[objectName]);
                    }
                }

                // Inject style properties based on trends
                const processedFeatures = data.features.map((feature: any) => {
                    const props = feature.properties;
                    // Try to match LB Code
                    const code = props.SEC_Kerala_code || props.LSG_code || props.LGD_Code;
                    // Or match by Name for Districts if code fails? (GeoJSON might have different codes)

                    const trend = trends.find(t => t.LB_Code === code);

                    let color = '#94a3b8'; // Default slate
                    if (trend) {
                        switch (trend.Leading_Front) {
                            case 'LDF': color = '#ef4444'; break; // red-500
                            case 'UDF': color = '#22c55e'; break; // green-500
                            case 'NDA': color = '#f97316'; break; // orange-500
                            case 'Hung': color = '#64748b'; break; // slate-500
                            case 'IND': color = '#94a3b8'; break;
                        }
                    }

                    return {
                        ...feature,
                        properties: {
                            ...props,
                            _fillColor: color, // Custom prop for InteractiveMap to use? 
                            // InteractiveMap uses specific style logic. I might need to update InteractiveMap or pass a style function.
                            // Currently InteractiveMap uses fixed style. I should update it to support data-driven style.
                            // Workaround: InteractiveMap is simple. I can update it to read fillColor from properties.
                        }
                    };
                });

                setGeoJsonData({ ...data, features: processedFeatures });

            } catch (err) {
                console.error(err);
                setError(`Failed to load ${activeTab} map`);
            } finally {
                setLoading(false);
            }
        };
        loadMap();
    }, [activeTab, trends]);

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
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
                <h2 className="text-xl font-bold text-slate-800">Kerala Election Trends</h2>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
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
                        {/* We need InteractiveMap to respect feature colors. I'll need to modify InteractiveMapProps to allow style callback or property */}
                        <InteractiveMap
                            geoJsonData={geoJsonData}
                            onFeatureClick={handleFeatureClick}
                            onFeatureHover={handleFeatureHover}
                            onFeatureOut={() => setHoveredInfo(null)}
                            interactive={true}
                            dragging={false}
                            zoomControl={false}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                            touchZoom={false}
                            padding={[5, 5]}
                        />
                    </div>
                </div>

                {/* Right Sidebar - Legend & Info */}
                <div className="w-full md:w-80 border-l border-slate-200 bg-white p-6 flex flex-col gap-6">

                    {/* Hover Info */}
                    <div className="min-h-[80px]">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Details</h3>
                        {hoveredInfo ? (
                            <div>
                                <div className="text-lg font-bold text-slate-800 leading-tight">{hoveredInfo.name}</div>
                                <div className="text-sm text-slate-500 mb-2">{hoveredInfo.district}</div>
                                {hoveredInfo.trend ? (
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2 py-0.5 rounded text-xs font-bold text-white
                                            ${hoveredInfo.trend.Leading_Front === 'LDF' ? 'bg-red-500' :
                                                hoveredInfo.trend.Leading_Front === 'UDF' ? 'bg-green-500' :
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
                    </div>

                    {/* Legend */}
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-3">Legend</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-red-500"></div><span className="text-sm">LDF</span></div>
                            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-green-500"></div><span className="text-sm">UDF</span></div>
                            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-orange-500"></div><span className="text-sm">NDA</span></div>
                            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-slate-500"></div><span className="text-sm">Others / Hung</span></div>
                        </div>
                    </div>

                    <div className="mt-auto p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                            Click on any area to drill down into the detailed view.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
