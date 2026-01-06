import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router';
import { MapDashboard } from '../../../components/map/MapDashboard';
import { localBodyQueryOptions, trendResultsQueryOptions } from '../../../services/data';
import { DISTRICTS } from '../../../constants';

export const Route = createFileRoute('/map/district/$districtName')({
  component: MapDistrictRoute,
  loader: async ({ context: { queryClient }, params }) => {
    const data = await Promise.all([
      queryClient.ensureQueryData(localBodyQueryOptions),
      queryClient.ensureQueryData(trendResultsQueryOptions),
    ]);

    const districtExists = DISTRICTS.includes(params.districtName);

    if (!districtExists) {
      throw notFound();
    }

    return data;
  },
});

function MapDistrictRoute() {
  const { districtName } = Route.useParams();
  const navigate = useNavigate();
  const [localBodies, trendResults] = Route.useLoaderData();

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
      localBodies={localBodies}
      trendResults={trendResults}
      districtName={districtName}
      onSelectLB={handleSelectLB}
      onBackToState={handleBackToState}
    />
  );
}
