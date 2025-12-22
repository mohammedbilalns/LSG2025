import { useState } from 'react';
import type { LocalBody, Ward, PollingStation, TrendResult } from '../../services/dataService';
import { ArrowLeft, MapPin, Vote, Users, Building2, Trophy } from 'lucide-react';
import { SVGMap } from '../map/SVGMap';
import { WardDetailModal } from './WardDetailModal';

interface DetailPanelProps {
    localBody: LocalBody;
    onBack: () => void;
    wards: Ward[];
    pollingStations: PollingStation[];
    localBodies: LocalBody[];
    trendData?: TrendResult;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ localBody, onBack, wards, pollingStations, localBodies, trendData }) => {

    const [selectedWard, setSelectedWard] = useState<string | null>(null);

    // SVG Map handles coloring internally now.
    // Preserving logic structure if we ever need to pass raw GeoJSON again, but cleaning up heavy processing.

    const lbWards = wards.filter(w => w.lb_code === localBody.lb_code);

    let totalPollingStations = 0;

    if (localBody.lb_type === 'District Panchayat') {
        // Aggregate polling stations for the entire district
        // User requested to ONLY include Grama Panchayats for District Panchayat count
        const districtGPs = localBodies.filter(lb =>
            lb.district_name === localBody.district_name && lb.lb_type === 'Grama Panchayat'
        );
        const districtGPCodes = new Set(districtGPs.map(lb => lb.lb_code));

        // Count polling stations belonging to these GPs
        totalPollingStations = pollingStations.filter(ps => districtGPCodes.has(ps.lb_code)).length;
    } else {
        // Base tiers and Block Panchayat
        // For Block Panchayat, we now have rows in polling_stations.csv with the Block Code
        const lbPollingStations = pollingStations.filter(ps => ps.lb_code === localBody.lb_code);
        totalPollingStations = lbPollingStations.length;
    }

    const totalVoters = lbWards.reduce((acc, curr) => acc + curr.total_voters, 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 shadow-xl z-30 relative">
            <div className="p-6 border-b border-slate-200 bg-white flex items-center gap-4 shadow-sm">
                <button
                    onClick={onBack}
                    className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-slate-900 truncate tracking-tight">{localBody.lb_name_english}</h2>
                    <p className="text-sm text-slate-500 truncate">Local Body Details</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Map Section */}
                <div className="h-64 w-full bg-slate-200 relative">
                    <SVGMap
                        url={`${import.meta.env.BASE_URL}data/geojson/Kerala/district_wards/${(localBody.district_name === 'Thiruvanathapuram' ? 'Thiruvananthapuram' : localBody.district_name)}/${localBody.lb_code}.svg`}

                        trendData={trendData}
                        onWardClick={(wardNo) => setSelectedWard(wardNo)}
                    />
                </div>

                <div className="p-6">
                    <div className="mb-8 flex flex-wrap gap-2 justify-between items-center">
                        <span className="inline-flex items-center px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100 shadow-sm">
                            {localBody.lb_type} • {localBody.district_name}
                        </span>
                    </div>

                    {/* Election Trends Section */}
                    {trendData && (
                        <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Trophy size={20} className="text-yellow-500" />
                                Election Trends 2025
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Leading Front Banner */}
                                <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                                    <span className="text-xs uppercase font-bold text-slate-500 mb-1">Leading Front</span>
                                    <div className={`text-4xl font-black ${trendData.Leading_Front === 'LDF' ? 'text-red-600' :
                                        trendData.Leading_Front === 'UDF' ? 'text-indigo-600' :
                                            trendData.Leading_Front === 'NDA' ? 'text-orange-600' : 'text-slate-700'
                                        }`}>
                                        {trendData.Leading_Front}
                                    </div>
                                    <span className="text-sm font-medium text-slate-500 mt-2">
                                        {trendData.Wards_Declared} of {localBody.total_wards} Declared
                                    </span>
                                </div>

                                {/* Seat Distribution */}
                                <div className="space-y-3">
                                    <div className="text-sm font-semibold text-slate-600 mb-2">Seat Distribution</div>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'LDF', value: trendData.LDF_Seats, color: 'bg-red-500', text: 'text-red-700' },
                                            { label: 'UDF', value: trendData.UDF_Seats, color: 'bg-indigo-500', text: 'text-indigo-700' },
                                            { label: 'NDA', value: trendData.NDA_Seats, color: 'bg-orange-500', text: 'text-orange-700' },
                                            { label: 'Others', value: trendData.IND_Seats, color: 'bg-slate-400', text: 'text-slate-700' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center gap-3">
                                                <div className="w-12 text-xs font-bold text-slate-500">{item.label}</div>
                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${item.color}`}
                                                        style={{ width: `${(item.value / localBody.total_wards) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className={`w-6 text-sm font-bold text-right ${item.text}`}>{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                        {/* Voters Card - Full width on mobile, spans 2 rows on larger screens */}
                        <div className="sm:row-span-2 p-3 md:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex items-start gap-3 md:gap-4 mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                                    <Vote size={24} />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">Total Voters</p>
                                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{totalVoters.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Gender Split - Pushed to bottom / Expanded */}
                            <div className="mt-auto pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden flex">
                                        <div className="bg-blue-500 h-full" style={{ width: `${(lbWards.reduce((acc, curr) => acc + (curr.male_voters || 0), 0) / totalVoters) * 100}%` }} />
                                        <div className="bg-pink-500 h-full" style={{ width: `${(lbWards.reduce((acc, curr) => acc + (curr.female_voters || 0), 0) / totalVoters) * 100}%` }} />
                                        <div className="bg-slate-400 h-full" style={{ width: `${(lbWards.reduce((acc, curr) => acc + (curr.other_voters || 0), 0) / totalVoters) * 100}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs text-slate-600">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            Male
                                        </span>
                                        <span className="font-semibold">{lbWards.reduce((acc, curr) => acc + (curr.male_voters || 0), 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-600">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                            Female
                                        </span>
                                        <span className="font-semibold">{lbWards.reduce((acc, curr) => acc + (curr.female_voters || 0), 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-600">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                            Others
                                        </span>
                                        <span className="font-semibold">{lbWards.reduce((acc, curr) => acc + (curr.other_voters || 0), 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Polling Stations Card */}
                        <div className="p-3 md:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 md:gap-4 h-full">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">Polling Stations</p>
                                    <p className="text-lg md:text-2xl font-bold text-slate-900">{totalPollingStations.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Wards Card */}
                        <div className="p-3 md:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 md:gap-4 h-full">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">Total Wards</p>
                                    <p className="text-lg md:text-2xl font-bold text-slate-900">{localBody.total_wards}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Users size={20} className="text-slate-400" />
                            Ward Breakdown
                        </h3>
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-inner p-4 overflow-hidden">
                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {lbWards.map((ward) => {
                                        const trendWard = trendData?.wardInfo?.[String(ward.ward_no)];
                                        const winner = trendWard?.winner;

                                        // Logic copied from WardDetailModal for consistency
                                        const topCandidate = trendWard?.candidates?.[0];

                                        const isUncontested = trendWard?.candidates?.length === 1;
                                        const isHung = trendWard?.isHung;
                                        const isTieBreak = trendWard?.isTieBreak;

                                        const isImplicitLead = !winner && !trendWard?.leading && topCandidate && (topCandidate.votes > 0 || isUncontested);
                                        const leader = trendWard?.leading || (isImplicitLead ? topCandidate : undefined);

                                        const displayResult = isHung ? null : (winner || leader || topCandidate);

                                        // Determine styling based on status
                                        let borderColor = 'border-l-4 border-l-slate-300';
                                        let statusBadge = null;

                                        if (isHung) {
                                            borderColor = 'border-l-4 border-l-purple-600';
                                            statusBadge = <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">HUNG</span>;
                                        } else if (winner) {
                                            borderColor = winner.group === 'LDF' ? 'border-l-4 border-l-red-500' :
                                                winner.group === 'UDF' ? 'border-l-4 border-l-indigo-500' :
                                                    winner.group === 'NDA' ? 'border-l-4 border-l-orange-500' :
                                                        'border-l-4 border-l-slate-500';

                                            if (isTieBreak) {
                                                statusBadge = <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-200">WON (TIE)</span>;
                                            } else {
                                                statusBadge = <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">WON</span>;
                                            }
                                        } else if (leader) {
                                            borderColor = leader.group === 'LDF' ? 'border-l-4 border-l-red-400' :
                                                leader.group === 'UDF' ? 'border-l-4 border-l-indigo-400' :
                                                    leader.group === 'NDA' ? 'border-l-4 border-l-orange-400' :
                                                        'border-l-4 border-l-slate-400';
                                            statusBadge = <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">LEAD</span>;
                                        }

                                        // Text Color for Party/Group
                                        const groupColor =
                                            displayResult?.group === 'LDF' ? 'text-red-700' :
                                                displayResult?.group === 'UDF' ? 'text-indigo-700' :
                                                    displayResult?.group === 'NDA' ? 'text-orange-700' :
                                                        'text-slate-600';

                                        return (
                                            <div
                                                key={ward.ward_code}
                                                onClick={() => setSelectedWard(String(ward.ward_no))}
                                                className={`bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${borderColor}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ward {ward.ward_no}</div>
                                                        <div className="font-semibold text-slate-900 text-sm line-clamp-1" title={ward.ward_name_english}>{ward.ward_name_english}</div>
                                                    </div>
                                                    {statusBadge}
                                                </div>

                                                {trendData ? (
                                                    <div className="bg-slate-50 rounded p-2 text-xs">
                                                        {isHung ? (
                                                            <div className="flex items-center justify-between font-bold text-purple-700">
                                                                <span>TIED</span>
                                                            </div>
                                                        ) : displayResult ? (
                                                            <div className="flex items-center justify-between">
                                                                <span className={`font-bold truncate w-full ${groupColor}`}>{displayResult.name}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-slate-400 italic text-center text-[10px]">No Result</div>
                                                        )}
                                                        {(!isHung && displayResult) && (
                                                            <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                                                                <span>{displayResult.party}</span>
                                                                <span>{displayResult.group}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 text-right">
                                                        <span className="text-xs text-slate-400">Voters: </span>
                                                        <span className="text-xs font-mono font-medium text-slate-600">{ward.total_voters.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <WardDetailModal
                isOpen={!!selectedWard}
                onClose={() => setSelectedWard(null)}
                wardNo={selectedWard}
                trendData={trendData}
            />
        </div>
    );
};
