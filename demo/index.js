import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import { LineStringInfoControl, PointInfoControl } from '../src/controls';
import { DrawNamedLineMode } from '../src/modes';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import customMapStyles from './map-style';
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
    styles: customMapStyles
});

map.addControl(draw, 'top-right');
map.addControl(new LineStringInfoControl({distanceUnits: 'kilometers'}), 'top-right');
map.addControl(new PointInfoControl({distanceUnits: 'kilometers'}), 'top-right');