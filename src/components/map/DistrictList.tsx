import React from 'react';

interface DistrictListProps {
    onSelectDistrict: (district: string) => void;
}

const districts = [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
    'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
].sort();

export const DistrictList: React.FC<DistrictListProps> = ({ onSelectDistrict }) => {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Select a District</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {districts.map(district => (
                    <button
                        key={district}
                        onClick={() => onSelectDistrict(district)}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                    >
                        <span className="text-lg font-medium text-slate-700 group-hover:text-blue-600">
                            {district}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
