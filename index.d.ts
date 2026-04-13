import type { IControl, Map as MapboxMap, ControlPosition } from 'mapbox-gl';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * Structural interface describing the subset of MapboxDraw used by the controls.
 * A MapboxDraw instance satisfies this interface without needing
 * @types/mapbox__mapbox-gl-draw installed in the consuming project.
 */
export interface DrawControl {
    get(featureId: string): Feature | undefined;
    getMode(): string;
    getSelected(): FeatureCollection;
    getSelectedPoints(): FeatureCollection<Geometry, Record<string, unknown>>;
    setFeatureProperty(featureId: string, property: string, value: unknown): this;
    changeMode(mode: string, options?: Record<string, unknown>): this;
    add(geojson: Feature | FeatureCollection): string[];
    delete(ids: string | string[]): this;
}

export interface EditProperty {
    name: string;
    label: string;
}

export type DistanceUnits = 'miles' | 'kilometers' | 'none';

export interface BaseInfoControlOptions {
    distanceUnits?: DistanceUnits;
    defaultTitle?: string;
}

export interface EditableInfoControlOptions extends BaseInfoControlOptions {
    drawControl: DrawControl;
    editProperties?: EditProperty[];
}

export declare class LineStringInfoControl implements IControl {
    constructor(options: EditableInfoControlOptions);
    onAdd(map: MapboxMap): HTMLElement;
    onRemove(map: MapboxMap): void;
    getDefaultPosition(): ControlPosition;
}

export declare class PointInfoControl implements IControl {
    constructor(options: EditableInfoControlOptions);
    onAdd(map: MapboxMap): HTMLElement;
    onRemove(map: MapboxMap): void;
    getDefaultPosition(): ControlPosition;
}

export declare class MultiLineInfoControl implements IControl {
    constructor(options: EditableInfoControlOptions);
    onAdd(map: MapboxMap): HTMLElement;
    onRemove(map: MapboxMap): void;
    getDefaultPosition(): ControlPosition;
}

/**
 * A custom Mapbox Draw mode that extends draw_line_string with real-time
 * distance events and an optional name prompt before drawing.
 *
 * Set `DrawNamedLineMode.isNameRequired = true` to require a name before drawing.
 * Set `DrawNamedLineMode.showNamePrompt = true` to show the prompt without requiring it.
 */
export declare const DrawNamedLineMode: {
    isNameRequired: boolean;
    showNamePrompt: boolean;
    [key: string]: unknown;
};
