import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { LineStringInfoControl, MultiLineInfoControl, PointInfoControl, DrawNamedLineMode } from '../src';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import customMapStyles from './map-style';
import './style.css';

const mapEl = document.createElement('div');
mapEl.setAttribute('id', 'map');
document.body.appendChild(mapEl);

mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/wabson/ciw0ilw4300ar2knntbjcqg14',
    center: [-0.315, 51.445],
    zoom: 14
});
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

DrawNamedLineMode.showNamePrompt = true;

var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        point: true,
        line_string: true,
        trash: true
    },
    modes: Object.assign({}, MapboxDraw.modes, {'draw_line_string': DrawNamedLineMode}),
    styles: customMapStyles
});

map.on('load', () => {
    map.addControl(draw);
    map.addControl(new LineStringInfoControl({
        distanceUnits: 'kilometers',
        drawControl: draw,
        featureTypes: [
            { name: 'Footpath', value: 'footpath' },
            { name: 'Cycle route', value: 'cycle_route' },
            { name: 'Road', value: 'road' }
        ],
        editProperties: [
            {
                name: 'name',
                label: 'Name'
            },
            {
                name: 'description',
                label: 'Description'
            }
        ],
        defaultTitle: 'Untitled'
    }));
    map.addControl(new PointInfoControl({
        drawControl: draw,
        featureTypes: [
            { name: 'Bus stop', value: 'bus_stop' },
            { name: 'Train station', value: 'train_station' },
            { name: 'Car park', value: 'car_park' }
        ],
        editProperties: [
            {
                name: 'name',
                label: 'Name'
            },
            {
                name: 'description',
                label: 'Description'
            }
        ],
        defaultTitle: 'Untitled'
    }));
    map.addControl(new MultiLineInfoControl({drawControl: draw}));
});