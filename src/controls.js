import DrawConstants from '@mapbox/mapbox-gl-draw/src/constants';
import length from '@turf/length';

import Constants from './constants';
import './controls.css';

const DISTANCE_ABBRS = {
    'miles': 'mi',
    'kilometers': 'km'
};

class BaseInfoControl {

    onAdd(map) {
        this._map = map;

        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapbox-ctrl-feature-info';

        this.registerListeners();

        return this._container;
    }

    registerListeners() {
        this.onDrawCreateListener = this.onDrawCreate.bind(this);
        this.onDrawUpdateListener = this.onDrawUpdate.bind(this);
        this.onDrawSelectionChangeListener = this.onDrawSelectionChange.bind(this);
        this.onDrawDeleteListener = this.onDrawDelete.bind(this);

        this._map.on(DrawConstants.events.CREATE, this.onDrawCreateListener);
        this._map.on(DrawConstants.events.UPDATE, this.onDrawUpdateListener);
        this._map.on(DrawConstants.events.SELECTION_CHANGE, this.onDrawSelectionChangeListener);
        this._map.on(DrawConstants.events.DELETE, this.onDrawDeleteListener);
    }

    unregisterListeners() {
        this._map.off(DrawConstants.events.CREATE, this.onDrawCreateListener);
        this._map.off(DrawConstants.events.UPDATE, this.onDrawUpdateListener);
        this._map.off(DrawConstants.events.SELECTION_CHANGE, this.onDrawSelectionChangeListener);
        this._map.off(DrawConstants.events.DELETE, this.onDrawDeleteListener);
    }

    onDrawCreate(e) {
        if (this.isSupportedFeatures(e.features)) {
            this.clearFeaturesText();
            this.setFeaturesText(e.features);
        }
    }

    onDrawUpdate(e) {
        if (this.isSupportedFeatures(e.features) && e.action === DrawConstants.updateActions.CHANGE_COORDINATES) {
            this.clearFeaturesText();
            this.setFeaturesText(e.features);
        }
    }

    onDrawSelectionChange(e) {
        this.clearFeaturesText();
        if (this.isSupportedFeatures(e.features)) {
            this.setFeaturesText(e.features);
            var featureState = this._map.getFeatureState({ id: e.features[0].id, source: DrawConstants.sources.HOT });
            console.log(featureState);
        }
    }

    onDrawDelete() {
        this.clearFeaturesText();
    }

    clearFeaturesText() {
        this._container.innerHTML = '';
    }

    isSupportedFeatures() {
        throw new Error('Must implement isSupportedFeatures()');
    }

    setFeaturesText() {
        throw new Error('Must implement setFeaturesText()');
    }

    onRemove() {
        this.unregisterListeners();
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

}

class LineStringInfoControl extends BaseInfoControl {

    constructor(options) {
        super();
        this.distanceUnits = options && options.distanceUnits || 'kilometers';
    }

    registerListeners() {
        super.registerListeners();
        this.onDrawLineMouseMoveListener = this.onDrawLineMouseMove.bind(this);
        this._map.on(Constants.events.DRAW_MOUSE_MOVE, this.onDrawLineMouseMoveListener);
    }

    unregisterListeners() {
        super.unregisterListeners();
        this._map.off(Constants.events.DRAW_MOUSE_MOVE, this.onDrawLineMouseMoveListener);
    }

    onDrawLineMouseMove(e) {
        this.clearFeaturesText();
        this.setFeaturesText([e.feature], e.state);
    }

    isSupportedFeatures(features) {
        return features.length == 1 && features[0].geometry.type === 'LineString';
    }

    getFeatureName(feature, state=null) {
        state = state || this._map.getFeatureState({id: feature.id, source: DrawConstants.sources.HOT});
        return state ? state.name : null;
    }

    setFeaturesText(features, state) {
        const lineString = features[0];
        const textEl = document.createElement('span');
        const lineName = this.getFeatureName(lineString, state);
        const unitName = DISTANCE_ABBRS[this.distanceUnits];
        const lineDistance = length(lineString, {units: this.distanceUnits});
        textEl.textContent = (lineName || 'Untitled') + ': ' +
            lineDistance.toLocaleString() + ' ' + unitName;
        this._container.appendChild(textEl);
    }
}

class PointInfoControl extends BaseInfoControl {

    isSupportedFeatures(features) {
        return features.length == 1 && features[0].geometry.type === 'Point';
    }

    setFeaturesText(features) {
        const point = features[0];
        const textEl = document.createElement('span');
        textEl.textContent = point.id;
        this._container.appendChild(textEl);
    }

}

export { LineStringInfoControl, PointInfoControl };