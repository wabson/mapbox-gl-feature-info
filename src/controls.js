import DrawConstants from '@mapbox/mapbox-gl-draw/src/constants';
import * as CommonSelectors from '@mapbox/mapbox-gl-draw/src/lib/common_selectors';
import length from '@turf/length';

import Constants from './constants';
import './common.css';
import './controls.css';

const DISTANCE_ABBRS = {
    'miles': 'mi',
    'kilometers': 'km'
};

class BaseInfoControl {

    onAdd(map) {
        this._map = map;

        this._container = document.createElement('div');
        this._textContainer = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapbox-ctrl-feature-info mapboxgl-custom-control';
        this._container.appendChild(this._textContainer);
        this.clearFeatures();

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
            this.clearFeatures();
            this.setFeatures(e.features);
        }
    }

    onDrawUpdate(e) {
        if (this.isSupportedFeatures(e.features) && e.action === DrawConstants.updateActions.CHANGE_COORDINATES) {
            this.clearFeatures();
            this.setFeatures(e.features);
        }
    }

    onDrawSelectionChange(e) {
        this.clearFeatures();
        if (this.isSupportedFeatures(e.features)) {
            this.setFeatures(e.features);
            var featureState = this._map.getFeatureState({ id: e.features[0].id, source: DrawConstants.sources.HOT });
            console.log(featureState);
        }
    }

    onDrawDelete() {
        this.clearFeatures();
    }

    clearFeatures() {
        this._container.style.display = 'none';
        this.clearFeaturesText();
    }

    clearFeaturesText() {
        this._textContainer.innerHTML = '';
    }

    isSupportedFeatures() {
        throw new Error('Must implement isSupportedFeatures()');
    }

    getFeatureName(feature, state=null) {
        state = state || this._map.getFeatureState({id: feature.id, source: DrawConstants.sources.HOT});
        return state ? state.name : null;
    }

    setFeatures(features) {
        this._features = features;
    }

    onRemove() {
        this.unregisterListeners();
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

}

class BaseEditableInfoControl extends BaseInfoControl {

    onAdd(map) {
        const container = super.onAdd(map);

        this._editContainer = document.createElement('div');
        this._editContainer.className = 'edit-ctrl';
        this._editContainer.innerHTML = '<div class="edit-icon"></div>' +
            '<div class="edit-form"><label>Name: <input name="name"></label><div><button type="button" data-btn-action="ok">OK</button><button type="button" data-btn-action="cancel">Cancel</button></div></div>';
        this._container.appendChild(this._editContainer);

        this.registerDomEvents();
        return container;
    }

    registerDomEvents() {
        this._editContainer.querySelector('.edit-icon').addEventListener('click', this.onClickEditIcon.bind(this));
        this._editContainer.querySelector('.edit-form button[data-btn-action=ok]').addEventListener('click', this.onClickOKEditButton.bind(this));
        this._editContainer.querySelector('.edit-form button[data-btn-action=cancel]').addEventListener('click', this.onClickCancelEditButton.bind(this));
        this._editContainer.querySelector('.edit-form input').addEventListener('keyup', this.onEditFormInputKeyup.bind(this));
    }

    onClickEditIcon() {
        this.displayEditForm();
    }

    displayEditForm() {
        this._editContainer.querySelector('.edit-form').style.display = 'block';
        this._editContainer.querySelector('.edit-icon').style.display = 'none';
        this._editContainer.querySelector('input').focus();
    }

    hideEditForm() {
        this._editContainer.querySelector('.edit-form').style.display = 'none';
        this._editContainer.querySelector('.edit-icon').style.display = 'block';
    }

    saveEditForm() {
        const newName = this._editContainer.querySelector('input').value;
        this._map.setFeatureState({id: this._features[0].id, source: DrawConstants.sources.HOT},
            {name: newName});
        this.setFeaturesText(this._features, {name: newName});
    }

    onEditFormInputKeyup(e) {
        if (CommonSelectors.isEnterKey(e)) {
            this.saveEditForm();
            this.hideEditForm();
        } else if (CommonSelectors.isEscapeKey(e)) {
            this.hideEditForm();
        }
    }

    onClickOKEditButton() {
        this.saveEditForm();
        this.hideEditForm();
    }

    onClickCancelEditButton() {
        this.hideEditForm();
    }

    setFeatures(features) {
        super.setFeatures(features);
        this.hideEditForm();
    }

}

class LineStringInfoControl extends BaseEditableInfoControl {

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
        this.clearFeatures();
        this.setFeatures([e.feature], e.state);
    }

    isSupportedFeatures(features) {
        return features.length == 1 && features[0].geometry.type === 'LineString';
    }

    setFeatures(features, state) {
        super.setFeatures(features);
        this.setFeaturesText(features, state);
        this._container.style.display = 'block';
        const lineString = features[0];
        this._editContainer.querySelector('input').value = this.getFeatureName(lineString, state);
    }

    setFeaturesText(features, state) {
        const lineString = features[0];
        const lineName = this.getFeatureName(lineString, state);
        const unitName = DISTANCE_ABBRS[this.distanceUnits];
        const lineDistance = length(lineString, {units: this.distanceUnits});
        this._textContainer.textContent = (lineName || 'Untitled') + ': ' +
            lineDistance.toLocaleString() + ' ' + unitName;
    }
}

class PointInfoControl extends BaseEditableInfoControl {

    isSupportedFeatures(features) {
        return features.length == 1 && features[0].geometry.type === 'Point';
    }

    setFeatures(features, state) {
        super.setFeatures(features);
        this.setFeaturesText(features, state);
    }

    setFeaturesText(features, state) {
        const point = features[0];
        const pointName = this.getFeatureName(point, state);
        this._textContainer.textContent = pointName || 'Untitled';
        this._container.style.display = 'block';
    }

}

export { LineStringInfoControl, PointInfoControl };