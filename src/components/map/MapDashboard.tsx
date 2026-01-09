import React from "react";
const DistrictMap = React.lazy(() =>
  import("./DistrictMap").then((m) => ({ default: m.DistrictMap })),
);
const StateMap = React.lazy(() =>
  import("./StateMap").then((m) => ({ default: m.StateMap })),
);
const LocalBodyTrendMap = React.lazy(() =>
  import("./LocalBodyTrendMap").then((m) => ({ default: m.LocalBodyTrendMap })),
);
import type { LocalBody, TrendResult } from "../../services/dataService";

interface MapDashboardProps {
  localBodies: LocalBody[];
  trendResults: TrendResult[];
  districtName?: string;
  lbCode?: string;
  onSelectDistrict?: (districtName: string) => void;
  onSelectLB?: (lbCode: string) => void;
  onBackToDistrict?: () => void;
  onBackToState?: () => void;
}

export const MapDashboard: React.FC<MapDashboardProps> = ({
  districtName,
  lbCode,
  onSelectDistrict,
  onSelectLB,
  onBackToDistrict,
  onBackToState,
  localBodies,
  trendResults,
}) => {
  // Derived view state:
  // If lbCode -> 'map' (Specific LB View)
  // Else If districtName -> 'lbs' (District View)
  // Else -> 'districts' (State View)

  const view = lbCode ? "map" : districtName ? "lbs" : "districts";
  const selectedDistrict = districtName || null;

  const selectedLB = lbCode
    ? localBodies.find((lb) => lb.lb_code === lbCode) || null
    : null;

  // Handlers - prefer props, fallback to console/noop if not provided 
  const handleStateMapSelection = (
    _lbCode: string,
    dName: string,
    _type: string,
  ) => {
    onSelectDistrict?.(dName);
  };

  const handleSelectLBByCode = (code: string) => {
    onSelectLB?.(code);
  };

  const noop = () => { };

  return (
    <div className="h-full">
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        {view === "districts" && (
          <StateMap
            trends={trendResults}
            localBodies={localBodies}
            onSelectLB={handleStateMapSelection}
          />
        )}

        {view === "lbs" && selectedDistrict && (
          <DistrictMap
            districtName={selectedDistrict}
            onSelectLB={handleSelectLBByCode}
            onBack={onBackToState || noop}
            localBodies={localBodies.filter(
              (lb) => lb.district_name === selectedDistrict,
            )}
            trends={trendResults}
          />
        )}

        {view === "map" && selectedLB && selectedDistrict && (
          <LocalBodyTrendMap
            lbName={selectedLB.lb_name_english}
            lbCode={selectedLB.lb_code}
            districtName={selectedDistrict}
            lbType={selectedLB.lb_type}
            totalWards={selectedLB.total_wards}
            trendData={trendResults.find(
              (t) => t.LB_Code === selectedLB.lb_code,
            )}
            onBack={onBackToDistrict || noop}
          />
        )}

        {/* Error Handling for Not Found LB/District? */}
        {view === 'map' && !selectedLB && (
          <div className="flex items-center justify-center h-full text-slate-500">
            Local Body Not Found or Loading...
          </div>
        )}
      </React.Suspense>
    </div>
  );
};
