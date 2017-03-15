import Google from 'google-maps-react'
import GoogleApiComponent from './GoogleApiComponent'
import Marker from './components/Marker'
import React, {PropTypes as T} from 'react'
import ReactDOM from 'react-dom'
import { camelize } from './lib/String'
import {makeCancelable} from './lib/cancelablePromise'
import invariant from 'invariant'

const mapStyles = {
  container: {
    position: 'absolute',
    width: '800px',
    height: '800px'
  },
  map: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
}

const evtNames = [
  'ready',
  'click',
  'dragend',
  'recenter',
  'bounds_changed',
  'center_changed',
  'dblclick',
  'dragstart',
  'heading_change',
  'idle',
  'maptypeid_changed',
  'mousemove',
  'mouseout',
  'mouseover',
  'projection_changed',
  'resize',
  'rightclick',
  'tilesloaded',
  'tilt_changed',
  'zoom_changed'
]

class Map extends React.Component {
    constructor(props) {
        super(props)
        invariant(props.hasOwnProperty('google'),
                    '`google` prop.')
        this.listeners = {}
        this.state = {
          currentLocation: {
            lat: this.props.initialCenter.lat,
            lng: this.props.initialCenter.lng
          },
          activeUsersOnline: this.props.activeUsersOnline
        }
    }

    componentDidMount() {
      if (this.props.centerAroundCurrentLocation) {
        if (navigator && navigator.geolocation) {
          this.geoPromise = makeCancelable(
            new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject)
            })
          )

        this.geoPromise.promise.then(pos => {
            const coords = pos.coords
            this.setState({
              currentLocation: {
                lat: coords.latitude,
                lng: coords.longitude
              }
            })
          }).catch(e => e)
        }
      }
      this.loadMap()
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps.google !== this.props.google) {
        this.loadMap()
      }
      if (this.props.visible !== prevProps.visible) {
        this.restyleMap()
      }
      if (this.props.zoom !== prevProps.zoom) {
        this.map.setZoom(this.props.zoom)
      }
      if (this.props.center !== prevProps.center) {
        this.setState({
          currentLocation: this.props.center
        })
      }
      if (prevState.currentLocation !== this.state.currentLocation) {
        this.recenterMap()
      }
    }

    componentWillUnmount() {
      const {google} = this.props
      if (this.geoPromise) {
        this.geoPromise.cancel()
      }
      Object.keys(this.listeners).forEach(e => {
        google.maps.event.removeListener(this.listeners[e])
      })
    }

    loadMap() {
      if (this.props && this.props.google) {
        const {google} = this.props
        const maps = google.maps

        const mapRef = this.refs.map
        const node = ReactDOM.findDOMNode(mapRef)
        const curr = this.state.currentLocation
        const center = new maps.LatLng(curr.lat, curr.lng)

        const mapTypeIds = this.props.google.maps.MapTypeId || {}
        const mapTypeFromProps = String(this.props.mapType).toUpperCase()

        const mapConfig = Object.assign({}, {
          mapTypeId: mapTypeIds[mapTypeFromProps],
          center: center,
          zoom: this.props.zoom,
          maxZoom: this.props.maxZoom,
          minZoom: this.props.maxZoom,
          clickableIcons: this.props.clickableIcons,
          disableDefaultUI: this.props.disableDefaultUI,
          zoomControl: this.props.zoomControl,
          mapTypeControl: this.props.mapTypeControl,
          scaleControl: this.props.scaleControl,
          streetViewControl: this.props.streetViewControl,
          panControl: this.props.panControl,
          rotateControl: this.props.rotateControl,
          scrollwheel: this.props.scrollwheel,
          draggable: this.props.draggable,
          keyboardShortcuts: this.props.keyboardShortcuts,
          disableDoubleClickZoom: this.props.disableDoubleClickZoom,
          noClear: this.props.noClear,
          styles: this.props.styles,
          gestureHandling: this.props.gestureHandling
        })

        Object.keys(mapConfig).forEach((key) => {
          if (mapConfig[key] == null) {
            delete mapConfig[key]
          }
        })

        this.map = new maps.Map(node, mapConfig)

        evtNames.forEach(e => {
          this.listeners[e] = this.map.addListener(e, this.handleEvent(e))
        })
        maps.event.trigger(this.map, 'ready')
        this.forceUpdate()
      }
    }

    handleEvent(evtName) {
      let timeout
      const handlerName = `on${camelize(evtName)}`

      return (e) => {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        timeout = setTimeout(() => {
          if (this.props[handlerName]) {
            this.props[handlerName](this.props, this.map, e)
          }
        }, 0)
      }
    }

    recenterMap() {
        const map = this.map

        const {google} = this.props
        const maps = google.maps

        if (!google) return

        if (map) {
          let center = this.state.currentLocation
          if (!(center instanceof google.maps.LatLng)) {
            center = new google.maps.LatLng(center.lat, center.lng)
          }
          map.setCenter(center)
          maps.event.trigger(map, 'recenter')
        }
    }

    restyleMap() {
      if (this.map) {
        const {google} = this.props
        google.maps.event.trigger(this.map, 'resize')
      }
    }

    renderChildren() {
      const {children} = this.props

      if (!children) return

      return React.Children.map(children, c => {
        return React.cloneElement(c, {
          map: this.map,
          google: this.props.google,
          mapCenter: this.state.currentLocation,
          activeUsersOnline: this.state.activeUsersOnline
        })
      })
    }

    render() {
      const style = Object.assign({}, mapStyles.map, this.props.style, {
        display: this.props.visible ? 'inherit' : 'none'
      })

      const containerStyles = Object.assign({},
        mapStyles.container, this.props.containerStyle)

      return (
        <div style={containerStyles} className={this.props.className}>
          <div style={style} ref='map'>
            Loading map...
          </div>
          {this.renderChildren()}
        </div>
      )
    }
}

Map.propTypes = {
  google: T.object,
  activeUsersOnline: T.array,
  zoom: T.number,
  centerAroundCurrentLocation: T.bool,
  center: T.object,
  initialCenter: T.object,
  className: T.string,
  style: T.object,
  containerStyle: T.object,
  visible: T.bool,
  mapType: T.string,
  maxZoom: T.number,
  minZoom: T.number,
  clickableIcons: T.bool,
  disableDefaultUI: T.bool,
  zoomControl: T.bool,
  mapTypeControl: T.bool,
  scaleControl: T.bool,
  streetViewControl: T.bool,
  panControl: T.bool,
  rotateControl: T.bool,
  scrollwheel: T.bool,
  draggable: T.bool,
  keyboardShortcuts: T.bool,
  disableDoubleClickZoom: T.bool,
  noClear: T.bool,
  styles: T.array,
  gestureHandling: T.string
}

evtNames.forEach(e => Map.propTypes[camelize(e)] = T.func)

Map.defaultProps = {
  zoom: 14,
  initialCenter: {
    lat: 33.975863,
    lng: -118.390590
  },
  center: {},
  centerAroundCurrentLocation: false,
  style: {},
  containerStyle: {},
  visible: true
}

export class Container extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeUsersOnline: this.props.locations
        }
    }

    render () {
        return (
            <div>
                <Map google={this.props.google}>
                {this.state.activeUsersOnline.map(function(obj, index) {
                    return (
                        <Marker key={index} position={{lat: obj['lat'], lng: obj['lng']}}>
                        </Marker>
                    )
                })}
                <Marker position={{lat: 33.975863, lng: -118.390590}}></Marker>
                </Map>
            </div>
        )
    }
}

export default GoogleApiComponent({
    apiKey: 'AIzaSyBHmCuq9tiq_-5KMId2tNyWgUEVXQiQ0yg'
})(Container)
