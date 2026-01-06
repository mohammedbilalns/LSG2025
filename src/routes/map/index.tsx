import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MapDashboard } from '../../components/map/MapDashboard';
import { localBodyQueryOptions, trendResultsQueryOptions } from '../../services/data';

export const Route = createFileRoute('/map/')({
    component: MapIndexRoute,
    loader: ({ context: { queryClient } }) => {
        return Promise.all([
            queryClient.ensureQueryData(localBodyQueryOptions),
            queryClient.ensureQueryData(trendResultsQueryOptions),
        ]);
    },
});

function MapIndexRoute() {
    const navigate = useNavigate();
    const [localBodies, trendResults] = Route.useLoaderData();

    const handleSelectDistrict = (districtName: string) => {
        navigate({
            to: '/map/district/$districtName',
            params: { districtName },
        });
    };

    return (
        <MapDashboard
            localBodies={localBodies}
            trendResults={trendResults}
            onSelectDistrict={handleSelectDistrict}
        />
    );
}
