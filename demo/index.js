import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import { LineStringInfoControl, PointInfoControl } from '../src/controls';
import { DrawNamedLineMode } from '../src/modes';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './style.css';

const mapEl = document.createElement('div');
mapEl.setAttribute('id', 'map');
document.body.appendChild(mapEl);

mapboxgl.accessToken = 'pk.eyJ1Ijoid2Fic29uIiwiYSI6ImNrNzBmbzkzbDA4ZWMzbG16M3gxMGF5dnoifQ.x_rIQz0D0enm_E5IIRhJPQ';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/wabson/ciw0ilw4300ar2knntbjcqg14',
    center: [-0.315, 51.445],
    zoom: 14
});
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        point: true,
        line_string: true,
        trash: true
    },
    modes: Object.assign({}, MapboxDraw.modes, {'draw_line_string': DrawNamedLineMode}),
    styles: [
        {
            'id': 'gl-active-points',
            'type': 'circle',
            'filter': ['all',
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['==', 'active', 'true']],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#D20C0C'
            }
        },
        {
            'id': 'gl-inactive-points',
            'type': 'circle',
            'filter': ['all',
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['==', 'active', 'false']],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#D20C0C'
            }
        },
        // ACTIVE (being drawn)
        // line stroke
        {
            'id': 'gl-draw-line',
            'type': 'line',
            'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#D20C0C',
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        },
        // vertex points
        {
            'id': 'gl-draw-polygon-and-line-vertex-active',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#D20C0C',
            }
        },
        // INACTIVE (static, already drawn)
        // line stroke
        {
            'id': 'gl-draw-line-static',
            'type': 'line',
            'filter': ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#000',
                'line-width': 3
            }
        }
    ]
});

map.addControl(draw, 'top-right');
map.addControl(new LineStringInfoControl({distanceUnits: 'kilometers'}), 'top-right');
map.addControl(new PointInfoControl({distanceUnits: 'kilometers'}), 'top-right');