import Papa from 'papaparse';

export interface LocalBody {
    lb_code: string;
    lb_name_english: string;
    lb_type: string;
    district_name: string;
    total_wards: number;
}

export interface Ward {
    ward_code: string;
    ward_name_english: string;
    ward_no: number;
    lb_code: string;
    total_voters: number;
}

export interface PollingStation {
    ps_no: number;
    ps_name: string;
    ward_code: string;
    lb_code: string;
    total_voters: number;
}

const BASE_URL = import.meta.env.BASE_URL;

export const fetchLocalBodies = async (): Promise<LocalBody[]> => {
    const response = await fetch(`${BASE_URL}data/csv/local_bodies.csv`);
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                const localBodies = data
                    .filter((row) => row['Local Body Code'])
                    .map((row) => ({
                        lb_code: row['Local Body Code'],
                        lb_name_english: row['Local Body Name'],
                        lb_type: row['Local Body Type'],
                        district_name: row['District'],
                        total_wards: parseInt(row['Ward Count'] || '0', 10),
                    }));
                resolve(localBodies);
            },
            error: (error: any) => reject(error),
        });
    });
};

export const fetchWards = async (): Promise<Ward[]> => {
    const response = await fetch(`${BASE_URL}data/csv/wards.csv`);
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                const wards = data
                    .filter((row) => row['Ward Code'])
                    .map((row) => ({
                        ward_code: row['Ward Code'],
                        ward_name_english: row['Ward Name'],
                        ward_no: parseInt(row['Ward Code'].slice(-3), 10),
                        lb_code: row['Local Body Code'],
                        total_voters: parseInt(row['Total'] || '0', 10),
                    }));
                resolve(wards);
            },
            error: (error: any) => reject(error),
        });
    });
};

export const fetchPollingStations = async (): Promise<PollingStation[]> => {
    const response = await fetch(`${BASE_URL}data/csv/polling_stations.csv`);
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                const stations = data
                    .map((row) => ({
                        ps_no: parseInt(row['PS No'] || '0', 10),
                        ps_name: row['PS Name'] || '',
                        ward_code: row['Ward Code'] || '',
                        lb_code: row['Local Body Code'] || '',
                        total_voters: 0, // Not available in this CSV
                    }))
                    .filter((item) => item.lb_code); // Filter by LB Code instead of PS No
                resolve(stations);
            },
            error: (error: any) => reject(error),
        });
    });
};

export const fetchGeoJSON = async (district: string, type: string, name: string) => {
    const url = `${BASE_URL}data/geojson/${district}/${type}/${name}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('GeoJSON not found');
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch GeoJSON for ${name} (${type}, ${district})`, error);
        return null;
    }
};
