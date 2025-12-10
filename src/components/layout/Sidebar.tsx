import React, { useState } from 'react';
import { KPIGrid } from '../dashboard/KPIGrid';
import type { LocalBody, Ward, PollingStation } from '../../services/dataService';
import { Search } from 'lucide-react';
import { DetailPanel } from '../details/DetailPanel';

interface SidebarProps {
    counts: any;
    selectedKPI: string | null;
    onSelectKPI: (kpi: string | null) => void;
    localBodies: LocalBody[];
    onSelectLocalBody: (lb: LocalBody) => void;
    selectedLocalBody: LocalBody | null;
    onClearSelection: () => void;
    wards: Ward[];
    pollingStations: PollingStation[];
}

export const Sidebar: React.FC<SidebarProps> = ({
    counts,
    selectedKPI,
    onSelectKPI,
    localBodies,
    onSelectLocalBody,
    selectedLocalBody,
    onClearSelection,
    wards,
    pollingStations,
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (selectedLocalBody) {
        return (
            <DetailPanel
                localBody={selectedLocalBody}
                onBack={onClearSelection}
                wards={wards}
                pollingStations={pollingStations}
            />
        );
    }

    const filteredLocalBodies = localBodies.filter((lb) =>
        lb.lb_name_english.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-1/3 h-full bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden shadow-xl z-20 relative">
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kerala Election Portal</h1>
                    <p className="text-slate-500 mt-1">Real-time election data visualization</p>
                </div>

                <KPIGrid
                    counts={counts}
                    selectedKPI={selectedKPI}
                    onSelectKPI={onSelectKPI}
                />

                <div className="mb-6 sticky top-0 bg-slate-50 pt-2 pb-4 z-10">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search Local Bodies..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {filteredLocalBodies.slice(0, 50).map((lb) => (
                        <div
                            key={lb.lb_code}
                            onClick={() => onSelectLocalBody(lb)}
                            className="group p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                        {lb.lb_name_english}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors"></span>
                                        {lb.lb_type}
                                    </p>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    {lb.district_name}
                                </span>
                            </div>
                        </div>
                    ))}
                    {filteredLocalBodies.length > 50 && (
                        <p className="text-center text-slate-400 text-sm mt-6 font-medium">
                            Showing 50 of {filteredLocalBodies.length} results
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
