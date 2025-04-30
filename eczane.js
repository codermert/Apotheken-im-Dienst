const axios = require('axios');
const fs = require('fs');

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'DNT': '1',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"'
};

const states = [
    { name: 'Berlin', plz: '14193' },
    { name: 'Nordrhein-Westfalen', plz: '40213' },
    { name: 'Hamburg', plz: '20095' },
    { name: 'Baden-Württemberg', plz: '70173' },
    { name: 'Bayern', plz: '80331' },
    { name: 'Brandenburg', plz: '14467' },
    { name: 'Bremen', plz: '28195' },
    { name: 'Hessen', plz: '60311' },
    { name: 'Mecklenburg-Vorpommern', plz: '19053' },
    { name: 'Niedersachsen', plz: '30159' },
    { name: 'Rheinland-Pfalz', plz: '55116' },
    { name: 'Saarland', plz: '66111' },
    { name: 'Sachsen', plz: '01067' },
    { name: 'Sachsen-Anhalt', plz: '39104' },
    { name: 'Schleswig-Holstein', plz: '24103' },
    { name: 'Thüringen', plz: '99084' }
];

async function getPharmaciesForState(state) {
    try {
        const url = `https://www.aponet.de/apotheke/notdienstsuche?tx_aponetpharmacy_search%5Baction%5D=result&tx_aponetpharmacy_search%5Bcontroller%5D=Search&tx_aponetpharmacy_search%5Bsearch%5D%5Bplzort%5D=${state.plz}&tx_aponetpharmacy_search%5Bsearch%5D%5Bdate%5D=&tx_aponetpharmacy_search%5Bsearch%5D%5Bstreet%5D=&tx_aponetpharmacy_search%5Bsearch%5D%5Bradius%5D=25&tx_aponetpharmacy_search%5Bsearch%5D%5Blat%5D=&tx_aponetpharmacy_search%5Bsearch%5D%5Blng%5D=&tx_aponetpharmacy_search%5Btoken%5D=216823d96ea25c051509d935955c130fbc72680fc1d3040fe3f8ca0e25f9cd02&type=1981`;
        
        const response = await axios.get(url, { headers });
        const data = response.data;
        
        return data.results.apotheken.apotheke.map(pharmacy => ({
            eczaneAdi: pharmacy.name,
            adres: `${pharmacy.strasse}, ${pharmacy.plz} ${pharmacy.ort}`,
            telefon: pharmacy.telefon,
            enlem: pharmacy.latitude,
            boylam: pharmacy.longitude,
            mesafe: `${parseFloat(pharmacy.distanz).toFixed(1)} km`
        }));
        
    } catch (error) {
        console.error(`${state.name} için hata:`, error.message);
        return [];
    }
}

async function getAllPharmacies() {
    const allPharmacies = {};
    
    for (const state of states) {
        console.log(`${state.name} için eczane bilgileri çekiliyor...`);
        const pharmacies = await getPharmaciesForState(state);
        allPharmacies[state.name] = pharmacies;
        console.log(`${state.name} için ${pharmacies.length} eczane bulundu.`);
    }
    
    fs.writeFileSync('eczaneler.json', JSON.stringify(allPharmacies, null, 2), 'utf8');
    console.log('Tüm eczane bilgileri eczaneler.json dosyasına kaydedildi.');
}

getAllPharmacies();
