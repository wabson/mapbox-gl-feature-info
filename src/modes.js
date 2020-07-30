import * as DrawConstants from '@mapbox/mapbox-gl-draw/src/constants';
import DrawLineString from '@mapbox/mapbox-gl-draw/src/modes/draw_line_string';
import * as CommonSelectors from '@mapbox/mapbox-gl-draw/src/lib/common_selectors';

import Constants from './constants';
import './common.css';
import './modes.css';

const DrawNamedLineMode = {};

Object.assign(DrawNamedLineMode, DrawLineString, {

    isNameRequired: false,
    showNamePrompt: false,

    onSetup: function(opts) {
        const state = DrawLineString.onSetup.call(this, opts);
        const isNameRequired = this.isNameRequired === true;
        const featureName = opts.featureName;
        const showNamePrompt = (opts.showNamePrompt !== undefined ? opts.showNamePrompt === true : this.showNamePrompt === true) || (isNameRequired && !featureName);
        const extendedState = Object.assign(state, {
            isNameRequired: isNameRequired,
            name: featureName
        });
        if (showNamePrompt) {
            this.setupNameFormControl(extendedState);
            this.updateUIClasses({ mouse: DrawConstants.cursors.MOVE });
            this._ctx.ui.updateMapClasses();
        }
        return extendedState;
    },
    onStop: function(state) {
        DrawLineString.onStop.call(this, state);
        if (state.name) {
            this._ctx.store.setFeatureProperty(state.line.id, 'name', state.name);
        }
        this.removeNameFormControl();
    },
    onMouseMove: function(state, e) {
        DrawLineString.onMouseMove.call(this, state, e);
        if (state.line.coordinates.length > 1) {
            this.map.fire(Constants.events.DRAW_MOUSE_MOVE, {
                feature: state.line,
                state: state
            });
        }
    },
    clickAnywhere: function(state, e) {
        if (state.isNameRequired === true && !state.name) {
            return this.changeMode(DrawConstants.modes.SIMPLE_SELECT);
        } else {
            this.removeNameFormControl();
            return DrawLineString.clickAnywhere.call(this, state, e);
        }
    },
    setupNameFormControl: function(state) {
        this._formContainerEl = document.createElement('div');
        this._formContainerEl.className = 'mapboxgl-draw-named-line--name-container mapboxgl-custom-control';
        this._inputEl = document.createElement('input');
        this._inputEl.type = 'text';
        this._inputEl.className = 'mapboxgl-draw-named-line--name-input';
        if (state.featureName) {
            this._inputEl.value = state.featureName;
        }
        const createButton = document.createElement('button');
        createButton.textContent = 'Create';
        createButton.setAttribute('type', 'button');
        createButton.addEventListener('click', () => this.onCreateButtonClick(state));
        this._inputEl.addEventListener('keyup', (e) => this.onNameInputKeyUp(state, e));
        this._formContainerEl.appendChild(document.createTextNode('Name:'));
        this._formContainerEl.appendChild(this._inputEl);
        this._formContainerEl.appendChild(createButton);
        document.body.appendChild(this._formContainerEl);
        this._inputEl.focus();
    },
    removeNameFormControl: function() {
        if (this._formContainerEl && this._formContainerEl.parentNode) {
            this._formContainerEl.parentNode.removeChild(this._formContainerEl);
        }
    },
    startDraw: function() {
        this.updateUIClasses({ mouse: DrawConstants.cursors.ADD });
        DrawLineString.onSetup.call(this, {});
        this._ctx.ui.updateMapClasses();
        this.removeNameFormControl();
    },
    onCreateButtonClick: function(state) {
        const name = this._inputEl.value;
        if (name) {
            state.name = name;
            this.startDraw();
        } else {
            this._inputEl.focus();
        }
    },
    onNameInputKeyUp: function(state, e) {
        if (CommonSelectors.isEnterKey(e)) {
            const name = this._inputEl.value;
            state.name = name;
            this.startDraw();
        } else if (CommonSelectors.isEscapeKey(e)) {
            this.removeNameFormControl();
        }
    }
});

export { DrawNamedLineMode };