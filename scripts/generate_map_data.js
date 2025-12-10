import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../public/data/geojson');
const OUTPUT_FILE = path.join(__dirname, '../public/data/map_data.json');

// Function to find district geojson files
// We assume structure: DistrictName/District Panchayat/DistrictName.json
// Or we can just look for any file that looks like a district boundary.
// Actually, let's look for "District Panchayat" folder in each district folder.

const generateMapData = () => {
    if (!fs.existsSync(DATA_DIR)) {
        console.error('GeoJSON directory not found:', DATA_DIR);
        return;
    }

    const districts = fs.readdirSync(DATA_DIR).filter(file => fs.statSync(path.join(DATA_DIR, file)).isDirectory());
    const features = [];

    for (const district of districts) {
        const districtPanchayatDir = path.join(DATA_DIR, district, 'District Panchayat');
        if (fs.existsSync(districtPanchayatDir)) {
            const files = fs.readdirSync(districtPanchayatDir);
            // Assuming the file name matches the district name or is the only json file
            const jsonFile = files.find(f => f.endsWith('.json'));
            if (jsonFile) {
                const filePath = path.join(districtPanchayatDir, jsonFile);
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const geojson = JSON.parse(content);

                    // The App expects data.choropleth array with { name, geometry (stringified), group, metadata }
                    // But standard GeoJSON is FeatureCollection.
                    // Let's adapt to what App.tsx expects or change App.tsx.
                    // App.tsx expects:
                    // const features = data.choropleth.map((item: any) => {
                    //   return { type: 'Feature', geometry: JSON.parse(item.geometry), properties: { name: item.name ... } }
                    // })

                    // Let's extract the geometry from the district geojson.
                    // Assuming the district geojson is a FeatureCollection with one feature or a Feature.

                    let geometry = null;
                    if (geojson.type === 'FeatureCollection' && geojson.features.length > 0) {
                        geometry = geojson.features[0].geometry;
                    } else if (geojson.type === 'Feature') {
                        geometry = geojson.geometry;
                    }

                    if (geometry) {
                        features.push({
                            name: district,
                            group: 'District',
                            geometry: JSON.stringify(geometry),
                            metadata: { type: 'District' }
                        });
                    }
                } catch (e) {
                    console.error(`Error reading ${filePath}:`, e);
                }
            }
        }
    }

    const output = {
        choropleth: features
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`Generated map_data.json with ${features.length} districts at ${OUTPUT_FILE}`);
};

generateMapData();
