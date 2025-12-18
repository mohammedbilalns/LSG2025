import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { DetailPanel } from '../../components/details/DetailPanel';
import {
  useLocalBody,
  useWards,
  usePollingStations,
  useTrendResults,
} from '../../services/data';

export const Route = createFileRoute('/details/$lbCode')({
  component: DetailsRoute,
});

function DetailsRoute() {
  const { lbCode } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: localBodies = [] } = useLocalBody();
  const { data: wards = [] } = useWards();
  const { data: pollingStations = [] } = usePollingStations();
  const { data: trendResults = [] } = useTrendResults();

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
