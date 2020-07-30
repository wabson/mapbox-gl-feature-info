import * as DrawConstants from '@mapbox/mapbox-gl-draw/src/constants';
import * as CommonSelectors from '@mapbox/mapbox-gl-draw/src/lib/common_selectors';
import length from '@turf/length';
import midpoint from '@turf/midpoint';
import { lineString } from '@turf/helpers';

import Constants from './constants';
import './common.css';
import './controls.css';

const DISTANCE_ABBRS = {
    'miles': 'mi',
    'kilometers': 'km'
};

const DEFAULT_DISTANCE_UNITS = 'kilometers';
const DISTANCE_UNITS_NONE = 'none';
const DEFAULT_CONTROL_POSITION = 'top-right';

const TITLE_FEATURE = 'Feature';
const TITLE_LINE = 'Line';
const TITLE_POINT = 'Point';
const TITLE_MULTIPLE_LINES = 'Multiple lines';

class BaseInfoControl {

    constructor(options) {
        this.distanceUnits = options && options.distanceUnits || DEFAULT_DISTANCE_UNITS;
        this.defaultTitle = options && options.defaultTitle || this.getDefaultTitle();
    }

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

    getDefaultPosition() {
        return DEFAULT_CONTROL_POSITION;
    }

    getDefaultTitle() {
        return TITLE_FEATURE;
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
        state = state || this.drawControl.get(feature.id).properties;
        return state ? state.name : null;
    }

    getFeaturesTitle(features, state=null) {
        let lineDistance = 0, title = '';
        if (features.length > 0 && features.every(
            (feature) => feature.type === DrawConstants.geojsonTypes.LINE_STRING ||
            feature.type === DrawConstants.geojsonTypes.FEATURE && feature.geometry.type === DrawConstants.geojsonTypes.LINE_STRING
            ) && this.distanceUnits !== DISTANCE_UNITS_NONE) {
            lineDistance = features.reduce((accumulated, feature) => accumulated + length(feature, {units: this.distanceUnits}), 0);
        }
        if (features.length === 1) {
            title = this.getFeatureName(features[0], state) || this.defaultTitle;
        } else {
            title = this.defaultTitle;
        }
        if (title !== '' && lineDistance > 0) {
            const unitName = DISTANCE_ABBRS[this.distanceUnits];
            title += ': ' + lineDistance.toLocaleString() + ' ' + unitName;
        }
        return title;
    }

    setFeatures(features, state) {
        this.setFeaturesText(features, state);
        this._container.style.display = 'block';
    }

    setFeaturesText(features, state) {
        this._textContainer.textContent = this.getFeaturesTitle(features, state);
    }

    onRemove() {
        this.unregisterListeners();
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

}

class BaseEditableInfoControl extends BaseInfoControl {

    constructor(options) {
        super(options);
        this.drawControl = options && options.drawControl;
        this.editProperties = options.editProperties || [];
        this.editActions = this.editProperties.length ? [{
            className: 'edit-info',
            title: 'Edit feature information',
            handler: this.onClickEditInfo
        }] : [];
    }

    onAdd(map) {
        const container = super.onAdd(map);

        this._editContainer = document.createElement('div');
        this._editContainer.className = 'edit-ctrl';
        this._editContainer.innerHTML = '<div class="edit-tools">' +
            this.editToolbarHtml() + '</div>' +
            '<div class="edit-form">' +
            this.editProperties.map((prop) => `<div><label>${prop.label}: <input name="${prop.name}"></label></div>`).join('') +
            '<div><button type="button" data-btn-action="ok">OK</button><button type="button" data-btn-action="cancel">Cancel</button></div></div>';
        this._container.appendChild(this._editContainer);

        this.registerDomEvents();
        return container;
    }

    editToolbarHtml() {
        return this.editActions.map((action) => `<a class="${action.className}" title="${action.title}"></a>`).join('');
    }

    registerDomEvents() {
        for (const action of this.editActions) {
            this._editContainer.querySelector(`.${action.className}`).addEventListener('click', action.handler.bind(this));
        }
        this._editContainer.querySelector('.edit-form button[data-btn-action=ok]').addEventListener('click', this.onClickOKEditButton.bind(this));
        this._editContainer.querySelector('.edit-form button[data-btn-action=cancel]').addEventListener('click', this.onClickCancelEditButton.bind(this));
        for (const editProperty of this.editProperties) {
            this._editContainer.querySelector(`.edit-form input[name="${editProperty.name}"]`).addEventListener('keyup', this.onEditFormInputKeyup.bind(this));
        }
    }

    onClickEditInfo(e) {
        e.preventDefault();
        this.showEditForm();
        this.hideToolbar();
    }

    showEditForm() {
        this._editContainer.querySelector('.edit-form').style.display = 'block';
        const firstPropertyInput = this._editContainer.querySelector('input');
        if (firstPropertyInput) {
            firstPropertyInput.focus();
        }
    }

    hideEditForm() {
        this._editContainer.querySelector('.edit-form').style.display = 'none';
    }

    showToolbar() {
        this._editContainer.querySelector('.edit-tools').style.display = 'flex';
    }

    hideToolbar() {
        this._editContainer.querySelector('.edit-tools').style.display = 'none';
    }

    isEditingSupported() {
        const mode = this.drawControl.getMode();
        return mode === DrawConstants.modes.SIMPLE_SELECT || mode === DrawConstants.modes.DIRECT_SELECT;
    }

    stopEditing() {
        this.hideEditForm();
        this.showToolbar();
    }

    saveEditForm() {
        const selectedFeatures = this.drawControl.getSelected().features;
        const newName = this._editContainer.querySelector('input').value;
        for (const feature of selectedFeatures) {
            this.drawControl.setFeatureProperty(feature.id, 'name', newName);
        }
        this.setFeaturesText(selectedFeatures, {name: newName});
    }

    onEditFormInputKeyup(e) {
        if (CommonSelectors.isEnterKey(e)) {
            this.saveEditForm();
            this.stopEditing();
        } else if (CommonSelectors.isEscapeKey(e)) {
            this.hideEditForm();
        }
    }

    onClickOKEditButton() {
        this.saveEditForm();
        this.stopEditing();
    }

    onClickCancelEditButton() {
        this.stopEditing();
    }

    setFeatures(features, state) {
        super.setFeatures(features, state);
        this.hideEditForm();
        if (this.isEditingSupported()) {
            this.showToolbar();
        } else {
            this.hideToolbar();
        }
        const nameValue = features.length === 1 ? this.getFeatureName(features[0], state) || '' : '';
        const namePropertyInput = this._editContainer.querySelector('input[name=name]');
        if (namePropertyInput) {
            namePropertyInput.value = nameValue;
        }
    }

}

class LineStringInfoControl extends BaseEditableInfoControl {

    constructor(options) {
        super(options);
        this.editActions = this.editActions.concat([{
            className: 'duplicate-feature',
            title: 'Duplicate line',
            handler: this.onClickDuplicateFeature
        }, {
            className: 'add-feature-point',
            title: 'Add point to line',
            handler: this.onClickAddLinePoint
        }, {
            className: 'split-line',
            title: 'Split line',
            handler: this.onClickSplitLine
        }]);
    }

    getDefaultTitle() {
        return TITLE_LINE;
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

    onClickAddLinePoint(e) {
        e.preventDefault();
        const selected = this.drawControl.getSelected(), mode = this.drawControl.getMode();
        if (selected.features.length !== 1 || selected.features[0].geometry.type !== DrawConstants.geojsonTypes.LINE_STRING) {
            return;
        }
        const selectedLine = selected.features[0];
        if (mode === DrawConstants.modes.SIMPLE_SELECT) {
            this.extendLineString(selectedLine);
        } else if (mode === DrawConstants.modes.DIRECT_SELECT) {
            const selectedPoints = this.drawControl.getSelectedPoints();
            if (selectedPoints.features.length === 1) {
                const selectedPoint = selectedPoints.features[0];
                this.insertPointIntoLine(selectedLine, selectedPoint);
            }
        }

    }

    onClickDuplicateFeature(e) {
        e.preventDefault();
        const selected = this.drawControl.getSelected();
        if (selected.features.length !== 1) {
            return;
        }
        const newLine = Object.assign({}, selected.features[0]);
        newLine.properties = {};
        delete newLine.id;
        const newFeatureIds = this.drawControl.add(newLine);
        this.drawControl.changeMode(
            DrawConstants.modes.SIMPLE_SELECT,
            { featureIds: newFeatureIds }
        );
        this.setFeatures(this.drawControl.getSelected().features);
    }

    onClickSplitLine(e) {
        e.preventDefault();
        const selected = this.drawControl.getSelected(), mode = this.drawControl.getMode();
        if (mode === DrawConstants.modes.DIRECT_SELECT) {
            const selectedPoints = this.drawControl.getSelectedPoints();
            if (selectedPoints.features.length === 1) {
                this.splitLine(selected.features[0], selectedPoints.features[0]);
            }
        }
    }

    extendLineString(fromFeature) {
        this.drawControl.changeMode(
            DrawConstants.modes.DRAW_LINE_STRING, {
            featureId: fromFeature.id,
            from: {
                type: DrawConstants.geojsonTypes.POINT,
                coordinates: fromFeature.geometry.coordinates[fromFeature.geometry.coordinates.length - 1]
            },
            showNamePrompt: false,
            featureName: fromFeature.properties.name
        });
    }

    findPointInLine(line, point) {
        return line.geometry.coordinates.findIndex(
            (latlng) => latlng.every((position, index) => position === point.geometry.coordinates[index])
        );
    }

    insertPointIntoLine(selectedLine, selectedPoint) {
        const pointIndex = this.findPointInLine(selectedLine, selectedPoint);
        if (pointIndex === selectedLine.geometry.coordinates.length - 1) {
            this.extendLineString(selectedLine);
        } else {
            const mid = midpoint(selectedLine.geometry.coordinates[pointIndex], selectedLine.geometry.coordinates[pointIndex + 1]);
            selectedLine.geometry.coordinates.splice(pointIndex + 1, 0, mid.geometry.coordinates);
            this.drawControl.add(selectedLine);
        }
    }

    splitLine(selectedLine, selectedPoint) {
        const pointIndex = this.findPointInLine(selectedLine, selectedPoint);
        if (0 < pointIndex && pointIndex < selectedLine.geometry.coordinates.length - 2) {
            const splitPoint = pointIndex + 1;
            const newLine = {
                type: DrawConstants.geojsonTypes.FEATURE,
                geometry: {
                    type: DrawConstants.geojsonTypes.LINE_STRING,
                    coordinates: selectedLine.geometry.coordinates.slice(splitPoint)
                },
                properties: {}
            };
            selectedLine.geometry.coordinates = selectedLine.geometry.coordinates.slice(0, splitPoint);
            this.drawControl.add(selectedLine);
            const newFeatureId = this.drawControl.add(newLine);
            return newFeatureId;
        }
    }

    isSupportedFeatures(features) {
        return features.length == 1 && features[0].geometry.type === DrawConstants.geojsonTypes.LINE_STRING;
    }
}

class PointInfoControl extends BaseEditableInfoControl {

    isSupportedFeatures(features) {
        return features.length == 1 && features[0].geometry.type === DrawConstants.geojsonTypes.POINT;
    }

    getDefaultTitle() {
        return TITLE_POINT;
    }

}

class MultiLineInfoControl extends BaseEditableInfoControl {

    constructor(options) {
        super(options);
        this.editActions = [{
            className: 'join-lines',
            title: 'Join lines',
            handler: this.onClickJoinLines
        }];
    }

    orderFeaturesByDistanceToAnother() {
        const selectedFeatures = this.drawControl.getSelected().features;
        const coordinates = selectedFeatures.map((feature) => feature.geometry.coordinates);
        const joiningDistances = [
            length(lineString([coordinates[0][coordinates[0].length - 1], coordinates[1][0]])),
            length(lineString([coordinates[1][coordinates[1].length - 1], coordinates[0][0]]))
        ];
        return (joiningDistances[0] <= joiningDistances[1] ?
            [ selectedFeatures[0], selectedFeatures[1] ] : [ selectedFeatures[1], selectedFeatures[0] ]);
    }

    onClickJoinLines(e) {
        e.preventDefault();
        const orderedFeatures = this.orderFeaturesByDistanceToAnother();
        const startingFeature = orderedFeatures[0];
        const removeFeature = orderedFeatures[1];
        startingFeature.geometry.coordinates = startingFeature.geometry.coordinates.concat(removeFeature.geometry.coordinates);
        this.drawControl.delete([removeFeature.id]).add(startingFeature);
        // work around delete() and add() not firing selection change event
        this._map.fire(DrawConstants.events.SELECTION_CHANGE, {
            features: [startingFeature]
        });
    }

    isSupportedFeatures(features) {
        return features.length == 2 && features.every((feature) => feature.geometry.type === DrawConstants.geojsonTypes.LINE_STRING);
    }

    getDefaultTitle() {
        return TITLE_MULTIPLE_LINES;
    }

}

export { LineStringInfoControl, MultiLineInfoControl, PointInfoControl };