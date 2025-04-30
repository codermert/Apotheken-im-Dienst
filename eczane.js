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

function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function getPharmacies() {
    try {
        const url = 'https://www.aponet.de/apotheke/notdienstsuche?tx_aponetpharmacy_search%5Baction%5D=result&tx_aponetpharmacy_search%5Bcontroller%5D=Search&tx_aponetpharmacy_search%5Bsearch%5D%5Bplzort%5D=14193+Berlin+Dahlem&tx_aponetpharmacy_search%5Bsearch%5D%5Bdate%5D=&tx_aponetpharmacy_search%5Bsearch%5D%5Bstreet%5D=&tx_aponetpharmacy_search%5Bsearch%5D%5Bradius%5D=25&tx_aponetpharmacy_search%5Bsearch%5D%5Blat%5D=&tx_aponetpharmacy_search%5Bsearch%5D%5Blng%5D=&tx_aponetpharmacy_search%5Btoken%5D=216823d96ea25c051509d935955c130fbc72680fc1d3040fe3f8ca0e25f9cd02&type=1981';
        
        const response = await axios.get(url, { headers });
        const data = response.data;
        
        const pharmacies = data.results.apotheken.apotheke.map(pharmacy => ({
            il: 'Berlin',
            eczaneAdi: pharmacy.name,
            adres: `${pharmacy.strasse}, ${pharmacy.plz} ${pharmacy.ort}`,
            telefon: pharmacy.telefon,
            enlem: pharmacy.latitude,
            boylam: pharmacy.longitude,
            mesafe: `${parseFloat(pharmacy.distanz).toFixed(1)} km`
        }));
        
        fs.writeFileSync('eczaneler.json', JSON.stringify(pharmacies, null, 2), 'utf8');
        console.log('Eczane bilgileri eczaneler.json dosyasına kaydedildi.');
        
    } catch (error) {
        console.error('Hata:', error.message);
    }
}

getPharmacies();
