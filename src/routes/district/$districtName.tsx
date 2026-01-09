import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router';
import { DistrictDrillDown } from '../../components/dashboard/DistrictDrillDown';
import { type LocalBody } from '../../services/dataService';
import { localBodyQueryOptions } from '../../services/data';
import { DISTRICTS, VALID_FILTER_TYPES } from '../../constants';

type DistrictSearch = {
  type: string;
};


export const Route = createFileRoute('/district/$districtName')({
  component: DistrictDrillDownRoute,
  validateSearch: (search: Record<string, unknown>): DistrictSearch => {
    const type = String(search.type);
    return {
      type: VALID_FILTER_TYPES.includes(type) ? type : 'Local Bodies',
    };
  },
  loader: async ({ context: { queryClient }, params }) => {
    const localBodies = await queryClient.ensureQueryData(localBodyQueryOptions);

    // Validate District
    if (params.districtName !== 'Kerala') {
      const districtExists = DISTRICTS.some(district => district === params.districtName);
      if (!districtExists) {
        throw notFound();
      }
    }

    return localBodies;
  },
});

function DistrictDrillDownRoute() {
  const { districtName } = Route.useParams();
  const { type } = Route.useSearch();
  const navigate = useNavigate();
  const localBodies = Route.useLoaderData();

  const handleBack = () => {
    navigate({ to: '/data' });
  };

  const handleSelectLocalBody = (lb: LocalBody) => {
    navigate({
      to: '/details/$lbCode',
      params: { lbCode: lb.lb_code.toString() },
    });
  };

  const drillDownLocalBodies = localBodies.filter((lb) => {
    let typeFilter = '';
    switch (type) {
      case 'Corporations':
        typeFilter = 'Municipal Corporation';
        break;
      case 'Municipalities':
        typeFilter = 'Municipality';
        break;
      case 'Grama Panchayats':
        typeFilter = 'Grama Panchayat';
        break;
      case 'Block Panchayats':
        typeFilter = 'Block Panchayat';
        break;
      case 'District Panchayats':
        typeFilter = 'District Panchayat';
        break;
      default:
        typeFilter = type;
    }

    if (districtName === 'Kerala') {
      return lb.lb_type === typeFilter;
    }

    return lb.district_name === districtName && lb.lb_type === typeFilter;
  });

  return (
    <DistrictDrillDown
      district={districtName}
      type={type}
      localBodies={drillDownLocalBodies}
      onBack={handleBack}
      onSelectLocalBody={handleSelectLocalBody}
    />
  );
}
