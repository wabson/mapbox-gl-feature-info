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

    <script src="node_modules/@wabson/mapbox-gl-feature-info/dist/lib.bundle.js" type="application/javascript"></script>

Or ES6 import

    import { LineStringInfoControl, PointInfoControl, MultiLineInfoControl, DrawNamedLineMode } from '@wabson/mapbox-gl-feature-info';

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

### Prompting for a name before drawing

In some circumstances you may want to make it a requirement for the user to enter
a name before they start drawing a feature, or at least to allow them the option
of entering a name before they start drawing.

To set this up, set either of the following properties on the imported 
`DrawNamedLineMode` object, prior to passing it in the map `modes` as above, i.e.

    DrawNamedLineMode.isNameRequired = true;

or

    DrawNamedLineMode.showNamePrompt = true;
