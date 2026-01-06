import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router';
import { DetailPanel } from '../../components/details/DetailPanel';
import { localBodyQueryOptions, wardsQueryOptions, pollingStationsQueryOptions, trendResultsQueryOptions } from '../../services/data';

export const Route = createFileRoute('/details/$lbCode')({
  component: DetailsRoute,
  loader: async ({ context: { queryClient }, params }) => {
    const data = await Promise.all([
      queryClient.ensureQueryData(localBodyQueryOptions),
      queryClient.ensureQueryData(wardsQueryOptions),
      queryClient.ensureQueryData(pollingStationsQueryOptions),
      queryClient.ensureQueryData(trendResultsQueryOptions),
    ]);

    const [localBodies] = data;
    const lb = localBodies.find((item) => item.lb_code.toString() === params.lbCode);

    if (!lb) {
      throw notFound();
    }

    return data;
  }
});

function DetailsRoute() {
  const { lbCode } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });

  const [localBodies, wards, pollingStations, trendResults] = Route.useLoaderData()

  const selectedLocalBody = localBodies.find(
    (lb) => lb.lb_code.toString() === lbCode
  );

  const handleBack = () => {
    // Navigate back to data dashboard
    navigate({ to: '/data' });
  };

  if (!selectedLocalBody) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DetailPanel
      localBody={selectedLocalBody}
      onBack={handleBack}
      wards={wards}
      pollingStations={pollingStations}
      localBodies={localBodies}
      trendData={trendResults.find(
        (t) => t.LB_Code === selectedLocalBody.lb_code
      )}
    />
  );
}
