#!/usr/bin/env python3

import json
import time
from crawler import filter_network_packet

def get_pharmacies_for_state(state):
    print(f"{state['name']} için eczane bilgileri çekiliyor...")
    
    url = f"https://www.aponet.de/apotheke/notdienstsuche/{state['name']}/%20/25"
    regex = r"https://www\.aponet\.de/apotheke/notdienstsuche\?tx_aponetpharmacy_search"
    
    try:
        res = filter_network_packet(url, regex)
        
        if res and res.status_code == 200:
            try:
                data = res.json()
                
                # Debug için veriyi kaydet
                with open(f'debug_{state["name"]}.json', 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=4)
                
                if 'results' in data and 'apotheken' in data['results'] and 'apotheke' in data['results']['apotheken']:
                    pharmacies = []
                    for pharmacy in data['results']['apotheken']['apotheke']:
                        pharmacies.append({
                            'eczaneAdi': pharmacy.get('name', ''),
                            'adres': f"{pharmacy.get('strasse', '')}, {pharmacy.get('plz', '')} {pharmacy.get('ort', '')}",
                            'telefon': pharmacy.get('telefon', ''),
                            'enlem': pharmacy.get('latitude', ''),
                            'boylam': pharmacy.get('longitude', ''),
                            'mesafe': f"{float(pharmacy.get('distanz', 0)):.1f} km"
                        })
                    print(f"{state['name']} için {len(pharmacies)} eczane bulundu.")
                    return pharmacies
                else:
                    print(f"Uyarı: {state['name']} için veri yapısı beklenen formatta değil.")
                    return []
            except json.JSONDecodeError:
                print(f"Hata: {state['name']} için yanıt JSON formatında değil.")
                return []
        else:
            print(f"Hata: {state['name']} için istek başarısız oldu. Durum kodu: {res.status_code if res else 'Yanıt yok'}")
            return []
    except Exception as e:
        print(f"{state['name']} için hata: {str(e)}")
        return []

def main():
    states = [
        {"name": "Berlin", "plz": "14193"},
        {"name": "Nordrhein-Westfalen", "plz": "40213"},
        {"name": "Hamburg", "plz": "20095"},
        {"name": "Baden-Württemberg", "plz": "70173"},
        {"name": "Bayern", "plz": "80331"},
        {"name": "Brandenburg", "plz": "14467"},
        {"name": "Bremen", "plz": "28195"},
        {"name": "Hessen", "plz": "60311"},
        {"name": "Mecklenburg-Vorpommern", "plz": "19053"},
        {"name": "Niedersachsen", "plz": "30159"},
        {"name": "Rheinland-Pfalz", "plz": "55116"},
        {"name": "Saarland", "plz": "66111"},
        {"name": "Sachsen", "plz": "01067"},
        {"name": "Sachsen-Anhalt", "plz": "39104"},
        {"name": "Schleswig-Holstein", "plz": "24103"},
        {"name": "Thüringen", "plz": "99084"}
    ]
    
    all_pharmacies = {}
    
    # Mevcut eczaneler.json dosyasını yükle (varsa)
    try:
        with open('eczaneler.json', 'r', encoding='utf-8') as f:
            all_pharmacies = json.load(f)
        print("Mevcut eczaneler.json dosyası yüklendi.")
    except (FileNotFoundError, json.JSONDecodeError):
        print("Mevcut eczaneler.json dosyası bulunamadı veya geçersiz. Yeni dosya oluşturulacak.")
    
    for state in states:
        # Eğer bu eyalet için veri zaten varsa, atla
        if state['name'] in all_pharmacies and all_pharmacies[state['name']]:
            print(f"{state['name']} için veri zaten mevcut. Atlanıyor.")
            continue
            
        pharmacies = get_pharmacies_for_state(state)
        all_pharmacies[state['name']] = pharmacies
        
        # Her eyaletten sonra dosyayı kaydet (bir hata durumunda veri kaybını önlemek için)
        with open('eczaneler.json', 'w', encoding='utf-8') as f:
            json.dump(all_pharmacies, f, ensure_ascii=False, indent=2)
        
        # Sunucuyu aşırı yüklememek için her istek arasında biraz bekle
        time.sleep(5)
    
    print('Tüm eczane bilgileri eczaneler.json dosyasına kaydedildi.')

if __name__ == "__main__":
    main()
