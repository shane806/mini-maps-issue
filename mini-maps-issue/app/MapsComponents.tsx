'use client';

import {Children, cloneElement, EffectCallback, FC, isValidElement, ReactNode, useEffect, useRef, useState} from "react";
import {createCustomEqual} from "fast-equals";
import {isLatLngLiteral} from "@googlemaps/typescript-guards";

export class InfoDivOverlay extends google.maps.OverlayView {}
// this InfoDivOverlay class being defined causes a ref. error on google
// export class InfoDivOverlay extends google.maps.OverlayView {
// 	stop?: {location: google.maps.LatLngLiteral}
// 	container: HTMLDivElement;
// 	body: HTMLDivElement;
// 	glyph: HTMLHeadingElement;
//
// 	constructor(opts?: {stop: {location: google.maps.LatLngLiteral}, map: google.maps.Map, isMini: boolean }) {
// 		super();
// 		this.container = document.createElement('div');
// 		this.body = document.createElement('div');
// 		this.glyph = document.createElement('h2');
// 		if (opts) {
// 			this.setOpts(opts)
// 		}
// 	}
//
// 	setOpts({stop, map, isMini}: {stop: {location: google.maps.LatLngLiteral}, map: google.maps.Map, isMini: boolean }) {
// 		this.container.remove();
// 		this.body.remove();
// 		this.glyph.remove();
// 		this.glyph = document.createElement('h2');
// 		this.body = document.createElement('div');
// 		this.container = document.createElement('div');
// 		InfoDivOverlay.preventMapHitsAndGesturesFrom(this.container);
// 		this.stop = stop;
// 		if (map) {
// 			this.setMap(map);
// 		}
// 	}
//
// 	onAdd() {
// 		this.container.removeEventListener('contextmenu', e => e.stopPropagation());
// 		this.container.addEventListener('contextmenu', e => e.stopPropagation());
// 		this.getPanes()?.floatPane.appendChild(this.container);
// 	}
//
// 	onRemove() {
// 		this.container.removeEventListener('contextmenu', e => e.stopPropagation());
// 		if (this.container.parentElement) {
// 			this.container.parentElement.removeChild(this.container);
// 		}
// 	}
//
// 	draw() {
// 		const divCoords = this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(this.stop!.location));
// 		const {x, y} = divCoords!;
// 		if (!divCoords || Math.abs(x) > 4000 || Math.abs(y) > 4000) {
// 			this.container.style.display = 'none';
// 			console.log({draw: {divCoords, cont: this.container.style}})
// 			return;
// 		}
// 		this.container.style.left = `${x}px`;
// 		this.container.style.top = `${y}px`;
// 	}
//
// 	hide() {
// 		if (this.container) this.container.style.visibility = 'hidden';
// 	}
//
// 	show() {
// 		if (this.container) this.container.style.visibility = 'visible';
// 	}
//
// 	toggle() {
// 		if (this.container) {
// 			if (this.container.style.visibility === 'hidden') this.show();
// 			else this.hide()
// 		}
// 	}
// }
export const App = () => {
	// [START maps_react_map_component_app_state]
	const [clicks, setClicks] = useState<google.maps.LatLng[]>([]);
	const [zoom, setZoom] = useState(3); // initial zoom
	const [center, setCenter] = useState<google.maps.LatLngLiteral>({
		lat: 0,
		lng: 0,
	});

	const onClick = (e: google.maps.MapMouseEvent) => {
		// avoid directly mutating state
		setClicks([...clicks, e.latLng!]);
	};

	const onIdle = (m: google.maps.Map) => {
		console.log("onIdle");
		setZoom(m.getZoom()!);
		setCenter(m.getCenter()!.toJSON());
	};
	// [END maps_react_map_component_app_state]

	const form = (
		<div
			style={{
				padding: "1rem",
				flexBasis: "250px",
				height: "100%",
				overflow: "auto",
			}}
		>
			<label htmlFor="zoom">Zoom</label>
			<input
				type="number"
				id="zoom"
				name="zoom"
				value={zoom}
				onChange={(event) => setZoom(Number(event.target.value))}
			/>
			<br />
			<label htmlFor="lat">Latitude</label>
			<input
				type="number"
				id="lat"
				name="lat"
				value={center.lat}
				onChange={(event) =>
					setCenter({ ...center, lat: Number(event.target.value) })
				}
			/>
			<br />
			<label htmlFor="lng">Longitude</label>
			<input
				type="number"
				id="lng"
				name="lng"
				value={center.lng}
				onChange={(event) =>
					setCenter({ ...center, lng: Number(event.target.value) })
				}
			/>
			<h3>{clicks.length === 0 ? "Click on map to add markers" : "Clicks"}</h3>
			{clicks.map((latLng, i) => (
				<pre key={i}>{JSON.stringify(latLng.toJSON(), null, 2)}</pre>
			))}
			<button onClick={() => setClicks([])}>Clear</button>
		</div>
	);
	// [START maps_react_map_component_app_return]
	return (
		<div style={{ display: "flex", height: "100vh" }}>
			{/*<Wrapper apiKey={"YOUR_API_KEY"} render={render}>*/}
			<Map
				mapId={google.maps.Map.DEMO_MAP_ID}
				center={center}
				onClick={onClick}
				onIdle={onIdle}
				zoom={zoom}
				style={{ flexGrow: "1", height: "100%" }}
			>
				{clicks.map((latLng, i) => (
					<Marker key={i} position={latLng} />
				))}
			</Map>
			{/*</Wrapper>*/}
			{/* Basic form for controlling center and zoom of map. */}
			{form}
		</div>
	);
	// [END maps_react_map_component_app_return]
};
interface MapProps extends google.maps.MapOptions {
	style: { [key: string]: string };
	onClick?: (e: google.maps.MapMouseEvent) => void;
	onIdle?: (map: google.maps.Map) => void;
	children?: ReactNode;
}

const Map: FC<MapProps> = ({
	                           onClick,
	                           onIdle,
	                           children,
	                           style,
	                           ...options
                           }) => {
	// [START maps_react_map_component_add_map_hooks]
	const ref = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<google.maps.Map>();

	useEffect(() => {
		if (ref.current && !map) {
			setMap(new window.google.maps.Map(ref.current, {}));
		}
	}, [ref, map]);
	// [END maps_react_map_component_add_map_hooks]

	// [START maps_react_map_component_options_hook]
	// because React does not do deep comparisons, a custom hook is used
	// see discussion in https://github.com/googlemaps/js-samples/issues/946
	useDeepCompareEffectForMaps(() => {
		if (map) {
			map.setOptions(options);
		}
	}, [map, options]);
	// [END maps_react_map_component_options_hook]

	// [START maps_react_map_component_event_hooks]
	useEffect(() => {
		if (map) {
			["click", "idle"].forEach((eventName) =>
				google.maps.event.clearListeners(map, eventName)
			);

			if (onClick) {
				map.addListener("click", onClick);
			}

			if (onIdle) {
				map.addListener("idle", () => onIdle(map));
			}
		}
	}, [map, onClick, onIdle]);
	// [END maps_react_map_component_event_hooks]

	// [START maps_react_map_component_return]
	return (
		<>
			<div ref={ref} style={style} />
			{Children.map(children, (child) => {
				if (isValidElement(child)) {
					// set the map prop on the child component
					// @ts-ignore
					return cloneElement(child, { map });
				}
			})}
		</>
	);
	// [END maps_react_map_component_return]
};

// [START maps_react_map_marker_component]
const Marker: FC<google.maps.MarkerOptions> = (options) => {
	const [marker, setMarker] = useState<google.maps.Marker>();

	useEffect(() => {
		if (!marker) {
			setMarker(new google.maps.Marker());
		}

		// remove marker from map on unmount
		return () => {
			if (marker) {
				marker.setMap(null);
			}
		};
	}, [marker]);

	useEffect(() => {
		if (marker) {
			marker.setOptions(options);
		}
	}, [marker, options]);

	return null;
};
// [END maps_react_map_marker_component]

const deepCompareEqualsForMaps = createCustomEqual(
	// @ts-ignore
	(deepEqual) => (a: any, b: any) => {
		if (
			isLatLngLiteral(a) ||
			a instanceof google.maps.LatLng ||
			isLatLngLiteral(b) ||
			b instanceof google.maps.LatLng
		) {
			return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
		}

		// TODO extend to other types

		// use fast-equals for other objects
		return deepEqual(a, b);
	}
);

function useDeepCompareMemoize(value: any) {
	const ref = useRef();

	if (!deepCompareEqualsForMaps(value, ref.current)) {
		ref.current = value;
	}

	return ref.current;
}

function useDeepCompareEffectForMaps(
	callback: EffectCallback,
	dependencies: any[]
) {
	useEffect(callback, dependencies.map(useDeepCompareMemoize));
}