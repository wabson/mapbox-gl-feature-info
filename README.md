# Mapbox Draw GL JS Feature Information

This project provides a set of custom Mapbox GL JS controls, to display
and allow editing of information about selected features, for use with
the Mapbox Draw GL JS editor.

   * See line lengths updated as you draw out the line or select single
     or multiple features

   * Assign feature names and other metadata, which will be stored as
     properties in the output GeoJSON

   * Additional tools to join together, extend or cut lines into
     multiple parts

[View demo page](https://wabson.github.io/mapbox-gl-feature-info/)

## Usage

Include the library in your project

    npm install @wabson/mapbox-gl-feature-info

Using `<script>` tags

    <link rel="stylesheet" href="node_modules/@wabson/mapbox-gl-feature-info/lib/index.css">
    <script src="node_modules/@wabson/mapbox-gl-feature-info/lib/index.js" type="application/javascript"></script>

Or ES6 import (TypeScript types are included)

    import { LineStringInfoControl, PointInfoControl, MultiLineInfoControl, DrawNamedLineMode } from '@wabson/mapbox-gl-feature-info';
    import '@wabson/mapbox-gl-feature-info/lib/index.css';

Add a basic LineString distance indicator to your map

````
var map = new mapboxgl.Map({
    container: 'map',
    ...
});

var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        point: true,
        line_string: true,
        trash: true
    },
    ...
});

var LineStringInfoControl = mapboxglFeatureInfo.LineStringInfoControl; // only for <script> tag method
map.on('load', () => {
    map.addControl(draw);
    map.addControl(new LineStringInfoControl({
        distanceUnits: 'kilometers',
        drawControl: draw
    }));
````

Valid distance units are `miles`, `kilometers` and `none` (if you don't want
distances to be calculated). Internally Turf.js is used to calculate lengths.

You must pass in the Draw instance to `LineStringInfoControl` and all other
custom controls via the `drawControl` property in the contructor.

### Other controls

The other controls provided are `PointInfoControl` for showing and editing
properties of a Point and `MultiLineInfoControl` for multiple selected
LineStrings.

### Displaying distances while drawing lines

A custom Draw mode is provided to fire events whilst drawing lines, in order
to allow the distance to be displayed in real time. To enable this, you must
override Draw's `modes` property:

````
var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        point: true,
        line_string: true,
        trash: true
    },
    modes: Object.assign({}, MapboxDraw.modes, {'draw_line_string': DrawNamedLineMode}),
    ...
});
````

### Viewing and editing feature properties

The controls support setting and showing property values of the drawn features, which
Draw lacks direct support for.

To allow editing of properties, configure the `editProperties` property of the controls,
for example

````
map.addControl(new PointInfoControl({
    drawControl: draw,
    editProperties: [
        {
            name: 'name',
            label: 'Name'
        }
    ],
    defaultTitle: 'Untitled'
}));
````

Any valid GeoJSON property names and form labels are supported, however the `name`
property if present will be displayed as the feature title bar of the custom controls.

The `defaultTitle` property allows customising the placeholder that will be used if
the selected feature has no name, the default is based on the type of feature, e.g.
LineStrings will show as 'Line'.

### Classifying features with a type dropdown

You can provide a list of named types for lines or points. When set, a dropdown
appears in the control panel whenever a feature of that type is selected. The
user's choice is saved immediately to the feature's GeoJSON properties.

Pass a `featureTypes` array to the control constructor. Each entry needs a
`name` (shown in the dropdown) and a `value` (stored in the GeoJSON):

````
map.addControl(new LineStringInfoControl({
    drawControl: draw,
    featureTypes: [
        { name: 'Footpath', value: 'footpath' },
        { name: 'Cycle route', value: 'cycle_route' },
        { name: 'Road', value: 'road' }
    ]
}));
````

The selected value is stored under the property key `featureType` by default.
To use a different key, pass `featureTypeProperty`:

````
map.addControl(new PointInfoControl({
    drawControl: draw,
    featureTypes: [
        { name: 'Bus stop', value: 'bus_stop' },
        { name: 'Train station', value: 'train_station' }
    ],
    featureTypeProperty: 'poi_type'
}));
````

The resulting GeoJSON will include the chosen value in `feature.properties`:

```json
{
  "type": "Feature",
  "geometry": { "type": "LineString", "coordinates": [...] },
  "properties": {
    "featureType": "cycle_route"
  }
}
```

If `featureTypes` is omitted or an empty array, no dropdown is shown.

### Prompting for a name before drawing

In some circumstances you may want to make it a requirement for the user to enter
a name before they start drawing a feature, or at least to allow them the option
of entering a name before they start drawing.

To set this up, set either of the following properties on the imported 
`DrawNamedLineMode` object, prior to passing it in the map `modes` as above, i.e.

    DrawNamedLineMode.isNameRequired = true;

or

    DrawNamedLineMode.showNamePrompt = true;

## Development

Node.js 18 or later is required. The repo includes an `.nvmrc` file, so if you
use [nvm](https://github.com/nvm-sh/nvm) you can switch to the right version with:

    nvm use

Install dependencies:

    npm install

| Script | Description |
|---|---|
| `npm start` | Start the webpack dev server and open the demo in a browser |
| `npm run build` | Lint, then build both the demo and the library |
| `npm run build-lib` | Lint and build the library only (outputs to `lib/`) |
| `npm run build-demo` | Lint and build the demo only (outputs to `dist/`) |
| `npm run watch` | Watch mode for the demo build |
| `npm run watch-lib` | Watch mode for the library build |
| `npm run build-docs` | Copy the demo build to `docs/` for GitHub Pages |

The library is compiled to `lib/index.js` and `lib/index.css`. These files
and `index.d.ts` are the only things published to npm (controlled by the
`files` field in `package.json`).
