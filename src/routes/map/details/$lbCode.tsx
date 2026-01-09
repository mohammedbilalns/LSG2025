import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router';
import { MapDashboard } from '../../../components/map/MapDashboard';
import { useMemo } from 'react';
import { localBodyQueryOptions, trendResultsQueryOptions } from '../../../services/data';

export const Route = createFileRoute('/map/details/$lbCode')({
  component: MapDetailsRoute,
  loader: async ({ context: { queryClient }, params }) => {
    const data = await Promise.all([
      queryClient.ensureQueryData(localBodyQueryOptions),
      queryClient.ensureQueryData(trendResultsQueryOptions),
    ]);

    const [localBodies] = data;
    const lbExists = localBodies.some(lb => lb.lb_code.toString() === params.lbCode);

    if (!lbExists) {
      throw notFound();
    }

    return data;
  },
});

function MapDetailsRoute() {
  const { lbCode } = Route.useParams();
  const navigate = useNavigate();
  const [localBodies, trendResults] = Route.useLoaderData()

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
      localBodies={localBodies}
      trendResults={trendResults}
      lbCode={lbCode}
      districtName={districtName}
      onBackToDistrict={handleBackToDistrict}
    />
  );
}
