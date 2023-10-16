'use client';
import {Wrapper} from "@googlemaps/react-wrapper";
import {ReactNode, useEffect, useState} from "react";

export default function MapsWrapper({children}: {children: ReactNode}) {
	const [mapsApikey, setMapsApikey] = useState(process.env.NEXT_PUBLIC_GOOGLE_MAPS_APIKEY);
	useEffect(() => {
		if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_APIKEY && !mapsApikey) {
			setMapsApikey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_APIKEY)
		}
	}, [process.env.NEXT_PUBLIC_GOOGLE_MAPS_APIKEY])
	if (!mapsApikey) return null;
	return (
		<Wrapper
			apiKey={mapsApikey}
			version='beta'
			libraries={["marker", "geometry"]}
		>
			{children}
		</Wrapper>
	)
}