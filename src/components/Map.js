import React from "react";
import Moment from "react-moment";
// import { EsriProvider } from "leaflet-geosearch";
import { Map as LeafletMap, TileLayer, Marker, Popup } from "react-leaflet";
import "./map.css";

class Map extends React.Component {
  state = {
    isLoading: true,
    pins: []
  };

  componentDidUpdate(prevPops, prevState) {
    if (prevPops.pins !== this.props.pins) {
      this.addPins(this.props.allEvents);
    } else if (!this.state.pins.length) {
      this.addPins(this.props.allEvents);
    }
  }

  componentDidMount() {
    this.addPins(this.props.allEvents);
  }

  parseLonLat = (googleEvent) => {
    let coordinates = {
      latitude: '',
      longitude: '',
    };

    if (googleEvent && googleEvent.location) {
      //
      // Link: https://stackoverflow.com/a/18690202/1775459
      //
      // This will get output:
      // ["54.649617, 19.901687"]
      //
      const lonLat = googleEvent.location.match(/[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/g);

      if (lonLat && lonLat[0]) {
        const lonLatArray = lonLat[0].match(/[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/g);
        coordinates.latitude = lonLatArray[0];
        coordinates.longitude = lonLatArray[1];
      }
    }

    return coordinates;
  }

  addPins = events => {
    for (const event of events) {
      const coordinates = this.parseLonLat(event);
      const hasCoordinates = Boolean(coordinates && coordinates.latitude && coordinates.longitude);
      
      if (hasCoordinates) {
        this.setState(state => {
          const {
            id,
            description,
            location,
            creator: { email },
            start: { dateTime }
          } = event;
          const pins = state.pins.slice();
          pins.push({
            id,
            description,
            location,
            email,
            dateTime,
            geolocation: { lng: coordinates.longitude, lat: coordinates.latitude }
          });
          return { ...state, isLoading: false, pins };
        });
      }
    }
  };

  render() {
    const { pins } = this.state;

    if (!pins.length) return null;

    return (
      <LeafletMap
        bounds={pins.map(({ geolocation: { lat, lng } }) => ({ lat, lng }))}
        zoom={10}
        maxZoom={15}
        attributionControl={true}
        zoomControl={true}
        doubleClickZoom={true}
        scrollWheelZoom={false}
        dragging={true}
        animate={true}
        easeLinearity={0.35}
      >
        <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />

        {!pins
          ? null
          : pins.map(event => {
              const { lat, lng } = event.geolocation;

              return (
                <Marker key={event.id} position={[lat, lng]}>
                  <Popup>
                    {/*<h5>#{NAMES_CALENDARS[event.email] ? NAMES_CALENDARS[event.email].name : event.email}</h5>*/}
                    <p>{event.description.slice(0, 150)}...</p>
                    <p>Место события: {event.location}</p>
                    <p>
                      Начало:{" "}
                      <Moment format={"DD MMM HH:mm"}>{event.dateTime}</Moment>
                    </p>
                  </Popup>
                </Marker>
              );
            })}
      </LeafletMap>
    );
  }
}

export default Map;
