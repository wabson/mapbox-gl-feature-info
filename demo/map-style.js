export default [
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
];