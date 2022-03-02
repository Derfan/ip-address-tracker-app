const elements = {
    input: document.querySelector('[data-search-input]'),
    form: document.querySelector('[data-form]'),
    card: document.querySelector('[data-result]'),
};

const MAP_HOST_URL = "https://api.maptiler.com/maps/voyager/{z}/{x}/{y}.png?key={key}";
const IP_ADDRESS_API_URL = "https://geo.ipify.org/api/v2/country?apiKey=at_ysfQlLHdQuefEP7xkYlb8krrg44BS";
const GEO_API_URL = "https://nominatim.openstreetmap.org/search?format=json";

const NA = 'N/A';

const { map, customIcon, initialMarker } = initMap();
let currentMarker = initialMarker;

elements.form.addEventListener('submit', handleIpAddress);

async function handleIpAddress(event) {
    event.preventDefault();

    try {
        const response = await fetch(`${IP_ADDRESS_API_URL}&ipAddress=${elements.input.value}`);
        const { ip, isp, location: { country, region, timezone } } = await response.json();
        const data = await fetch(`${GEO_API_URL}&q=${isp},${region},${country}`).then(res => res.json());

        if (!data?.length) {
            throw new Error('Address Not found');
        }

        currentMarker.remove();
        showResultValues({
            ipAddress: ip || NA,
            location: `${region}, ${country}`,
            timezone: timezone ? `UTC ${timezone}` : NA,
            isp: isp || data[0].display_name || NA
        });
        currentMarker = showResultOnMap(data[0]);
        window.scrollTo({ top: elements.card.getBoundingClientRect().top, behavior: 'smooth'});
    } catch (e) {
        alert(e.message);
    }
}

function initMap() {
    const initialChords = [51.505, -0.09];
    const map = L.map('map', { center: initialChords, zoom: 15, zoomControl: false });
    const icon = L.icon({
        iconUrl: 'images/icon-location.svg',
        iconSize: [46, 56],
        iconAnchor: [23, 56],
    });

    L.tileLayer(MAP_HOST_URL, { key: 'ZUYaP2TGQfVaoSiTDT3i' }).addTo(map);
    const initialMarker = L.marker(initialChords, { icon }).addTo(map);

    return { map, customIcon: icon, initialMarker };
}

function showResultValues(params) {
    [...elements.card.children].forEach(element => {
        const target = element.querySelector('[data-result]');
        const key = target.dataset.result;

        target.innerHTML = params[key];
    });
}

function showResultOnMap({ lat, lon }) {
    const chords = [lat, lon];
    const marker = L.marker(chords, { icon: customIcon }).addTo(map);

    map.flyTo(chords, 15);

    return marker;
}
