import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MapDashboard } from '../../../components/map/MapDashboard';
import { useLocalBody } from '../../../services/data';
import { useMemo } from 'react';

export const Route = createFileRoute('/map/details/$lbCode')({
  component: MapDetailsRoute,
});

function MapDetailsRoute() {
  const { lbCode } = Route.useParams();
  const navigate = useNavigate();
  const { data: localBodies = [] } = useLocalBody();

  const selectedLB = useMemo(() => localBodies.find(lb => lb.lb_code === lbCode), [localBodies, lbCode]);
  const districtName = selectedLB?.district_name;

  const handleBackToDistrict = () => {
    if (districtName) {
      navigate({
        to: '/map/district/$districtName',
        params: { districtName },
      });
    } else {
      navigate({ to: '/map' });
    }
  };

  return (
    <MapDashboard
      lbCode={lbCode}
      districtName={districtName}
      onBackToDistrict={handleBackToDistrict}
    />
  );
}
