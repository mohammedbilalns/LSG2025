import React, { useMemo, useState } from 'react';
import type { TrendResult, LocalBody } from '../../services/dataService';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PartyWinKPIsProps {
    trends: TrendResult[];
    localBodies: LocalBody[];
    activeTab?: 'district' | 'block' | 'grama';
}

interface Stats {
    totalBodies: number;
    totalWards: number;
    bodiesLed: Record<string, number>;
    wardsWon: Record<string, number>;
}

const initialStats = (): Stats => ({
    totalBodies: 0,
    totalWards: 0,
    bodiesLed: { LDF: 0, UDF: 0, NDA: 0, IND: 0, Hung: 0, Others: 0 },
    wardsWon: { LDF: 0, UDF: 0, NDA: 0, IND: 0, Others: 0 },
});

export const PartyWinKPIs: React.FC<PartyWinKPIsProps> = ({ trends, localBodies, activeTab = 'grama' }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const stats = useMemo(() => {
        const data: Record<string, Stats> = {
            'Municipal Corporation': initialStats(),
            'Municipality': initialStats(),
            'Grama Panchayat': initialStats(),
            'Block Panchayat': initialStats(),
            'District Panchayat': initialStats(),
        };

        // Create a map of LB Code to Type
        const lbTypeMap = new Map<string, string>();
        localBodies.forEach(lb => {
            lbTypeMap.set(lb.lb_code, lb.lb_type);
        });

        trends.forEach(trend => {
            const type = lbTypeMap.get(trend.LB_Code);
            if (!type || !data[type]) return; // Skip if type unknown or not tracked

            const s = data[type];
            s.totalBodies++;

            // Count Leading Front
            const leader = trend.Leading_Front; // LDF, UDF, NDA, IND, Hung, N/A
            if (leader && s.bodiesLed[leader] !== undefined) {
                s.bodiesLed[leader]++;
            } else if (leader) {
                // Fallback for unexpected strings if any, though type definition suggests specific ones
                // treating them as Others if not matched?
                if (s.bodiesLed['Others'] !== undefined) s.bodiesLed['Others']++;
            }

            // Count Ward Wins
            s.totalWards += (trend.LDF_Seats + trend.UDF_Seats + trend.NDA_Seats + trend.IND_Seats);
            s.wardsWon['LDF'] += trend.LDF_Seats;
            s.wardsWon['UDF'] += trend.UDF_Seats;
            s.wardsWon['NDA'] += trend.NDA_Seats;
            s.wardsWon['IND'] += trend.IND_Seats;
            // Note: IND effectively captures Independents/Others based on dataService logic
        });

        return data;
    }, [trends, localBodies]);

    // Define category groups for reordering
    const categoryConfigs = {
        'Municipal Corporation': { key: 'Municipal Corporation', label: 'Corporations' },
        'Municipality': { key: 'Municipality', label: 'Municipalities' },
        'District Panchayat': { key: 'District Panchayat', label: 'District Panchayats' },
        'Block Panchayat': { key: 'Block Panchayat', label: 'Block Panchayats' },
        'Grama Panchayat': { key: 'Grama Panchayat', label: 'Grama Panchayats' },
    };

    // Determine order based on activeTab
    const getOrderedCategories = () => {
        if (activeTab === 'district') {
            return [
                categoryConfigs['District Panchayat'],
                categoryConfigs['Municipal Corporation'],
                categoryConfigs['Municipality']
            ];
        } else if (activeTab === 'block') {
            return [
                categoryConfigs['Block Panchayat'],
                categoryConfigs['Municipal Corporation'],
                categoryConfigs['Municipality']
            ];
        } else {
            // Default to Grama (also handles 'grama' tab)
            return [
                categoryConfigs['Grama Panchayat'],
                categoryConfigs['Municipal Corporation'],
                categoryConfigs['Municipality']
            ];
        }
    };

    const categories = getOrderedCategories();

    const renderFrontStats = (statsMap: Record<string, number>, type: 'bodies' | 'wards') => {
        const total = type === 'bodies'
            ? Object.values(statsMap).reduce((a, b) => a + b, 0)
            : Object.values(statsMap).reduce((a, b) => a + b, 0); // Logic same, but semantic diff

        if (total === 0) return <div className="text-xs text-slate-400">No data</div>;

        // Order: LDF, UDF, NDA, IND/Others
        const groups = ['LDF', 'UDF', 'NDA'];
        const others = type === 'bodies' ? (statsMap['IND'] + statsMap['Hung'] + statsMap['Others']) : (statsMap['IND'] + statsMap['Others']);

        return (
            <div className="flex gap-2 text-xs font-medium">
                {groups.map(g => (
                    statsMap[g] > 0 && (
                        <div key={g} className={`flex items-center gap-1 ${g === 'LDF' ? 'text-red-600' :
                                g === 'UDF' ? 'text-indigo-600' :
                                    g === 'NDA' ? 'text-orange-600' : 'text-slate-600'
                            }`}>
                            <span>{g}:</span>
                            <span>{statsMap[g]}</span>
                        </div>
                    )
                ))}
                {others > 0 && (
                    <div className="flex items-center gap-1 text-slate-600">
                        <span>Oth:</span>
                        <span>{others}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Mobile Toggle */}
            <div className="md:hidden">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm"
                >
                    <span className="font-semibold text-slate-700">Party Performance</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
            </div>

            <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden md:block'}`}>
                {categories.map(cat => {
                    const s = stats[cat.key];
                    // We render it even if totalBodies is 0 to maintain consistent layout if requested, 
                    // but typically we hide empty ones. 
                    if (s.totalBodies === 0) return null;

                    return (
                        <div key={cat.key} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold text-slate-700">{cat.label}</h4>
                                <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{s.totalBodies}</span>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Wins (Leading)</div>
                                    {renderFrontStats(s.bodiesLed, 'bodies')}
                                </div>
                                <div className="border-t border-slate-200 pt-1.5">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ward Wins</div>
                                        <span className="text-[10px] text-slate-400">Total: {s.totalWards}</span>
                                    </div>
                                    {renderFrontStats(s.wardsWon, 'wards')}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
