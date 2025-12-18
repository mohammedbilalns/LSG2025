import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MapDashboard } from '../../components/map/MapDashboard';

export const Route = createFileRoute('/map/')({
    component: MapIndexRoute,
});

function MapIndexRoute() {
    const navigate = useNavigate();

    const handleSelectDistrict = (districtName: string) => {
        navigate({
            to: '/map/district/$districtName',
            params: { districtName },
        });
    };

    return (
        <MapDashboard
            onSelectDistrict={handleSelectDistrict}
        />
    );
}
