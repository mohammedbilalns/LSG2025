import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MapDashboard } from '../../../components/map/MapDashboard';

export const Route = createFileRoute('/map/district/$districtName')({
  component: MapDistrictRoute,
});

function MapDistrictRoute() {
  const { districtName } = Route.useParams();
  const navigate = useNavigate();

  const handleSelectLB = (lbCode: string) => {
    navigate({
      to: '/map/details/$lbCode',
      params: { lbCode },
    });
  };

  const handleBackToState = () => {
    navigate({
      to: '/map',
    });
  };

  return (
    <MapDashboard
      districtName={districtName}
      onSelectLB={handleSelectLB}
      onBackToState={handleBackToState}
    />
  );
}
